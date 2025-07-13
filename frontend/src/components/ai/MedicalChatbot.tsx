import React, { useState, useEffect, useRef } from 'react';
import MedicalDocumentService, { ChatRequest, ChatResponse, ChatMessage } from '../../services/MedicalDocumentService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface MedicalChatbotProps {
  userId: string;
  patientId?: string;
  sessionId?: string;
  className?: string;
}

const MedicalChatbot: React.FC<MedicalChatbotProps> = ({
  userId,
  patientId,
  sessionId,
  className = ''
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history on component mount
  useEffect(() => {
    loadChatHistory();
  }, [userId, sessionId]);

  const loadChatHistory = async () => {
    try {
      const history = await MedicalDocumentService.getChatHistory(userId, sessionId, 20);
      const formattedMessages: ChatMessage[] = history.history.map((item: any) => ({
        message: item.metadata.message,
        response: item.metadata.response,
        timestamp: item.metadata.created_at,
        session_id: item.metadata.session_id
      }));
      setMessages(formattedMessages.reverse()); // Show oldest first
    } catch (error) {
      console.error('Error loading chat history:', error);
      setError('Failed to load chat history');
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    // Add user message to chat immediately
    const newUserMessage: ChatMessage = {
      message: userMessage,
      response: '',
      timestamp: new Date().toISOString(),
      session_id: sessionId
    };

    setMessages(prev => [...prev, newUserMessage]);

    try {
      const chatRequest: ChatRequest = {
        message: userMessage,
        user_id: userId,
        session_id: sessionId,
        patient_id: patientId
      };

      const response: ChatResponse = await MedicalDocumentService.chat(chatRequest);

      // Update the last message with the AI response
      setMessages(prev => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0) {
          updated[lastIndex] = {
            ...updated[lastIndex],
            response: response.response,
            session_id: response.session_id
          };
        }
        return updated;
      });

    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      
      // Remove the user message if it failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          Medical Assistant
        </CardTitle>
        <p className="text-sm text-gray-600">
          Ask me about your health, medications, or medical documents
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          <div className="space-y-4 pb-4">
            {messages.length === 0 && !isLoading && (
              <div className="text-center text-gray-500 py-8">
                <Bot className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Start a conversation with your medical assistant</p>
                <p className="text-sm mt-1">I can help with health questions, medication info, and document analysis</p>
              </div>
            )}

            {messages.map((message, index) => (
              <div key={index} className="space-y-2">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-[80%]">
                    <p className="text-sm">{message.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {formatTimestamp(message.timestamp)}
                    </p>
                  </div>
                </div>

                {/* AI Response */}
                {message.response && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-[80%]">
                      <div className="flex items-start gap-2">
                        <Bot className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm whitespace-pre-wrap">{message.response}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimestamp(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Error Message */}
        {error && (
          <div className="px-4 pb-2">
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your health question..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="icon"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicalChatbot; 