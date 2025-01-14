import React from "react";

const PatientCard = ({ name, status, value, date }) => {
  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h3 className="font-bold text-lg">{name}</h3>
      <p className="text-gray-600">Status: {status}</p>
      <p className="text-gray-600">Value: ${value}</p>
      <p className="text-gray-600">Date: {date}</p>
    </div>
  );
};

export default PatientCard;
