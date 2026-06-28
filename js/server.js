require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static("."));
const cors = require("cors");
app.use(cors());
const { Readable } = require("stream");
app.post('/api/chat', async (req,res)=>{
     res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const response = await fetch(process.env.API_URL, {
         method: 'POST',
    headers:{
    'Content-Type': 'application/json'
},
body: JSON.stringify({
    model: process.env.LLM_MODEL,
    messages: [{ role: "user", content: req.body.input }], 
    stream: true,
   
})
    })
  Readable.fromWeb(response.body).pipe(res);
});
  

const PORT = 3000;
app.listen(PORT, "0.0.0.0", ()=>{
    console.log(`Server is running at port ${PORT}`);
});