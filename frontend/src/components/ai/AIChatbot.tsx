import { useState } from "react";
import axios from "axios";
import { TreatmentPlan } from "../workflow/ReviewAndFinalize";

// Define Message interface
interface Message {
  role: "user" | "assistant";
  content: string;
}

// Define Props interface
interface ChatbotProps {
  treatmentPlan: TreatmentPlan;
  onUpdate: (updatedTreatment: TreatmentPlan) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ treatmentPlan, onUpdate }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    try {
      const response = await axios.post<{ answer: string }>("/api/chat", {
        messages: newMessages,
        treatmentPlan: treatmentPlan, // Send treatment plan data to AI model
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
          <p
            key={index}
            className={msg.role === "user" ? "text-right text-blue-600" : "text-gray-700"}
          >
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
      <button
        onClick={sendMessage}
        className="w-full mt-2 bg-green-500 text-white py-2 rounded-lg"
      >
        Send
      </button>
    </div>
  );
};

export default Chatbot;
