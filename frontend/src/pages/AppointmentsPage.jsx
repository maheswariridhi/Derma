import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Table from '../components/common/Table';
import PatientService from '../services/PatientService';

const AppointmentsPage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = [
    { key: 'name', label: 'Patient' },
    { key: 'status', label: 'Status' },
    { key: 'treatmentValue', label: 'Treatment Value' },
    { key: 'appointmentDate', label: 'Created Date' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' }
  ];

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await PatientService.getPatients();
        setAppointments(data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handlePatientClick = (patient) => {
    navigate(`/patient/${patient.id}/workflow`, patient.toNavigationState());
  };

  return (
    <div className="p-6">
      <Table 
        headers={headers}
        data={appointments}
        onRowClick={handlePatientClick}
      />
    </div>
  );
};

export default AppointmentsPage;
