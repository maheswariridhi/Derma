import React, { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";

// Define interfaces for treatments and medicines
interface Treatment {
  id: number;
  name: string;
  description: string;
  duration: string;
  cost: string;
}

interface Medicine {
  id: number;
  name: string;
  type: string;
  usage: string;
  dosage: string;
  stock: number;
}

// Define services structure
interface Services {
  treatments: Treatment[];
  medicines: Medicine[];
}

// Initial data with more items
const initialServices: Services = {
  treatments: [
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
  ],
  medicines: [
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
      name: "Hyaluronic Acid",
      type: "Moisturizer",
      usage: "Hydration",
      dosage: "2%",
      stock: 80,
    },
    {
      id: 3,
      name: "Benzoyl Peroxide",
      type: "Antibacterial",
      usage: "Acne treatment",
      dosage: "5%",
      stock: 60,
    },
  ],
};

const ClinicServicesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"treatments" | "medicines">(
    "treatments"
  );
  const [services, setServices] = useState<Services>(initialServices);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clinic Services</h1>
        <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          <PlusIcon className="w-5 h-5 mr-2" />
          Add {activeTab === "treatments" ? "Treatment" : "Medicine"}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b">
        <button
          className={`px-4 py-2 mr-4 ${
            activeTab === "treatments" ? "border-b-2 border-blue-500" : ""
          }`}
          onClick={() => setActiveTab("treatments")}
        >
          Treatments
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "medicines" ? "border-b-2 border-blue-500" : ""
          }`}
          onClick={() => setActiveTab("medicines")}
        >
          Medicines
        </button>
      </div>

      {/* Treatments Section */}
      {activeTab === "treatments" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.treatments.map((treatment) => (
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
      {activeTab === "medicines" && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Dosage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stock
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {services.medicines.map((medicine) => (
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
