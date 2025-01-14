import React, { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import TreatmentSteps from "../components/TreatmentSteps";
import TreatmentVisit from "../components/TreatmentVisit";

const PatientTreatmentPlan = () => {
  const { patientSlug } = useParams();
  const location = useLocation();
  const patientData = location.state;
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const visits = [
    {
      number: 1,
      title: `Initial visit for ${patientData?.patient || 'patient'}`,
      description: "During your first visit, we'll prepare the adjacent teeth (teeth 18 and 20) by gently shaping them to fit the crowns that will support your new bridge. We'll take precise impressions to create a custom bridge that matches your natural teeth."
    },
    {
      number: 2,
      title: "Final restoration visit",
      description: "At your second visit, we'll remove the temporary bridge and carefully fit your new, permanent bridge. We'll make any necessary adjustments to ensure a perfect fit and then cement it in place."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Treatment Plan for {patientData?.patient}</h1>
        <div className="text-gray-600">
          <p>Phone: {patientData?.phone}</p>
          <p>Email: {patientData?.email}</p>
          <p>Appointment: {patientData?.time}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TreatmentSteps />
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold">Your Treatment Blueprint</h2>
            </div>
            <div className="space-y-6">
              {visits.map((visit) => (
                <TreatmentVisit key={visit.number} {...visit} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientTreatmentPlan;