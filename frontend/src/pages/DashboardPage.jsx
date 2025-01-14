import React from "react";
import AppointmentCard from "../components/AppointmentCard";

const Dashboard = () => {
  const cases = 16;
  const patients = [
    { name: "Nancy Out of Network", status: "Saved", value: 130.0, date: "11/18/2024", phone: "(855) 369-8746", email: "No email" },
    { name: "Candi Copay", status: "Saved", value: 440.0, date: "11/18/2024", phone: "(245) 698-3265", email: "No email" },
    { name: "Allen Allowed", status: "Saved", value: 2250.0, date: "11/18/2024", phone: "(253) 687-9654", email: "No email" },
    { name: "Marvin Medicaid", status: "Saved", value: 1125.0, date: "11/18/2024", phone: "(585) 484-6245", email: "No email" },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-8">
        {/* Sidebar */}
        <div>
          <h1 className="text-2xl font-bold mb-2">DJ Dental</h1>
          <nav className="space-y-2">
            <a href="#" className="block text-gray-600 hover:text-gray-900">Dashboard</a>
            <a href="#" className="block text-gray-600 hover:text-gray-900">Inbox</a>
          </nav>
        </div>

        {/* Greeting */}
        <div className="bg-pink-50 rounded-lg p-6">
          <h2 className="text-xl font-medium">{getGreeting()}, Daniel Bessonov</h2>
          <p className="text-gray-600 mt-2">
            I've surfaced <span className="font-semibold text-xl">{cases}</span> cases to follow up on today.
          </p>
        </div>

        {/* Patient List */}
        <div>
          <h3 className="text-lg font-medium mb-4">Treatment Plans to Customize</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((patient, index) => (
              <AppointmentCard
                key={index}
                patient={patient.name}
                time={patient.date}
                status={patient.status}
                phone={patient.phone}
                email={patient.email}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
