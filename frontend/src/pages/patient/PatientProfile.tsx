import React, { useState, useEffect } from "react";
import PatientService from "../../services/PatientService";

// Define PatientProfileData interface
interface PatientProfileData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
}

const PatientProfile: React.FC = () => {
  const [profile, setProfile] = useState<PatientProfileData>({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const patientData: PatientProfileData = await PatientService.getPatientProfile();
      setProfile(patientData);
      setLoading(false);
    } catch (err) {
      setError("Failed to load profile");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await PatientService.updateProfile(profile);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError("Failed to update profile");
    }
  };

  if (loading) return <div className="p-4">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-6">Patient Profile</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                  className="w-full px-3 py-2 border rounded-md disabled:bg-gray-50"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex space-x-4">
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
                  onClick={() => setIsEditing(false)}
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
    </div>
  );
};

export default PatientProfile;
