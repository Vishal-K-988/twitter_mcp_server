import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";

const server = new McpServer({
    name: "example-server",
    version: "1.0.0"
});

// ... set up server resources, tools, and prompts ...

const app = express();


// Tools 
// 1. Current time 
// 2. add 2 numbers 
// 3. create a post 

server.tool (
 "getCurrentTime",
 "get the current time in IST ", 
  {zone : z.enum(["IST", "UTC"])},
async (arg) => {
    const { zone } = arg;
    const date = new Date();
    let time;
    if (zone === "IST") {
        time = date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    } else {
        time = date.toUTCString();
    }
    return {
        content: [
            {
                type: "text",
                text: `The current time in ${zone} is ${time}`
            }
        ]
    }
})


server.tool(
    "addTwoNumbers",
    "Add two numbers",
    {
        a: z.number(),
        b: z.number()
    },
    async (arg) => {
        const { a, b } = arg;
        return {
            content: [
                {
                    type: "text",
                    text: `The sum of ${a} and ${b} is ${a + b}`
                }
            ]
        }
    }
)

server.tool(
    "createPost",
    "Create a post on X, earlier known as Twitter.  ", {
    status: z.string()
}, async (arg) => {
    const { status } = arg;
    return createPost(status);
})


// to support multiple simultaneous connections we have a lookup object from
// sessionId to transport
const transports = {};


app.get("/sse", async (req, res) => {
    const transport = new SSEServerTransport('/messages', res);
    transports[ transport.sessionId ] = transport;
    res.on("close", () => {
        delete transports[ transport.sessionId ];
    });
    await server.connect(transport);
});

app.post("/messages", async (req, res) => {
    const sessionId = req.query.sessionId;
    const transport = transports[ sessionId ];
    if (transport) {
        await transport.handlePostMessage(req, res);
    } else {
        res.status(400).send('No transport found for sessionId');
    }
});

app.listen(3001, () => {
    console.log("Server is running on http://localhost:3001");
});