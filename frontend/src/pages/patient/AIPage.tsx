import React, { useEffect } from "react";
import MedicalChatbot from "../../components/ai/MedicalChatbot";
import MedicalDocumentManager from "../../components/ai/MedicalDocumentManager";

const patientId = localStorage.getItem("patient_id") || "patient_user";

const PatientAIPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold mb-4">AI Assistant</h1>
      <MedicalChatbot userId={patientId} className="h-[600px]" />
      <MedicalDocumentManager patientId={patientId} className="space-y-6" />
    </div>
  );
};

export default PatientAIPage; 