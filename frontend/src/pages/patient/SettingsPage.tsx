import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PatientService from "../../services/PatientService";
import ProfileForm from "../../components/common/ProfileForm";

interface PatientProfileData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
}

const fieldLabels: Record<keyof PatientProfileData, string> = {
  name: "Full Name",
  email: "Email Address",
  phone: "Phone Number",
  dateOfBirth: "Date of Birth",
  address: "Home Address",
};

const PatientSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PatientProfileData>({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Remove the useEffect that automatically redirects to dashboard

  const loadProfile = async () => {
    setError(null);
    try {
      const patientData: PatientProfileData = await PatientService.getPatientProfile();
      setProfile(patientData);
    } catch (err) {
      setError("Failed to load profile");
    }
  };

  const handleChange = (key: keyof PatientProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await PatientService.updateProfile(profile);
      setIsEditing(false);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update profile");
    }
  };

  // Update isLoggedIn to check for patient_id
  const isLoggedIn = () => {
    return !!localStorage.getItem("patient_id");
  };

  // Update logout handler to remove patient_id
  const handleLogout = () => {
    localStorage.removeItem("patient_id");
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 py-10">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-2 text-center text-blue-700">Settings</h1>
        <p className="text-gray-500 mb-8 text-center">Manage your profile and account settings</p>
        <div className="border-b pb-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Profile</h2>
          <ProfileForm
            profile={profile}
            isEditing={isEditing}
            error={error}
            success={success}
            fieldLabels={fieldLabels}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onEdit={() => setIsEditing(true)}
            onCancel={() => { setIsEditing(false); setSuccess(null); setError(null); loadProfile(); }}
          />
        </div>
        <div className="flex flex-col items-center pt-4">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Account</h2>
          {!isLoggedIn() && (
            <button
              type="button"
              onClick={() => navigate('/patient/register')}
              className="w-full max-w-xs px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
            >
              Register
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientSettingsPage; 