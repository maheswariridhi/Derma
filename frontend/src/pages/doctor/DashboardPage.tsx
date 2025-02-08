import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PatientCard from "./PatientCard";
import PatientService from '../../services/PatientService';

interface TreatmentPlan {
  diagnosis: string;
  diagnosisDetails?: string;
  medications?: Array<{ name: string; dosage: string }>;
  nextSteps?: string[];
  next_appointment?: string;
  recommendations?: any[];
  additional_notes?: string;
}

interface Patient {
  id: string | number;
  name: string;
  status: string;
  treatmentValue?: string;
  appointmentDate?: string;
  phone: string;
  email: string;
  treatmentPlan?: TreatmentPlan;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const userName = "Ridhi Maheswari";

  // State for patients and search
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await PatientService.getPatients();
        setPatients(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setPatients([]);
      }
    };

    fetchPatients();
  }, []);

  const handlePatientClick = (patient: Patient) => {
    navigate(`/clinic/manage-patient/${patient.id}/workflow`, {
      state: { patient }
    });
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col p-6">
      <div className="bg-pink-50 rounded-lg p-6 mb-8">
        <h1 className="text-xl font-semibold">Good evening, {userName}</h1>
        <p className="text-gray-600 mt-2">
          You've got {patients.length} cases to follow up on today.
        </p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search patients by name"
          className="w-full p-2 border border-gray-300 rounded"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredPatients.map((patient) => (
          <PatientCard
            key={patient.id}
            patient={patient}
            onClick={() => handlePatientClick(patient)}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;