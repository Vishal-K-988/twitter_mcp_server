import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


const rl =  createInterface({ input, output });

const history = []


// async function 
async function  questionLoop() {

    const question = await rl.question('Ask me anything :  ');

    const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{
        role :"user" , 
        parts : [{
            text : `Generate the response in unique words and in a rude tone . Question : ${question}`,
        }]
    }
    ],
    temperature: 0.5,
  });

//   response text 
  console.log(response.text );


//   maintaining the history 
    history.push({ role: "user", question : {
      text : question  
    }});

  history.push({
    role: "assistant",
    respone_curated : {
       text : response.text
       
    }
  }
)

// logging the history 
console.log("History: ", history);  

console.log(`Hello ${question}!`);   

questionLoop()
}

questionLoop()