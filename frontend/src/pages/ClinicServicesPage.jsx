import React, { useState } from 'react';

const ClinicServicesPage = () => {
  const [activeTab, setActiveTab] = useState('treatments');

  const treatments = [
    {
      id: 1,
      name: "Chemical Peel",
      description: "Exfoliating treatment to improve skin texture and tone",
      duration: "30-45 minutes",
      cost: "$150-300",
    },
    {
      id: 2,
      name: "Laser Hair Removal",
      description: "Permanent hair reduction using laser technology",
      duration: "15-60 minutes",
      cost: "$200-800",
    },
    {
      id: 3,
      name: "Acne Treatment",
      description: "Comprehensive treatment for active acne and scarring",
      duration: "45-60 minutes",
      cost: "$150-400",
    },
    {
      id: 4,
      name: "Botox Injection",
      description: "Treatment for wrinkles and fine lines",
      duration: "15-30 minutes",
      cost: "$300-600",
    },
    {
      id: 5,
      name: "Dermal Fillers",
      description: "Volume restoration and facial contouring",
      duration: "30-45 minutes",
      cost: "$600-1200",
    }
  ];

  const medicines = [
    {
      id: 1,
      name: "Tretinoin",
      type: "Retinoid",
      usage: "Acne and anti-aging",
      dosage: "0.025%",
      stock: 75,
    },
    {
      id: 2,
      name: "Hydroquinone",
      type: "Skin lightener",
      usage: "Hyperpigmentation",
      dosage: "4%",
      stock: 50,
    },
    {
      id: 3,
      name: "Clindamycin",
      type: "Antibiotic",
      usage: "Acne treatment",
      dosage: "1%",
      stock: 100,
    },
    {
      id: 4,
      name: "Benzoyl Peroxide",
      type: "Antimicrobial",
      usage: "Acne treatment",
      dosage: "5%",
      stock: 120,
    },
    {
      id: 5,
      name: "Hyaluronic Acid",
      type: "Moisturizer",
      usage: "Hydration",
      dosage: "2%",
      stock: 80,
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dermatology Services</h1>
      
      {/* Tab Navigation */}
      <div className="mb-6 border-b">
        <button
          className={`px-4 py-2 mr-4 ${activeTab === 'treatments' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('treatments')}
        >
          Treatments
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'medicines' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('medicines')}
        >
          Medicines
        </button>
      </div>

      {/* Treatments Section */}
      {activeTab === 'treatments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {treatments.map((treatment) => (
            <div key={treatment.id} className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-bold text-lg mb-2">{treatment.name}</h3>
              <p className="text-gray-600 mb-4">{treatment.description}</p>
              <div className="text-sm text-gray-500">
                <p>Duration: {treatment.duration}</p>
                <p>Cost: {treatment.cost}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Medicines Section */}
      {activeTab === 'medicines' && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dosage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {medicines.map((medicine) => (
                <tr key={medicine.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{medicine.name}</td>
                  <td className="px-6 py-4">{medicine.type}</td>
                  <td className="px-6 py-4">{medicine.usage}</td>
                  <td className="px-6 py-4">{medicine.dosage}</td>
                  <td className="px-6 py-4">{medicine.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClinicServicesPage; 