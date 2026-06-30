const promptText = document.getElementById("prompt");
const send = document.getElementById("send");
const message = document.getElementById('message');
const history = document.querySelector('.history');
const toggle = document.getElementById("toggle");
const stopBtn = document.getElementById("stopBtn");
 const save = localStorage.getItem('messageStore');
toggle.addEventListener('click', () => {
  history.classList.toggle('show');
});



function saveHistory(historyMsg) {
  if (!historyMsg) {
    console.warn('saveHistory called with no data, skipping save');
    return;
  }
  localStorage.setItem('storeMessage', JSON.stringify(historyMsg));
  loadHistory();
}

function loadHistory(){
   message.innerHTML = "";
  let arr;
  try {
    arr = JSON.parse(localStorage.getItem('storeMessage')) || [];
  } catch {
    arr = [];
  }
  arr.forEach((msg) =>{
   const saveDiv = document.createElement("div");
  saveDiv.className = "savedMessage";
  saveDiv.textContent = msg.content;   
  message.appendChild(saveDiv);
})

}

loadHistory();
stopBtn.style.display = "none";

send.addEventListener('click', (e) => {
  e.preventDefault();
 send.style.display = "none";
 stopBtn.style.display = "block";
 const controller = new AbortController();
  (async () => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: promptText.value,
        stream: true,
        
      }),
      signal: controller.signal
      
    });

     

promptText.value = '';
   

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    const getStreamContent = (parsing) => {
      if (!parsing) return '';
      if (typeof parsing.content === 'string') return parsing.content;
      if (Array.isArray(parsing.content)) return parsing.content.join('');

      const delta = parsing?.choices?.[0]?.delta ?? parsing?.delta;
      if (delta) {
        if (typeof delta.content === 'string') return delta.content;
        if (Array.isArray(delta.content)) return delta.content.join('');

        if (Array.isArray(delta.message?.content)) {
          return delta.message.content.map(item => typeof item === 'string' ? item : item?.text || '').join('');
        }
      }

      const messageContent = parsing?.message?.content;
      if (Array.isArray(messageContent)) {
        return messageContent.map(item => typeof item === 'string' ? item : item?.text || '').join('');
      }
      if (typeof messageContent === 'string') return messageContent;
      if (Array.isArray(parsing?.message?.content?.parts)) return parsing.message.content.parts.join('');

      return '';
    };

    const renderMessage = (text) => {
      if (window.marked) {
        generateMessage.innerHTML = marked.parse(text);
      } else {
        generateMessage.textContent = text;
      }
    };

    let completeMessage = '';
    let buffer = '';

    const generateMessage = document.createElement('div');
    generateMessage.className = 'messageDiv';
    message.appendChild(generateMessage);


    

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.trim()) continue;
        if (!line.startsWith('data: ')) continue;
        const jsonStr = line.slice(6);
        if (jsonStr === '[DONE]') {
         
          buffer = '';
          
          break;
           
        }
  
stopBtn.onclick= ()=> {
    controller.abort();
      send.style.display = "block";
 stopBtn.style.display = "none";
 
};
        try {
          const parsing = JSON.parse(jsonStr);
          const content = getStreamContent(parsing);
          if (content) {
            completeMessage += content;
            renderMessage(completeMessage);
            message.scrollTop = message.scrollHeight;
          }
          if (parsing?.choices?.[0]?.finish_reason === 'stop') {
            buffer = '';
            break;
            
          }
        } catch (err) {
          console.error('Bad JSON chunk:', jsonStr, err);
        }
      }
    }

    if (buffer.trim()) {
      try {
        const leftover = buffer.startsWith('data: ') ? buffer.slice(6) : buffer;
        const parsing = JSON.parse(leftover);
        const content = getStreamContent(parsing);
        if (content) {
          completeMessage += content;
          renderMessage(completeMessage);
          message.scrollTop = message.scrollHeight;
        }
      } catch (err) {
        console.warn('Leftover buffer could not be parsed', buffer, err);
      }
    }

     
if (completeMessage.trim()) {
 let arr = JSON.parse(localStorage.getItem('storeMessage')) || [];
 let buffers = 
{
id:crypto.randomUUID(),
date:new Date().toLocaleString(),
content:completeMessage,

}

  arr.push(buffers);
  saveHistory(arr);
  
}
   
    send.style.display = "block";
stopBtn.style.display = "none";
  })();
});
