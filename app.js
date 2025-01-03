const express = require("express");
const { createCompletion, loadModel } = require("gpt4all");
const app = express();
const PORT = process.env.PORT || 3000;
const chats = [];
app.listen(PORT, () => {
  console.log("listening on " + PORT);
  console.log("loading llm model...");
  loadLLM("replit-code-v1_5-3b-newbpe-q4_0.gguf").then((llm) => {
    console.log("loaded");
    app.get("/create/:name", async (req, res) => {
      const {name} = req.params;
      const chat = await llm.createChatSession({
        temperature: 0.8,
        systemPrompt: "### System:\nYou are a voice assistant.\n\n",
      });
      chats.push({name, chat});
    });
    app.get("/:name/:msg", async (req, res) => {
      const {name, msg} = req.params; 
      let chat;
      chats.forEach(val => {
        if(val.name == name) chat = val; 
      });
      if(chat){
        const res = await createCompletion(chat, msg);
        res.end(res.choices[0].message.content);
        return;
      }
      else res.end("error");
    });
  });
});

const loadLLM = (name) =>
    loadModel(name, {
    device: "gpu",
    modelPath: "./llm/models",
    librariesPath: "./llm/lib",
  });
