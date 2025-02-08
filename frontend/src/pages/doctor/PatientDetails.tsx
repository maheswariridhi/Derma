import React, { useState, useEffect } from "react";
import AIRecommendationPanel from "../../components/ai/AIChatbot";
import AIRecommendations from "../../components/ai/AIRecommendations";
import PatientCard from "./PatientCard";
import { api } from "../../utils/api"; // Fixed import path

// Define Patient interface
interface Patient {
  name: string;
  age: number;
  condition: string;
  symptoms: string[];
  previousTreatments: string[];
  lastVisit: string;
  allergies?: string[];
  currentMedications?: string[];
}

// Define AIResults interface
interface AIResults {
  diagnosis: string;
  treatment_plan: string;
}

const PatientDetails: React.FC = () => {
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [aiResults, setAiResults] = useState<AIResults | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch patient data and AI results once
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!patientData) return;

        setLoading(true);
        const response = await api.post<AIResults>("/api/ai/analyze", {
          patient_name: patientData.name,
          age: patientData.age,
          condition: patientData.condition,
          symptoms: patientData.symptoms,
          previous_treatments: patientData.previousTreatments,
          last_visit: patientData.lastVisit,
          allergies: patientData.allergies || [],
          current_medications: patientData.currentMedications || [],
        });

        setAiResults(response.data);
      } catch (err) {
        setError("Failed to load AI analysis");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (patientData) {
      fetchData();
    }
  }, [patientData]);

  if (error) return <div>Error: {error}</div>;
  if (!patientData || !aiResults) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Patient Info Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
        <PatientCard patient={patientData} />
      </section>

      {/* AI Analysis Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">AI Analysis</h2>
        <div className="space-y-6">
          {/* Pass only diagnosis data to Panel */}
          <AIRecommendationPanel diagnosisData={aiResults.diagnosis} />
          {/* Pass only treatment data to Recommendations */}
          <AIRecommendations treatmentData={aiResults.treatment_plan} />
        </div>
      </section>
    </div>
  );
};

export default PatientDetails;
