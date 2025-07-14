import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PatientService from '../../services/PatientService';
import TreatmentInfoService, { TreatmentInfo } from '../../services/TreatmentInfoService';
import { Timestamp } from '../../types/common';
import { MdExpandMore, MdExpandLess } from 'react-icons/md';

interface Message {
  id: string;
  sender: 'patient' | 'doctor';
  content: string;
  timestamp: Timestamp;
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
  ai_summary?: string;
  ai_explanation?: string;
}

// Accept optional reportId prop
interface ReportViewerProps {
  reportId?: string;
}

const ReportViewer: React.FC<ReportViewerProps> = ({ reportId: propReportId }) => {
  const { reportId: routeReportId } = useParams<{ reportId: string }>();
  const reportId = propReportId || routeReportId;
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string>('');
  const [educationalContent, setEducationalContent] = useState<TreatmentInfo[]>([]);
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});
  const [loadingContent, setLoadingContent] = useState<{ [key: string]: boolean }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) {
        setError('No report ID provided');
        setLoading(false);
        return;
      }
      
      try {
        const reportData = await PatientService.getReportById(reportId);
        setReport(reportData);
      } catch (error) {
        setError('Failed to load report');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
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
      await PatientService.sendMessageToReport(reportId, newMessage, 'patient');
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
  
  const fetchEducationalContent = async (itemType: 'treatment' | 'medicine', itemId: string) => {
    const key = `${itemType}-${itemId}`;
    setLoadingContent(prev => ({ ...prev, [key]: true }));
    
    try {
      const content = await TreatmentInfoService.getTreatmentInfo(itemType, itemId);
      setEducationalContent(prev => {
        const filtered = prev.filter(item => !(item.item_type === itemType && item.item_id === itemId));
        return [...filtered, content];
      });
    } catch (error) {
      console.error(`Error fetching educational content for ${itemType} ${itemId}:`, error);
    } finally {
      setLoadingContent(prev => ({ ...prev, [key]: false }));
    }
  };

  const toggleExpanded = (itemType: string, itemId: string | number) => {
    const key = `${itemType}-${itemId}`;
    setExpandedItems(prev => ({ ...prev, [key]: !prev[key] }));
    
    // Fetch content if not already loaded
    const content = educationalContent.find(
      item => item.item_type === itemType && item.item_id === itemId.toString()
    );
    
    if (!content && !loadingContent[key]) {
      fetchEducationalContent(itemType as 'treatment' | 'medicine', itemId.toString());
    }
  };

  const getEducationalContent = (itemType: string, itemId: string | number) => {
    return educationalContent.find(
      item => item.item_type === itemType && item.item_id === itemId.toString()
    );
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
          onClick={() => navigate('/patient/dashboard')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button 
        onClick={() => navigate('/patient/dashboard')}
        className="text-blue-500 hover:text-blue-700 flex items-center gap-1 mb-6"
      >
        ← Back to Dashboard
      </button>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-500 text-white p-4">
          <h1 className="text-xl font-bold">Treatment Report</h1>
          <p className="text-sm">
            {report.created_at 
              ? new Date(report.created_at.toDate()).toLocaleDateString() 
              : 'Date not available'}
          </p>
          <p className="text-sm">Doctor: {report.doctor || 'Unknown'}</p>
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

          {/* AI Summary and Explanation */}
          {report.ai_summary && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2 text-blue-700">AI Summary</h2>
              <p className="text-gray-800 whitespace-pre-line">{report.ai_summary}</p>
            </div>
          )}
          {report.ai_explanation && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2 text-blue-700">AI Explanation</h2>
              <p className="text-gray-800 whitespace-pre-line">{report.ai_explanation}</p>
            </div>
          )}
          
          <h2 className="text-lg font-semibold mb-4">Medications</h2>
          {report.medications && report.medications.length > 0 ? (
            <div className="space-y-3 mb-6">
              {report.medications.map((med, index) => {
                const content = getEducationalContent("medicine", med.name);
                const isExpanded = expandedItems[`medicine-${med.name}`];
                const isLoading = loadingContent[`medicine-${med.name}`];
                
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{med.name}</span>
                        {med.dosage && <span> - {med.dosage}</span>}
                      </div>
                      <button
                        onClick={() => toggleExpanded("medicine", med.name)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        ) : isExpanded ? (
                          <MdExpandLess className="w-4 h-4" />
                        ) : (
                          <MdExpandMore className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    
                    {/* Educational Content */}
                    {isExpanded && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <h5 className="text-sm font-medium text-blue-800 mb-2">About this medication</h5>
                        {isLoading ? (
                          <div className="text-sm text-gray-600">Loading educational content...</div>
                        ) : content ? (
                          <div className="text-sm text-gray-700 whitespace-pre-line">{content.explanation}</div>
                        ) : (
                          <div className="text-sm text-gray-600">No educational content available.</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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

          {/* Treatments Section */}
          {report.selectedTreatments && report.selectedTreatments.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Treatments</h2>
              <div className="space-y-3">
                {report.selectedTreatments.map((treatment: any, index: number) => {
                  const content = getEducationalContent("treatment", treatment.id || treatment.name);
                  const isExpanded = expandedItems[`treatment-${treatment.id || treatment.name}`];
                  const isLoading = loadingContent[`treatment-${treatment.id || treatment.name}`];
                  
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{treatment.name}</span>
                        </div>
                        <button
                          onClick={() => toggleExpanded("treatment", treatment.id || treatment.name)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          {isLoading ? (
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          ) : isExpanded ? (
                            <MdExpandLess className="w-4 h-4" />
                          ) : (
                            <MdExpandMore className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      
                      {/* Educational Content */}
                      {isExpanded && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <h5 className="text-sm font-medium text-blue-800 mb-2">About this treatment</h5>
                          {isLoading ? (
                            <div className="text-sm text-gray-600">Loading educational content...</div>
                          ) : content ? (
                            <div className="text-sm text-gray-700 whitespace-pre-line">{content.explanation}</div>
                          ) : (
                            <div className="text-sm text-gray-600">No educational content available.</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chat Section */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Questions for Doctor</h2>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gray-50 p-4 border-b">
                <h3 className="font-medium">Chat with your doctor</h3>
                <p className="text-sm text-gray-500">Ask questions about your treatment</p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 border-b" style={{ maxHeight: '400px' }}>
                {report.messages && report.messages.length > 0 ? (
                  report.messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`mb-4 flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[90%] p-3 rounded-lg ${
                          message.sender === 'patient' 
                            ? 'bg-blue-500 text-white rounded-br-none' 
                            : 'bg-gray-200 text-gray-800 rounded-bl-none'
                        }`}
                      >
                        <p>{message.content}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs opacity-70">
                            {message.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {message.sender === 'patient' && (
                            <span className="text-xs opacity-70">
                              {message.readByDoctor ? 'Read' : 'Sent'}
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
                  placeholder="Type your question here..."
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
    </div>
  );
};

export default ReportViewer;