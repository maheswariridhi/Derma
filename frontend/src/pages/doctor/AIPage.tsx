import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import MedicalChatbot from '../../components/ai/MedicalChatbot';
import MedicalDocumentManager from '../../components/ai/MedicalDocumentManager';
import { Bot, FileText, MessageSquare, Brain } from 'lucide-react';

const AIPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
          <p className="text-gray-600">Medical document analysis and intelligent chatbot</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Medical Chatbot
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Document Manager
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                Medical Assistant Chat
              </CardTitle>
              <p className="text-sm text-gray-600">
                Ask questions about medical conditions, treatments, or get help with documentation
              </p>
            </CardHeader>
            <CardContent>
              <MedicalChatbot
                userId="doctor_user"
                className="h-[600px]"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Medical Document Management
              </CardTitle>
              <p className="text-sm text-gray-600">
                Upload, analyze, and search medical documents with AI-powered insights
              </p>
            </CardHeader>
            <CardContent>
              <MedicalDocumentManager
                doctorId="doctor_user"
                className="space-y-6"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIPage; 