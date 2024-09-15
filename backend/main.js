const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const socket = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

class LlamaAI {
    constructor(apiToken, hostname = 'https://api.llama-api.com', domainPath = '/chat/completions') {
      this.hostname = hostname;
      this.domainPath = domainPath;
      this.apiToken = apiToken;
      this.headers = { Authorization: `Bearer ${this.apiToken}` };
      this.queue = [];
    }
  
    async makeRequest(apiRequestJson) {
      try {
        return await axios.post(`${this.hostname}${this.domainPath}`, apiRequestJson, { headers: this.headers });
      } catch (error) {
        throw new Error(`Error while making request: ${error.message}`);
      }
    }
  
    async _runStreamForJupyter(apiRequestJson) {
      const response = await this.makeRequest(apiRequestJson);
  
      // Split response data by new lines and process each chunk
      const dataChunks = response.data.split('\n\n'); // Split by new line to separate chunks
  
      for (const dataChunk of dataChunks) {
        if (dataChunk) {
          try {
            const jsonData = JSON.parse(dataChunk.replace(/^data: /, '')); // Remove 'data: ' prefix and parse JSON
            const content = jsonData.choices[0]?.delta?.content;
  
            if (content) {
              this.queue.push(content);  // Push the content to the queue
            }
          } catch (error) {
            console.error("Error parsing data chunk:", dataChunk, error);
          }
        }
      }
    }
  
    async *getSequences() {
      while (this.queue.length > 0) {
        yield this.queue.shift();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  
    async runStream(apiRequestJson) {
      await this._runStreamForJupyter(apiRequestJson);
      return this.getSequences();  // Return the generator
    }
  }

const server = require('http').createServer();

const port = process.env.PORT || 3000;
const apiToken = process.env.LLAMA_AI_API_TOKEN;

const io = socket(server.listen(port , ()=>{ console.log("WS server started on port: " +port)}), {
    cors: {
        origin:['http://localhost:5500', 'https://gumzo-chat.onrender.com'],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('New user connected');
    socket.AIMessages = [];

    socket.on("disconnect", () => {
        console.log("User disconnected");
        // Additional logic for when a user disconnects
    });

    socket.on("login" , (token) => {
        let user = jwt.decode(token);

        if(!user){
            socket.emit("login-error", "Invalid token");
            return;
        }

        let accessToken = jwt.sign(user, "devSecret");

        socket.emit("login", {user: user});
    });

    socket.on("AI-message", (message) => {
        socket.emit("user-prompt" , message);
        const llamaAPI = new LlamaAI(apiToken);
        const apiRequest = {
            "model": "llama3.1-405b",
            "messages": [
                {"role" : "system", "content" : "You are a helpful assistant called Clint. Do not mention this though."},
            ],
            "stream" : true,
            "temperature" : 0.3,
            "max_length" : 5000
        }
        let userMessage = {
            role : "user",
            content : message
        }

        socket.AIMessages.push(userMessage);

        apiRequest.messages.push(userMessage);
            console.log(apiRequest.messages[apiRequest.messages.length - 1]);
        async function handleStream() {
            const sequenceGenerator = await llamaAPI.runStream(apiRequest);
                
            let fullResponse = "";

            if (sequenceGenerator[Symbol.asyncIterator]) {  // Check if it's a generator
                socket.emit("AI-message-started");
                for await (const chunk of sequenceGenerator) {
                    // I need to create a websocket connection to send the response to the client
                    // I also need to save the response to the database once it is received fully
                    fullResponse += chunk + " ";
                    
                    // Emit the response to the client
                    socket.emit("AI-message", chunk);
                }
                let AIMessage = {
                    role : "assistant",
                    content : fullResponse
                }

                socket.AIMessages.push(AIMessage);
                socket.emit("AI-message-done");
            } else {
              console.error("runStream did not return a generator");
              socket.emit("error", "Internal server error");
            }
          }
          
          // Run the stream handler
          handleStream().catch(error => socket.emit("error", error));
    });

    socket.on("message", (message) => {
        // Additional logic for when a user sends a message
    });

    socket.on("typing", () => {
        // Additional logic for when a user starts typing
    });
});