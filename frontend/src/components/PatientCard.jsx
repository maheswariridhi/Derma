import React from "react";
import PropTypes from "prop-types";

const PatientCard = ({ patient, onClick }) => {
  return (
    <div
      className="bg-white p-6 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
      aria-label={`Patient ${patient.name}`}
    >
      <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
        {patient.name}
      </h3>
      <div className="mt-2 space-y-1">
        <p className="text-gray-600">Time: {patient.time}</p>
        <p className="text-gray-600">Phone: {patient.phone}</p>
        <p className="text-gray-600">Email: {patient.email || "No email"}</p>
      </div>
    </div>
  );
};

PatientCard.propTypes = {
  patient: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default PatientCard;
