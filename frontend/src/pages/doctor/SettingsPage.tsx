import React, { useState } from 'react';

interface SettingSection {
  id: string;
  title: string;
  icon: React.ReactNode;
}

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [savedMessage, setSavedMessage] = useState('');
  const [profileData, setProfileData] = useState({
    fullName: 'Dr. Ridhi Maheswari',
    email: 'ridhi@dermaai.com',
    phone: '+91 98765 43210',
    specialization: 'Dermatologist',
    yearsOfExperience: '8',
    bio: 'Board certified dermatologist specializing in skin disorders and cosmetic procedures.',
  });

  const [clinicData, setClinicData] = useState({
    clinicName: 'DermaAI Skin Clinic',
    address: '123 Healthcare Avenue, Mumbai, 400001',
    phone: '+91 22 2345 6789',
    email: 'info@dermaai.com',
    workingHours: 'Mon-Sat: 9:00 AM - 7:00 PM',
    website: 'www.dermaai.com',
  });

  const [notificationPreferences, setNotificationPreferences] = useState({
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    patientUpdates: true,
    marketingEmails: false,
  });

  const sections: SettingSection[] = [
    {
      id: 'profile',
      title: 'Profile Settings',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 'clinic',
      title: 'Clinic Information',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      id: 'notifications',
      title: 'Notification Preferences',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
  ];

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleClinicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClinicData(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationPreferences(prev => ({ ...prev, [name]: checked }));
  };

  const handleSave = () => {
    // Here you would save the settings to your backend
    setSavedMessage('Settings saved successfully!');
    
    setTimeout(() => {
      setSavedMessage('');
    }, 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Settings</h1>
        <p className="text-gray-600">Manage your account and clinic preferences</p>
      </div>

      {savedMessage && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
          {savedMessage}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 bg-white rounded-lg shadow-sm p-4">
          <ul className="space-y-2">
            {sections.map(section => (
              <li key={section.id}>
                <button
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-teal-50 text-teal-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3">{section.icon}</span>
                  {section.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
          {activeSection === 'profile' && (
            <div>
              <h2 className="text-xl font-medium mb-6">Profile Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleProfileChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={profileData.specialization}
                    onChange={handleProfileChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                  <input
                    type="text"
                    name="yearsOfExperience"
                    value={profileData.yearsOfExperience}
                    onChange={handleProfileChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleProfileChange}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'clinic' && (
            <div>
              <h2 className="text-xl font-medium mb-6">Clinic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
                  <input
                    type="text"
                    name="clinicName"
                    value={clinicData.clinicName}
                    onChange={handleClinicChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={clinicData.email}
                    onChange={handleClinicChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={clinicData.phone}
                    onChange={handleClinicChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="text"
                    name="website"
                    value={clinicData.website}
                    onChange={handleClinicChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Working Hours</label>
                  <input
                    type="text"
                    name="workingHours"
                    value={clinicData.workingHours}
                    onChange={handleClinicChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    name="address"
                    value={clinicData.address}
                    onChange={handleClinicChange}
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div>
              <h2 className="text-xl font-medium mb-6">Notification Preferences</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    name="emailNotifications"
                    checked={notificationPreferences.emailNotifications}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-teal-600 border-gray-300 rounded"
                  />
                  <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
                    Email Notifications
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="smsNotifications"
                    name="smsNotifications"
                    checked={notificationPreferences.smsNotifications}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-teal-600 border-gray-300 rounded"
                  />
                  <label htmlFor="smsNotifications" className="ml-2 block text-sm text-gray-700">
                    SMS Notifications
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="appointmentReminders"
                    name="appointmentReminders"
                    checked={notificationPreferences.appointmentReminders}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-teal-600 border-gray-300 rounded"
                  />
                  <label htmlFor="appointmentReminders" className="ml-2 block text-sm text-gray-700">
                    Appointment Reminders
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="patientUpdates"
                    name="patientUpdates"
                    checked={notificationPreferences.patientUpdates}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-teal-600 border-gray-300 rounded"
                  />
                  <label htmlFor="patientUpdates" className="ml-2 block text-sm text-gray-700">
                    Patient Updates
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="marketingEmails"
                    name="marketingEmails"
                    checked={notificationPreferences.marketingEmails}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-teal-600 border-gray-300 rounded"
                  />
                  <label htmlFor="marketingEmails" className="ml-2 block text-sm text-gray-700">
                    Marketing Emails
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 