import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientService from '../services/PatientService';
import Table from '../components/common/Table';

const PatientDatabasePage = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = [
    { key: 'name', label: 'Patient Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'treatmentPlan.diagnosis', label: 'Diagnosis' },
    { key: 'treatmentPlan.currentStatus', label: 'Status' },
    { key: 'lastVisit', label: 'Last Visit' }
  ];

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await PatientService.getPatients();
        setPatients(data);
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const handlePatientClick = (patient) => {
    navigate(`/patient/${patient.id}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Patient Database</h1>
        <button 
          onClick={() => navigate('/patient/new')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add New Patient
        </button>
      </div>
      <Table 
        headers={headers}
        data={patients}
        onRowClick={handlePatientClick}
      />
    </div>
  );
};

export default PatientDatabasePage;