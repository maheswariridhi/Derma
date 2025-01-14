import React from "react";

const AppointmentCard = ({ patient, time, status }) => {
  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h3 className="font-bold text-lg">{patient}</h3>
      <p className="text-gray-600">Time: {time}</p>
      <p className="text-gray-600">Status: {status}</p>
    </div>
  );
};

export default AppointmentCard;
