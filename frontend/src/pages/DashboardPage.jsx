import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PatientCard from "../components/PatientCard";

const DashboardPage = () => {
  const navigate = useNavigate();
  const userName = "Ridhi Maheswari";
  const casesToFollow = 16;

  // State for patients and search
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Simulating fetching data
    const fetchPatients = async () => {
      const mockData = [
        { id: 1, name: "Nancy Out of Network", time: "11/18/2024", status: "Saved", phone: "(855) 369-8746", email: "No email" },
        { id: 2, name: "Candi Copay", time: "11/18/2024", status: "Pending", phone: "(245) 698-3265", email: "No email" },
        { id: 3, name: "Allen Allowed", time: "11/18/2024", status: "Completed", phone: "(253) 687-9654", email: "No email" },
        { id: 4, name: "Marvin Medicaid", time: "11/18/2024", status: "Saved", phone: "(585) 484-6245", email: "No email" },
      ];
      setPatients(mockData);
    };
    fetchPatients();
  }, []);

  const handlePatientClick = (patientId) => {
    navigate(`/patient/${patientId}`);
  };

  const handleStatusChange = (patientId, newStatus) => {
    setPatients((prev) =>
      prev.map((patient) =>
        patient.id === patientId ? { ...patient, status: newStatus } : patient
      )
    );
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Welcome Banner */}
      <div className="bg-pink-50 rounded-lg p-6 mb-8">
        <h1 className="text-xl font-semibold">Good evening, {userName}</h1>
        <p className="text-gray-600 mt-2">
          I've surfaced {casesToFollow} cases to follow up on today.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search patients by name or status"
          className="w-full p-2 border border-gray-300 rounded"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Treatment Plans Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Treatment Plans to Customize</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onClick={() => handlePatientClick(patient.id)}
                onStatusChange={handleStatusChange}
              />
            ))
          ) : (
            <p className="text-gray-500">No patients found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
