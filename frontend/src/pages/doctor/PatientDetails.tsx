import React, { useState, useEffect } from "react";
import PatientCard from "./PatientCard";
import { api } from "../../utils/api";

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
        setLoading(true);
        // Simulate API call to get patient data
        const mockPatientData: Patient = {
          name: "John Doe",
          age: 35,
          condition: "Acne",
          symptoms: ["Redness", "Inflammation"],
          previousTreatments: ["Topical cream", "Oral medication"],
          lastVisit: "2024-03-15",
          allergies: ["Penicillin"],
          currentMedications: ["Retinoid cream"]
        };
        
        setPatientData(mockPatientData);

        const response = await api.post<AIResults>("/api/ai/analyze", {
          patient_name: mockPatientData.name,
          age: mockPatientData.age,
          condition: mockPatientData.condition,
          symptoms: mockPatientData.symptoms,
          previous_treatments: mockPatientData.previousTreatments,
          last_visit: mockPatientData.lastVisit,
          allergies: mockPatientData.allergies || [],
          current_medications: mockPatientData.currentMedications || [],
        });

        setAiResults(response.data);
      } catch (err) {
        setError("Failed to load patient data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
            lastVisit: ""
          }} 
          onClick={() => {}}
          isLoading={loading}
        />
      </section>
    </div>
  );
};

export default PatientDetails;
