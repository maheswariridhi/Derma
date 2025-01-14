import React from "react";
import MainLayout from "../layouts/MainLayout";

const DashboardPage = () => {
  const patients = [
    {
      name: "Nancy Out of Network",
      status: "Saved",
      treatmentValue: "$130.00",
      createdDate: "11/18/2024",
      phone: "(855) 369-8746",
      email: "No email",
    },
    {
      name: "Candi Copay",
      status: "Saved",
      treatmentValue: "$440.00",
      createdDate: "11/18/2024",
      phone: "(245) 698-3265",
      email: "No email",
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Greeting Section */}
        <div>
          <h2 className="text-3xl font-bold">Good morning, Daniel Bessonov</h2>
          <p className="text-gray-600">
            I've surfaced <span className="font-bold">16 cases</span> to follow up on today.
          </p>
        </div>

        {/* Table Section */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Treatment Plans to Customize</h3>
          <p className="text-gray-600 mb-6">
            Active treatment plans that need to be customized and sent out to patients.
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                    Patient
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                    Treatment Value
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                    Created Date
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                    Phone
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">
                    Email
                  </th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 text-gray-700">{patient.name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{patient.treatmentValue}</td>
                    <td className="px-6 py-4 text-gray-700">{patient.createdDate}</td>
                    <td className="px-6 py-4 text-gray-700">{patient.phone}</td>
                    <td className="px-6 py-4 text-gray-700">{patient.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
