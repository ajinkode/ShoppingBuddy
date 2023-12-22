import { Configuration, OpenAIApi } from "openai";
import { process } from "./env";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

let selectedTopic = "none";
let instructionObj;
let conversationArr = [];

//making the topic bubbles work
async function topicBubbles() {
  let smallChatElements = document.querySelectorAll(".small-chat");

  for (let i = 0; i < smallChatElements.length; i++) {
    smallChatElements[i].addEventListener("click", () => {
      selectedTopic = smallChatElements[i].innerText;

      selectedTopic = selectedTopic.substring(3, selectedTopic.length);
      const container = document.getElementById("chatbot-conversation");
      container.innerHTML = "";
      console.log(`selected subject: ${selectedTopic}`);

      const newBubble = document.createElement("div");
      newBubble.classList.add("speech", "speech-ai");
      newBubble.innerHTML =
        "How may I help you with " +
        selectedTopic + "?"
      container.appendChild(newBubble);
      document.getElementById("topic").innerText = "Category: " + selectedTopic;

      instructionObj = {
        role: "system",
        content: `You are ShoppingBuddy, an AI powered chatbot for an ecommerce website, designed to help customers with ${selectedTopic}. Imagine you know everything about this category : ${selectedTopic}, and you will answer the queries of the customers eloquently. Make up stuff as per your convienience, never say "I don't know". Keep your responses accurate and concise. Try to answer in 4 sentences or less.`
      }
      conversationArr.push(instructionObj);
      console.log(conversationArr);

    });

  }
          
}

topicBubbles();

const chatbotConversation = document.getElementById("chatbot-conversation");


addEventListener("submit", (e) => {
  console.log("form submitted");
  e.preventDefault();
  const userInput = document.getElementById("user-input");

  conversationArr.push({
    role: 'user',
    content: userInput.value
  })

  fetchReply();
  
  const newSpeechBubble = document.createElement("div");
  newSpeechBubble.classList.add("speech", "speech-human");
  chatbotConversation.appendChild(newSpeechBubble);
  newSpeechBubble.textContent = userInput.value;
  userInput.value = "";
  chatbotConversation.scrollTop = chatbotConversation.scrollHeight;
});

async function fetchReply() {

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: conversationArr,
      presence_penalty: 0,
      frequency_penalty: 0.3
    })  
    conversationArr.push(response.data.choices[0].message)
    renderTypewriterText(response.data.choices[0].message.content)
}

function renderTypewriterText(text) {
    const newSpeechBubble = document.createElement('div')
    newSpeechBubble.classList.add('speech', 'speech-ai', 'blinking-cursor')
    chatbotConversation.appendChild(newSpeechBubble)
    let i = 0
    const interval = setInterval(() => {
        newSpeechBubble.textContent += text.slice(i-1, i)
        if (text.length === i) {
            clearInterval(interval)
            newSpeechBubble.classList.remove('blinking-cursor')
        }
        i++
        chatbotConversation.scrollTop = chatbotConversation.scrollHeight
    }, 20)
}


// making the startover button work

document.getElementById("clear-btn").addEventListener("click", () => {
  conversationArr = [];
  console.log("new button clicked!");
  chatbotConversation.innerHTML = `
    <div class="speech speech-ai">
						👋Hi I'm <strong>ShoppingBuddy.</strong> I'm here to help you with your shopping needs.
					</div>

					<div class="speech speech-ai">
						How may I help you today? <strong>Please select a category to get started.</strong>
					</div>

					<div class="speech small-chat">
						1. Electronics 📱
					</div>

					<div class="speech small-chat">
						2. Grocery 🥬
					</div>

					<div class="speech small-chat">
						3. Fashion 👚
					</div>

					<div class="speech small-chat">
						4. Home & Furniture 🪑
					</div>`

  
  document.getElementById("topic").innerText = "Category: None selected" ;
  

  topicBubbles();
  console.log("bubbles activated!");
});
