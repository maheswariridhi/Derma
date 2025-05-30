import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PatientCard from "./PatientCard";
import PatientService from '../../services/PatientService';
import { Timestamp } from '../../types/common';
import { BsX } from "react-icons/bs";
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal";
import usePatientDeletion from "../../hooks/usePatientDeletion";
import LoadingSkeleton from "../../components/common/LoadingSkeleton"; 

interface ServicePatient {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  status: string;
  priority?: boolean;
  condition?: string;
  lastVisit?: string;
  created_at?: Timestamp;
  updated_at?: Timestamp;
  treatmentPlan?: {
    diagnosis?: string;
    currentStatus?: string;
    medications?: Array<{ name: string; dosage: string }>;
    nextSteps?: string[];
    next_appointment?: string;
    recommendations?: any[];
    additional_notes?: string;
  };
}

interface Patient extends ServicePatient {
  treatmentValue?: string;
  appointmentDate?: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");
  const [greeting, setGreeting] = useState<string>("");
  const [isUserLoading, setIsUserLoading] = useState(true);
  const hospitalId = "hospital_dermai_01"; // Default hospital ID

  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await PatientService.getPatients();
      const formattedData: Patient[] = Array.isArray(data)
        ? data.map(p => ({
            ...p,
            id: p.id.toString(),
            phone: p.phone || '',
            email: p.email || '',
          }))
        : [];
      setPatients(formattedData);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const {
    isDeleteModalOpen,
    patientToDelete,
    openDeleteModal,
    closeDeleteModal,
    handleDeleteConfirm
  } = usePatientDeletion(
    (deletedPatientId) => {
      setPatients(prev => prev.filter(p => p.id !== deletedPatientId));
    },
    fetchPatients
  );

  // Set greeting and fetch user name
  useEffect(() => {
    // Set greeting based on time of day
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting("Good morning");
    } else if (currentHour < 18) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }

    // Fetch user name from settings
    const fetchUserName = async () => {
      setIsUserLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/hospitals/${hospitalId}/doctors`);
        const doctors = await res.json();
        if (doctors.length > 0) {
          setUserName(doctors[0].name || "");
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setIsUserLoading(false);
      }
    };
    
    fetchUserName();
  }, [hospitalId]);

  // Fetch patients when component mounts and handle visibility changes
  useEffect(() => {
    let isMounted = true;
    
    const fetchPatientsData = async () => {
      if (!isMounted) return;
      await fetchPatients();
    };
    
    fetchPatientsData();

    // Create a function to refresh data when component becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMounted) {
        fetchPatientsData();
      }
    };
    
    // Listen for visibility changes to fetch fresh data when returning to tab
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup function
    return () => { 
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchPatients, refreshKey]);

  const filteredPatients = useMemo(() => {
    return patients.filter(patient =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [patients, searchQuery]);

  const handlePatientClick = (patient: Patient) => {
    localStorage.setItem('patientWorkflowLoading', 'true');
    navigate(`../manage-patient/${patient.id}/workflow`, {
      state: { patient }
    });
  };

  return (
    <div className="flex flex-col p-6">
      <div className="bg-pink-50 rounded-lg p-6 mb-8">
        {isUserLoading ? (
          <div className="h-6 w-64 bg-gray-200 rounded animate-pulse"></div>
        ) : (
          <h1 className="text-xl font-semibold">{greeting}, {userName}</h1>
        )}
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

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredPatients.map((patient) => (
            <div
              key={`${patient.id}-${refreshKey}`}
              className="relative"
              onClick={() => handlePatientClick(patient)}
            >
              <PatientCard patient={patient} onClick={() => handlePatientClick(patient)} />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteModal(patient, e);
                }}
                className="absolute top-4 right-4 text-black p-1 rounded-full hover:bg-gray-100"
                title="Delete patient"
              >
                <BsX size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {patientToDelete && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteConfirm}
          itemType="patient"
          itemName={patientToDelete.name}
          useDialog={false}
        />
      )}
    </div>
  );
};

export default DashboardPage;

