import React from "react";

const AppointmentCard = ({ patient, time, status, phone, email }) => {
  const statusStyles = {
    Saved: "text-green-600 bg-green-100",
    Pending: "text-yellow-600 bg-yellow-100",
    Error: "text-red-600 bg-red-100",
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
      <h3 className="font-bold text-lg mb-2">{patient}</h3>
      <p className="text-gray-600">Time: {time}</p>
      <p className={`text-sm px-2 py-1 rounded-full ${statusStyles[status]}`}>
        {status}
      </p>
      {phone && <p className="text-gray-600 mt-2">Phone: {phone}</p>}
      {email && <p className="text-gray-600">Email: {email}</p>}
    </div>
  );
};

export default AppointmentCard;
