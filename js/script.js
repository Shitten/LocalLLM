const promptText = document.getElementById("prompt");
const send = document.getElementById("send")
 const message = document.getElementById("message");
 const history = document.querySelector('.history');
 const toggle = document.getElementById("toggle");



toggle.addEventListener('click',()=>{
history.classList.toggle('show');

})

send.addEventListener('click', (e)=>{
e.preventDefault();
(async ()=>{
    const response = await fetch('http://100.71.16.54:1234/api/v1/chat',{
    method: 'POST',
    headers:{
    'Content-Type': 'application/json'
},
body: JSON.stringify({
    model: "qwen2.5-7b-instruct",
    input: promptText.value,
    stream: true,
   
})
    })
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    let completeMessage = '';
    
    const generateMessage = document.createElement('div');
    generateMessage.className = 'messageDiv'
    message.appendChild(generateMessage);
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        
        const line = chunk.split("\n").filter(line => line.trim() !== "");
       
        for(const lines of line){
            if(lines.startsWith('data: ')){
        const jsonStr = lines.replace('data: ',"");
        const parsing = JSON.parse(jsonStr);
        
        
        console.log(chunk);
        if(parsing.type ===  "message.delta" && parsing.content){
        completeMessage += parsing.content;
        generateMessage.textContent = completeMessage;
        message.scrollTop = message.scrollHeight;
        };
        
        
            };
        };
        
        
        
    };



generateMessage.innerHTML = marked.parse(completeMessage); 
})()
});
