import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PatientService from "../../services/PatientService";

interface PatientProfileData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
}

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

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setError(null);
    try {
      const patientData: PatientProfileData = await PatientService.getPatientProfile();
      setProfile(patientData);
    } catch (err) {
      setError("Failed to load profile");
    }
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

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 py-10">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-2 text-center text-blue-700">Settings</h1>
        <p className="text-gray-500 mb-8 text-center">Manage your profile and account settings</p>
        <div className="border-b pb-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Profile</h2>
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {(
              Object.entries(profile) as [keyof PatientProfileData, string][]
            ).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
                </label>
                <input
                  type={key === "dateOfBirth" ? "date" : "text"}
                  value={value}
                  onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-md disabled:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            ))}
            <div className="flex space-x-4 pt-2">
              {isEditing ? (
                <>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); setSuccess(null); setError(null); loadProfile(); }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </form>
        </div>
        <div className="flex flex-col items-center pt-4">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Account</h2>
          <button
            onClick={() => navigate("/patient/login")}
            className="w-full max-w-xs px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientSettingsPage; 