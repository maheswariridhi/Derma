import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PatientService from "../../services/PatientService";
import Table from "../../components/common/Table";

// Define Patient interface
interface Patient {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  condition?: string;
  lastVisit?: string;
}

const PatientDatabasePage: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data: Patient[] = await PatientService.getPatients();
        setPatients(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
        setPatients([]);
      }
    };

    fetchPatients();
  }, []);

  const handlePatientClick = (patient: Patient) => {
    navigate(`/clinic/manage-patient/${patient.id}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Patient Database</h1>
        <button
          onClick={() => navigate("/clinic/manage-patients/new")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add New Patient
        </button>
      </div>
      <Table
        headers={[
          { key: "name", label: "Patient Name" },
          { key: "phone", label: "Phone" },
          { key: "email", label: "Email" },
          { key: "condition", label: "Condition" },
          { key: "lastVisit", label: "Last Visit" },
        ]}
        data={patients}
        onRowClick={handlePatientClick}
      />
    </div>
  );
};

export default PatientDatabasePage;
