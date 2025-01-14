import React from "react";
import MainLayout from "../layouts/MainLayout";

const AppointmentsPage = () => {
  const appointments = [
    {
      patient: "John Doe",
      status: "Confirmed",
      treatmentValue: "$130",
      createdDate: "11/18/2024",
      phone: "555-123-4567",
      email: "john@example.com",
    },
    {
      patient: "Jane Smith",
      status: "Pending",
      treatmentValue: "$440",
      createdDate: "11/18/2024",
      phone: "555-987-6543",
      email: "jane@example.com",
    },
  ];

  return (
    <MainLayout>
      <div className="overflow-x-auto bg-white p-4 rounded shadow">
        <table className="table-auto w-full border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Patient</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Treatment Value</th>
              <th className="border px-4 py-2">Created Date</th>
              <th className="border px-4 py-2">Phone</th>
              <th className="border px-4 py-2">Email</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{appt.patient}</td>
                <td className="border px-4 py-2">{appt.status}</td>
                <td className="border px-4 py-2">{appt.treatmentValue}</td>
                <td className="border px-4 py-2">{appt.createdDate}</td>
                <td className="border px-4 py-2">{appt.phone}</td>
                <td className="border px-4 py-2">{appt.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
};

export default AppointmentsPage;
