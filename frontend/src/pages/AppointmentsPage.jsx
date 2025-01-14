import React from "react";
import MainLayout from "../layouts/MainLayout";
import AppointmentCard from "../components/AppointmentCard";

const AppointmentsPage = () => {
  const appointments = [
    { patient: "John Doe", time: "10:30 AM", status: "Confirmed" },
    { patient: "Jane Smith", time: "11:00 AM", status: "Pending" },
  ];

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Appointments</h1>
        <div className="grid grid-cols-2 gap-4">
          {appointments.map((appt, index) => (
            <AppointmentCard key={index} {...appt} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default AppointmentsPage;
