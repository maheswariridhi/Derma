import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import PatientService from '../services/PatientService';
import Table from '../components/common/Table';

const AppointmentsPage = () => {
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  // Updated headers with queue-specific columns
  const headers = [
    { key: 'token', label: 'Token' },
    { key: 'name', label: 'Patient' },
    { key: 'status', label: 'Status' },
    { key: 'checkInTime', label: 'Check-in Time' },
    { key: 'actions', label: 'Actions' }
  ];

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const data = await PatientService.getPatients();
        // Sort by check-in time and filter out completed patients
        const sortedQueue = data
          .filter(p => p.status !== 'completed')
          .sort((a, b) => new Date(a.checkInTime) - new Date(b.checkInTime))
          .map((p, index) => ({ ...p, token: index + 1 }));
          
        setQueue(sortedQueue);
      } catch (error) {
        console.error('Error fetching queue:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, []);

  const handleComplete = async (patientId, e) => {
    e.stopPropagation(); // Prevent row click from triggering
    try {
      await PatientService.updatePatientStatus(patientId, 'completed');
      setQueue(prev => prev.filter(p => p.id !== patientId));
    } catch (error) {
      console.error('Error completing patient:', error);
    }
  };

  const handleRowClick = (patient) => {
    navigate(`/patient/${patient.id}/workflow`, {
      state: { patient }
    });
  };

  // Format data for table with status indicators
  const tableData = queue.map(patient => ({
    ...patient,
    status: (
      <span className={`px-2 py-1 rounded ${
        patient.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
        patient.status === 'completed' ? 'bg-green-100 text-green-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {patient.status}
      </span>
    ),
    checkInTime: new Date(patient.checkInTime).toLocaleTimeString(),
    actions: (
      <Button 
        variant="primary" 
        size="sm"
        onClick={(e) => handleComplete(patient.id, e)}
      >
        Mark Complete
      </Button>
    )
  }));

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Patient Queue</h2>
        <p className="text-gray-600 mt-1">
          {queue.length} patients in queue • Current token: #{queue[0]?.token || '--'}
        </p>
      </div>

      <Table
        headers={headers}
        data={tableData}
        onRowClick={handleRowClick}
        loading={loading}
        emptyMessage="No patients in queue"
      />
    </div>
  );
};

export default AppointmentsPage;