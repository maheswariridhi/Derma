import React, { useState, useEffect } from "react";
import PatientCard from "./PatientCard";
import { api } from "../../utils/api";
import { useParams } from "react-router-dom";

// Define Patient interface
interface Patient {
  id: string;
  name: string;
  status: string;
  phone?: string;
  email?: string;
  condition?: string;
  lastVisit?: string;
  treatmentPlan?: {
    diagnosis?: string;
    currentStatus?: string;
    medications?: Array<{ name: string; dosage: string }>;
    nextSteps?: string[];
    next_appointment?: string;
    recommendations?: any[];
    additional_notes?: string;
  };
  // Additional fields for AI analysis
  age?: number;
  symptoms?: string[];
  previousTreatments?: string[];
  allergies?: string[];
  currentMedications?: string[];
}

// Define AIResults interface
interface AIResults {
  diagnosis: string;
  treatment_plan: string;
}

const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [aiResults, setAiResults] = useState<AIResults | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!id) {
          setError("Missing patient ID");
          setLoading(false);
          return;
        }
        // Fetch patient data from backend
        const response = await api.get<Patient>(`/api/patients/${id}`);
        setPatientData(response.data);

        // Fetch AI results for the patient
        const aiResponse = await api.post<AIResults>("/api/ai/analyze", {
          patient_name: response.data.name,
          age: response.data.age,
          condition: response.data.condition,
          symptoms: response.data.symptoms,
          previous_treatments: response.data.previousTreatments,
          last_visit: response.data.lastVisit,
          allergies: response.data.allergies || [],
          current_medications: response.data.currentMedications || [],
        });
        setAiResults(aiResponse.data);
      } catch (err) {
        setError("Failed to load patient data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Patient Info Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
        <PatientCard 
          patient={patientData || {
            id: "loading",
            name: "",
            status: "loading",
            phone: "",
            email: "",
            condition: "",
            lastVisit: "",
            treatmentPlan: undefined
          }}
          onClick={() => {}}
          isLoading={loading}
        />
      </section>
    </div>
  );
};

export default PatientDetails;
