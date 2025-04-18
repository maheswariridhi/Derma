import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PatientService from '../../services/PatientService';
import { Timestamp } from '../../types/common';

interface Message {
  id: string;
  sender: 'patient' | 'doctor';
  content: string;
  timestamp: Timestamp;
  readByDoctor?: boolean;
  readByPatient?: boolean;
}

interface Report {
  id?: string;
  patientId: string;
  diagnosis?: string;
  diagnosisDetails?: string;
  medications?: Array<{ name: string; dosage: string }>;
  nextSteps?: string[];
  next_appointment?: string;
  recommendations?: any[];
  additional_notes?: string;
  selectedTreatments?: any[];
  selectedMedicines?: any[];
  created_at?: Timestamp;
  doctor?: string;
  messages?: Message[];
}

const DoctorReportViewer: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [patient, setPatient] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReportAndPatient = async () => {
      if (!reportId) {
        setError('No report ID provided');
        setLoading(false);
        return;
      }
      
      try {
        const reportData = await PatientService.getReportById(reportId);
        setReport(reportData);
        
        // Mark all patient messages as read by doctor
        if (reportData.messages && reportData.messages.length > 0) {
          const updatedMessages = reportData.messages.map(msg => {
            if (msg.sender === 'patient' && !msg.readByDoctor) {
              return { ...msg, readByDoctor: true };
            }
            return msg;
          });
          
          // Update the messages in the database
          const reportRef = reportData.id;
          if (reportRef) {
            await PatientService.updateReportMessages(reportRef, updatedMessages);
          }
        }
        
        // Fetch patient information
        if (reportData.patientId) {
          const patientData = await PatientService.getPatientById(reportData.patientId);
          setPatient(patientData);
        }
      } catch (error) {
        setError('Failed to load report');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportAndPatient();
  }, [reportId]);
  
  useEffect(() => {
    // Scroll to bottom of messages when messages change
    scrollToBottom();
  }, [report?.messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !reportId) return;
    
    try {
      await PatientService.sendMessageToReport(reportId, newMessage, 'doctor');
      // Fetch the report again to get the updated messages
      const updatedReport = await PatientService.getReportById(reportId);
      setReport(updatedReport);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error || !report) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 p-4 rounded-lg text-red-600 mb-6">
          {error || 'Report not found'}
        </div>
        <button 
          onClick={() => navigate('/clinic/dashboard')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button 
        onClick={() => navigate('/clinic/dashboard')}
        className="text-blue-500 hover:text-blue-700 flex items-center gap-1 mb-6"
      >
        ← Back to Dashboard
      </button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-blue-500 text-white p-4">
              <h1 className="text-xl font-bold">Treatment Report</h1>
              <p className="text-sm">
                {report.created_at 
                  ? new Date(report.created_at.toDate()).toLocaleDateString() 
                  : 'Date not available'}
              </p>
              {patient && (
                <p className="text-sm font-medium mt-1">Patient: {patient.name || 'Unknown'}</p>
              )}
            </div>
            
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Diagnosis</h2>
              <p className="mb-6">{report.diagnosis || 'No diagnosis specified'}</p>
              
              {report.diagnosisDetails && (
                <div className="mb-6">
                  <h3 className="text-md font-medium mb-2">Details</h3>
                  <p className="text-gray-700">{report.diagnosisDetails}</p>
                </div>
              )}
              
              <h2 className="text-lg font-semibold mb-4">Medications</h2>
              {report.medications && report.medications.length > 0 ? (
                <ul className="list-disc pl-5 mb-6">
                  {report.medications.map((med, index) => (
                    <li key={index}>
                      <span className="font-medium">{med.name}</span>
                      {med.dosage && <span> - {med.dosage}</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mb-6 text-gray-500">No medications prescribed</p>
              )}
              
              <h2 className="text-lg font-semibold mb-4">Next Steps</h2>
              {report.nextSteps && report.nextSteps.length > 0 ? (
                <ul className="list-disc pl-5 mb-6">
                  {report.nextSteps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              ) : (
                <p className="mb-6 text-gray-500">No next steps provided</p>
              )}
              
              {report.next_appointment && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Next Appointment</h2>
                  <p>{report.next_appointment}</p>
                </div>
              )}
              
              {report.additional_notes && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Additional Notes</h2>
                  <p className="text-gray-700">{report.additional_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
            <div className="bg-gray-50 p-4 border-b">
              <h2 className="font-semibold">Patient Communication</h2>
              <p className="text-sm text-gray-500">Respond to patient questions</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 border-b" style={{ maxHeight: '400px' }}>
              {report.messages && report.messages.length > 0 ? (
                report.messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`mb-4 flex ${message.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[90%] p-3 rounded-lg ${
                        message.sender === 'doctor' 
                          ? 'bg-blue-500 text-white rounded-br-none' 
                          : 'bg-gray-200 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      <p>{message.content}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {message.sender === 'doctor' && (
                          <span className="text-xs opacity-70">
                            {message.readByPatient ? 'Read' : 'Sent'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No messages yet
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here..."
                className="w-full p-2 border border-gray-300 rounded-lg resize-none min-h-[80px]"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="w-full mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorReportViewer;