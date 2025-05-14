import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {SSEClientTransport} from "@modelcontextprotocol/sdk/client/sse.js"



dotenv.config();




// creating the CLIENT 
 const client = new Client({
      name: "twitter-client",
      version: "1.0.0"
    });


    // Connect to the MCP server
await client.connect(new SSEClientTransport(new URL ("http://localhost:3001/sse")))
  .then(async () => {
    console.log('Connected to MCP server');
   const tools = await client.listTools();
    
    console.log('Available tools:', tools);
    
  })
  .catch((error) => {
    console.error('Error connecting to MCP server:', error);
  });




const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// Initialize the MCP client with the transport


const rl =  createInterface({ input, output });

const history = []


// Defining the function declearation for the model ! 
// refer to Gemini model ! 

const currentTime = {
  name : "get_current_time",
  description : "Get the current time in IST", 
  parameters : {
    type : "object" ,
    properties : {
      zone : {
        type : "string",
        enum : ["IST", "UTC"] 
      },    
  },
  required : ["zone"]
}
}


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
    config : {
      tools :[{
        functionDeclarations : [currentTime]
      }]
    },
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