import React, { useState, useEffect } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import AddServiceModal from "@/components/services/AddServiceModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE_URL = "http://localhost:8000/api";

// Define interfaces for treatments and medicines
interface Treatment {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  isActive: boolean;
}

interface Medicine {
  id: string;
  name: string;
  description: string;
  dosage: string;
  price: number;
  unit: string;
  stock: number;
  isActive: boolean;
}

const ClinicServicesPage: React.FC = () => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("treatments");

  const fetchServices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Fetching services...");
      const [treatmentsRes, medicinesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/treatments`),
        axios.get(`${API_BASE_URL}/medicines`)
      ]);
      console.log("Treatments fetched:", treatmentsRes.data);
      console.log("Medicines fetched:", medicinesRes.data);
      setTreatments(treatmentsRes.data);
      setMedicines(medicinesRes.data);

      // Only add initial data if both collections are empty
      if (treatmentsRes.data.length === 0 && medicinesRes.data.length === 0) {
        console.log("No existing data found, adding initial data...");
        try {
          const initResponse = await axios.post(`${API_BASE_URL}/initialize-data`);
          console.log("Initialization response:", initResponse.data);
          
          if (initResponse.data.message === "Data already exists") {
            console.log("Data already exists, skipping initialization");
            return;
          }
          
          // Fetch the data again after initialization
          const [newTreatmentsRes, newMedicinesRes] = await Promise.all([
            axios.get(`${API_BASE_URL}/treatments`),
            axios.get(`${API_BASE_URL}/medicines`)
          ]);
          setTreatments(newTreatmentsRes.data);
          setMedicines(newMedicinesRes.data);
        } catch (initErr: any) {
          console.error("Error initializing data:", initErr);
          setError(`Failed to initialize data: ${initErr.response?.data?.detail || initErr.message}`);
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message;
      console.error("Error fetching services:", errorMessage);
      setError(`Failed to fetch services: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddService = async (data: Treatment | Medicine) => {
    try {
      const endpoint = activeTab === "treatments" ? "treatments" : "medicines";
      await axios.post(`${API_BASE_URL}/${endpoint}`, data);
      fetchServices(); // Refresh the list
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(`Error adding ${activeTab.slice(0, -1)}:`, err);
      setError(`Failed to add ${activeTab.slice(0, -1)}: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleDelete = async (id: string, type: "treatments" | "medicines") => {
    try {
      await axios.delete(`${API_BASE_URL}/${type}/${id}`);
      fetchServices(); // Refresh the list
    } catch (err: any) {
      console.error(`Error deleting ${type.slice(0, -1)}:`, err);
      setError(`Failed to delete ${type.slice(0, -1)}: ${err.response?.data?.detail || err.message}`);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clinic Services</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add {activeTab === "treatments" ? "Treatment" : "Medicine"}
        </button>
      </div>

      <Tabs defaultValue="treatments" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="treatments">Treatments</TabsTrigger>
          <TabsTrigger value="medicines">Medicines</TabsTrigger>
        </TabsList>

        <TabsContent value="treatments">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <Skeleton className="h-20 w-full mb-4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {treatments.map((treatment) => (
                <Card key={treatment.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg mb-2">{treatment.name}</h3>
                        <p className="text-gray-600 mb-4">{treatment.description}</p>
                        <div className="text-sm text-gray-500">
                          <p>Duration: {treatment.duration} minutes</p>
                          <p>Price: ${treatment.price.toFixed(2)}</p>
                          <p>Category: {treatment.category}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(treatment.id, "treatments")}
                        className="text-red-500 hover:text-red-700 p-2"
                        title="Delete treatment"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="medicines">
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dosage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {medicines.map((medicine) => (
                    <tr key={medicine.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{medicine.name}</td>
                      <td className="px-6 py-4">{medicine.description}</td>
                      <td className="px-6 py-4">{medicine.dosage}</td>
                      <td className="px-6 py-4">${medicine.price.toFixed(2)}</td>
                      <td className="px-6 py-4">{medicine.unit}</td>
                      <td className="px-6 py-4">{medicine.stock}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(medicine.id, "medicines")}
                          className="text-red-500 hover:text-red-700 p-2"
                          title="Delete medicine"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AddServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={activeTab as "treatments" | "medicines"}
        onSubmit={handleAddService}
      />
    </div>
  );
};

export default ClinicServicesPage;
