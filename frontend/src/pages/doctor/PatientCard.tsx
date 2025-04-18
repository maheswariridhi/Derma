import React from 'react';

interface TreatmentPlan {
  diagnosis?: string;
  currentStatus?: string;
  medications?: Array<{ name: string; dosage: string }>;
  nextSteps?: string[];
  next_appointment?: string;
  recommendations?: any[];
  additional_notes?: string;
}

interface Patient {
  id: string;
  name: string;
  status: string;
  phone?: string;
  email?: string;
  condition?: string;
  lastVisit?: string;
  treatmentPlan?: TreatmentPlan;
}

interface PatientCardProps {
  patient: Patient;
  onClick: (patient: Patient) => void;
  isLoading?: boolean;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onClick, isLoading = false }) => {
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-40"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => onClick(patient)}
      className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100 hover:border-pink-200 transform hover:scale-[1.02] h-full relative"
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick(patient);
        }
      }}
    >
      {/* Header Section */}
      <div className="flex justify-between items-start mb-4 pr-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1 transition-colors duration-200">{patient.name}</h3>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)} transition-colors duration-200`}>
            {patient.status}
          </span>
        </div>
        <div className="text-right">
          {patient.condition && <p className="text-sm font-medium text-gray-900 transition-colors duration-200">{patient.condition}</p>}
          {patient.lastVisit && <p className="text-xs text-gray-500 transition-colors duration-200">Last visit: {patient.lastVisit}</p>}
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-2">
        {patient.phone && (
          <div className="flex items-center text-gray-600 transition-colors duration-200">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {patient.phone}
          </div>
        )}
        {patient.email && (
          <div className="flex items-center text-gray-600 transition-colors duration-200">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {patient.email}
          </div>
        )}
      </div>

      {/* Treatment Info - if available */}
      {patient.treatmentPlan?.diagnosis && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 transition-colors duration-200">Treatment Plan</p>
          <p className="text-sm text-gray-700 mt-1 transition-colors duration-200">{patient.treatmentPlan.diagnosis}</p>
        </div>
      )}
    </div>
  );
};

export default PatientCard;
