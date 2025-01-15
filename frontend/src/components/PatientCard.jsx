import React from "react";
import PropTypes from "prop-types";

const PatientCard = ({ patient, onClick, onStatusChange }) => {
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
        <div className="bg-green-50 text-green-700 py-1 px-2 rounded-full text-sm inline-block">
          <label htmlFor="status" className="sr-only">
            Status
          </label>
          <select
            id="status"
            value={patient.status}
            onChange={(e) => onStatusChange(patient.id, e.target.value)}
            className="bg-transparent text-green-700 outline-none cursor-pointer"
          >
            <option value="Saved">Saved</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <p className="text-gray-600">Phone: {patient.phone}</p>
        <p className="text-gray-600">Email: {patient.email || "No email"}</p>
      </div>
    </div>
  );
};

PatientCard.propTypes = {
  patient: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
};

export default PatientCard;
