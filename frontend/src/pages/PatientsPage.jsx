import React from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

const PatientsPage = () => {
  const { id } = useParams();

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-semibold mb-6">Patient Details</h1>
        <p>Patient ID: {id}</p>
        {/* Add more patient details here */}
      </div>
    </MainLayout>
  );
};

export default PatientsPage;
