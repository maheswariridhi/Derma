import React, { useEffect, useState } from "react";
import PatientService from "../../services/PatientService";

const ReportView: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Replace with real patient ID from auth/session
    const currentPatientId = "CURRENT_PATIENT_ID";
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
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-6">Your Reports</h1>
      {reports.length === 0 ? (
        <div className="text-gray-500 text-center">No reports available.</div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="p-4 bg-white rounded shadow">
              <div><b>Date:</b> {report.created_at ? new Date(report.created_at).toLocaleDateString() : "N/A"}</div>
              <div><b>Doctor:</b> {report.doctor || "N/A"}</div>
              <div><b>Diagnosis:</b> {report.diagnosis || "N/A"}</div>
              <div><b>Notes:</b> {report.additional_notes || "N/A"}</div>
              {/* Add more fields as needed */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportView; 