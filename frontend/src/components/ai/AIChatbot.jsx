import { useState } from "react";
import axios from "axios";

const Chatbot = ({ context }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    try {
      const response = await axios.post("/api/chat", {
        messages: newMessages,
        context: context,  // Send report data to AI model
      });
      setMessages([...newMessages, { role: "assistant", content: response.data.answer }]);
    } catch (error) {
      console.error("Chatbot error:", error);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <div className="h-40 overflow-y-auto">
        {messages.map((msg, index) => (
          <p key={index} className={msg.role === "user" ? "text-right text-blue-600" : "text-gray-700"}>
            {msg.content}
          </p>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-full p-2 mt-2 border rounded-lg"
        placeholder="Ask about your report..."
      />
      <button onClick={sendMessage} className="w-full mt-2 bg-green-500 text-white py-2 rounded-lg">
        Send
      </button>
    </div>
  );
};

export default Chatbot;
