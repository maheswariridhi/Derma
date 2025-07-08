import React, { useState, useEffect } from "react";
import PatientService from "../../services/PatientService";
import ProfileForm from "../../components/common/ProfileForm";

// Define PatientProfileData interface
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

  const handleChange = (key: keyof PatientProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
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
        <ProfileForm
          profile={profile}
          isEditing={isEditing}
          error={error}
          fieldLabels={fieldLabels}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onEdit={() => setIsEditing(true)}
          onCancel={() => { setIsEditing(false); loadProfile(); setError(null); }}
        />
      </div>
    </div>
  );
};

export default PatientProfile;
