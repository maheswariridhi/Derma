import React from "react";
import { useNavigate } from "react-router-dom";

const AppointmentCard = ({ patient, time, status, phone, email }) => {
  const navigate = useNavigate();
  const statusStyles = {
    Saved: "text-green-600 bg-green-100",
    Pending: "text-yellow-600 bg-yellow-100",
    Error: "text-red-600 bg-red-100",
  };

  const handleClick = () => {
    // Convert patient name to URL-friendly format
    const patientSlug = patient.toLowerCase().replace(/ /g, '-');
    navigate(`/patients/${patientSlug}`, { 
      state: { patient, time, status, phone, email } 
    });
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer"
    >
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
