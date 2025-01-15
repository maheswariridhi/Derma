import React from "react";
import { useParams } from "react-router-dom";
import AIRecommendationPanel from "../components/ai/AIRecommendationPanel";

const PatientsPage = () => {
  const { patientSlug } = useParams();

  // Mock data - replace with actual API call
  const patientData = {
    name: "John Doe",
    age: 45,
    condition: "Eczema",
    symptoms: ["itching", "redness", "dry skin"],
    previousTreatments: ["topical steroids", "moisturizers"],
    lastVisit: "2024-02-15",
    allergies: ["peanuts"],
    currentMedications: ["hydrocortisone cream"],
    treatmentPlan: {
      diagnosis: "Moderate Atopic Dermatitis",
      currentStatus: "Under Treatment",
      nextSteps: ["Continue current medication", "Monitor for improvements"],
      medications: [
        { name: "Hydrocortisone Cream", dosage: "Apply twice daily" },
        { name: "Moisturizer", dosage: "Apply as needed" }
      ]
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Patient Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{patientData.name}</h1>
        <p className="mt-2 text-sm text-gray-600">Patient ID: {patientSlug}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Patient Details & Treatment Plan */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Status */}
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Current Status</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Diagnosis</h3>
                <p className="mt-1">{patientData.treatmentPlan.diagnosis}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1">{patientData.treatmentPlan.currentStatus}</p>
              </div>
            </div>
          </section>

          {/* Treatment Plan */}
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Treatment Plan</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Current Medications</h3>
                <ul className="mt-2 divide-y divide-gray-200">
                  {patientData.treatmentPlan.medications.map((med, index) => (
                    <li key={index} className="py-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{med.name}</span>
                        <span className="text-gray-600">{med.dosage}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Next Steps</h3>
                <ul className="mt-2 list-disc list-inside">
                  {patientData.treatmentPlan.nextSteps.map((step, index) => (
                    <li key={index} className="text-gray-600">{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - AI Recommendations */}
        <div className="lg:col-span-1">
          <AIRecommendationPanel patientData={patientData} />
        </div>
      </div>
    </div>
  );
};

export default PatientsPage;