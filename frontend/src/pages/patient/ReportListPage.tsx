import React, { useEffect, useState } from "react";
import Modal from "../../components/common/Modal";
import PatientService from "../../services/PatientService";
import ReportViewer from "../../components/patient/ReportViewer";

const ReportListPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  useEffect(() => {
    // Get patient ID from localStorage or another reliable source
    const currentPatientId = localStorage.getItem("patient_id");
    if (!currentPatientId) {
      setError("No patient ID found. Please log in or register.");
      return;
    }
    const fetchReports = async () => {
      try {
        const data = await PatientService.getPatientReports(currentPatientId);
        setReports(data);
      } catch (err: any) {
        setError("Failed to load reports");
      }
    };
    fetchReports();
  }, []);

  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-12">
        <h1 className="text-3xl font-bold text-center mb-6">Your Reports</h1>
        {reports.length === 0 ? (
          <div className="text-gray-500 text-center">No reports available.</div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <button
                key={report.id}
                className="block w-full text-left p-4 bg-white rounded shadow hover:bg-blue-50 transition"
                onClick={() => setSelectedReportId(report.id)}
              >
                <div><b>Date:</b> {report.created_at ? new Date(report.created_at).toLocaleDateString() : "N/A"}</div>
                <div><b>Doctor:</b> {report.doctor || "N/A"}</div>
                <div><b>Diagnosis:</b> {report.diagnosis || "N/A"}</div>
                <div><b>Notes:</b> {report.additional_notes || "N/A"}</div>
              </button>
            ))}
          </div>
        )}
        <Modal isOpen={!!selectedReportId} onClose={() => setSelectedReportId(null)}>
          {selectedReportId && (
            // @ts-ignore: ReportViewer expects reportId from useParams, so we mock it
            <ReportViewer reportId={selectedReportId} />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ReportListPage; 