import React from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

const DashboardPage = () => {
  const navigate = useNavigate();
  
  const treatmentPlans = [
    {
      id: 1,
      patient: "Nancy Out of Network",
      status: "Saved",
      treatmentValue: "130.00",
      createdDate: "11/18/2024",
      phone: "(855)369-8746",
      email: "No email"
    },
    {
      id: 2,
      patient: "Candi Copay",
      status: "Saved",
      treatmentValue: "440.00",
      createdDate: "11/18/2024",
      phone: "(245)698-3265",
      email: "No email"
    }
  ];

  return (
    <MainLayout>
      <div className="py-6">
        {/* Welcome Section */}
        <h1 className="text-2xl font-bold mb-2">Good morning, Daniel Bessonov</h1>
        <p className="text-gray-700 mb-8">
          I've surfaced 16 cases to follow up on today
        </p>

        {/* Treatment Plans Section */}
        <div>
          <h2 className="text-xl font-bold mb-2">Treatment Plans to Customize</h2>
          <p className="text-gray-700 mb-4">
            Active treatment plans that need to be customized and sent out to patients
          </p>

          {/* Table */}
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="py-2 font-normal text-gray-600">Patient</th>
                <th className="py-2 font-normal text-gray-600">Status</th>
                <th className="py-2 font-normal text-gray-600">Treatment Value</th>
                <th className="py-2 font-normal text-gray-600">Created Date</th>
                <th className="py-2 font-normal text-gray-600">Phone</th>
                <th className="py-2 font-normal text-gray-600">Email</th>
              </tr>
            </thead>
            <tbody>
              {treatmentPlans.map((plan) => (
                <tr 
                  key={plan.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/patients/${plan.id}`)}
                >
                  <td className="py-2">{plan.patient}</td>
                  <td className="py-2">{plan.status}</td>
                  <td className="py-2">${plan.treatmentValue}</td>
                  <td className="py-2">{plan.createdDate}</td>
                  <td className="py-2">{plan.phone}</td>
                  <td className="py-2">{plan.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
