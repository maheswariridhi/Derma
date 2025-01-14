import React from "react";
import MainLayout from "../layouts/MainLayout";
import Table from "../components/Table";

const DashboardPage = () => {
  const summaryStats = [
    { title: "Pending Cases", count: 16 },
    { title: "Follow-ups", count: 8 },
    { title: "New Messages", count: 3 },
  ];

  const patients = [
    { name: "Nancy Out of Network", status: "Saved", value: 130, date: "11/18/2024" },
    { name: "Candi Copay", status: "Saved", value: 440, date: "11/18/2024" },
  ];

  return (
    <MainLayout>
      <div className="p-6 bg-gray-50">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {summaryStats.map((stat, index) => (
            <div key={index} className="bg-white p-4 rounded shadow-md">
              <h2 className="text-lg font-bold">{stat.title}</h2>
              <p className="text-2xl font-semibold text-blue-600">{stat.count}</p>
            </div>
          ))}
        </div>

        {/* Patient List */}
        <div className="bg-white p-4 rounded shadow-md">
          <h2 className="text-lg font-bold mb-4">Treatment Plans to Customize</h2>
          <Table data={patients} />
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
