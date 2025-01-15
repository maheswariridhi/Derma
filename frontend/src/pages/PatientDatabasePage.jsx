import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PatientDatabasePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  const patients = [
    {
      id: 1,
      name: "Sarah Johnson",
      dateOfBirth: "1985-05-15",
      lastVisit: "2024-03-10",
      upcomingAppointment: "2024-03-25",
      phone: "(855) 369-8746",
      email: "sarah.j@example.com",
      condition: "Acne Treatment",
      insuranceProvider: "Blue Cross"
    },
    {
      id: 2,
      name: "Michael Chen",
      dateOfBirth: "1990-08-22",
      lastVisit: "2024-02-28",
      upcomingAppointment: "2024-03-28",
      phone: "(245) 698-3265",
      email: "m.chen@example.com",
      condition: "Eczema",
      insuranceProvider: "Aetna"
    },
    {
      id: 3,
      name: "Emma Wilson",
      dateOfBirth: "1978-03-14",
      lastVisit: "2024-03-05",
      upcomingAppointment: "2024-04-02",
      phone: "(367) 445-9821",
      email: "e.wilson@example.com",
      condition: "Psoriasis",
      insuranceProvider: "United Healthcare"
    }
  ];

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePatientClick = (patientId) => {
    navigate(`/patient/${patientId}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Patient Database</h1>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search patients..."
          className="w-full max-w-md px-4 py-2 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Appointment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPatients.map((patient) => (
              <tr 
                key={patient.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handlePatientClick(patient.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">{patient.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{patient.condition}</td>
                <td className="px-6 py-4 whitespace-nowrap">{patient.lastVisit}</td>
                <td className="px-6 py-4 whitespace-nowrap">{patient.upcomingAppointment}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div>{patient.phone}</div>
                    <div className="text-sm text-gray-500">{patient.email}</div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientDatabasePage;