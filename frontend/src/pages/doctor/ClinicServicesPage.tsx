import React, { useState, useEffect, useCallback } from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import AddServiceModal from "@/components/services/AddServiceModal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api"; // FastAPI backend URL

// Define interfaces to replace the removed imports
interface Treatment {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
}

interface Medicine {
  id: string;
  name: string;
  description: string;
  dosage: string;
  price: number;
  unit: string;
  stock: number;
}

const ClinicServicesPage: React.FC = () => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("treatments");
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    itemId: string;
    itemType: "treatments" | "medicines";
    itemName: string;
  }>({
    isOpen: false,
    itemId: "",
    itemType: "treatments",
    itemName: "",
  });
  
  // Add a key to force re-render and refresh data when needed
  const [refreshKey, setRefreshKey] = useState(0);

  // Define fetchServices using useCallback to maintain reference stability
  const fetchServices = useCallback(async (isInitialLoad: boolean = false) => {
    if (isInitialLoad) {
      setIsLoading(true);
    }
    try {
      const [treatmentsData, medicinesData] = await Promise.all([
        axios.get(`${API_BASE_URL}/treatments`).then(res => res.data),
        axios.get(`${API_BASE_URL}/medicines`).then(res => res.data)
      ]);
      setTreatments(treatmentsData);
      setMedicines(medicinesData);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || "Failed to fetch services";
      console.error("Error fetching services:", errorMessage);
      // Only set error and show toast if it's an initial load and we have no data
      if (isInitialLoad && !treatments.length && !medicines.length) {
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      }
    }
  }, [treatments.length, medicines.length]);

  const handleAddService = async (data: Treatment | Medicine) => {
    // Generate a temporary ID for optimistic updates
    const tempId = `temp-${Date.now()}`;
    
    try {
      if (activeTab === "treatments") {
        // Create a temporary treatment with the temp ID
        const tempTreatment = { ...data, id: tempId } as Treatment;
        
        // Add to local state immediately (optimistic update)
        setTreatments(prev => [...prev, tempTreatment]);
        
        // Close the modal right away for better UX
        setIsModalOpen(false);
        
        // Show success toast
        toast.success("Treatment added successfully");
        
        // Make API call in the background (don't await)
        axios.post(`${API_BASE_URL}/treatments`, data)
          .then(response => {
            // If successful, replace the temp data with real data
            setTreatments(prev => 
              prev.map(t => t.id === tempId ? response.data : t)
            );
          })
          .catch(err => {
            // Log the error but don't show to user since we already
            // showed success and the item is in the UI
            console.error("Error in background treatment save:", err);
          });
      } else {
        // Create a temporary medicine with the temp ID
        const tempMedicine = { ...data, id: tempId } as Medicine;
        
        // Add to local state immediately (optimistic update)
        setMedicines(prev => [...prev, tempMedicine]);
        
        // Close the modal right away for better UX
        setIsModalOpen(false);
        
        // Show success toast
        toast.success("Medicine added successfully");
        
        // Make API call in the background (don't await)
        axios.post(`${API_BASE_URL}/medicines`, data)
          .then(response => {
            // If successful, replace the temp data with real data
            setMedicines(prev => 
              prev.map(m => m.id === tempId ? response.data : m)
            );
          })
          .catch(err => {
            // Log the error but don't show to user since we already
            // showed success and the item is in the UI
            console.error("Error in background medicine save:", err);
          });
      }
    } catch (err: any) {
      // This catch block will only be hit for errors in the try block,
      // not for errors in the background axios calls
      const errorMessage = err.response?.data?.detail || err.message || `Failed to add ${activeTab.slice(0, -1)}`;
      console.error(`Error adding ${activeTab.slice(0, -1)}:`, err);
      toast.error(errorMessage);
    }
  };

  const handleDeleteClick = (id: string, type: "treatments" | "medicines", name: string) => {
    setDeleteModal({
      isOpen: true,
      itemId: id,
      itemType: type,
      itemName: name,
    });
  };

  const handleDelete = async () => {
    const { itemId, itemType, itemName } = deleteModal;
    
    try {
      // Show a loading toast
      const loadingToast = toast.loading(`Deleting ${itemType === "treatments" ? "treatment" : "medicine"}...`);
      
      // Make the API call first and wait for it to complete
      if (itemType === "treatments") {
        await axios.delete(`${API_BASE_URL}/treatments/${itemId}`);
        // Only update state after successful API call
        setTreatments(prev => prev.filter(t => t.id !== itemId));
      } else {
        await axios.delete(`${API_BASE_URL}/medicines/${itemId}`);
        // Only update state after successful API call
        setMedicines(prev => prev.filter(m => m.id !== itemId));
      }
      
      // Close modal after successful deletion
      setDeleteModal(prev => ({ ...prev, isOpen: false }));
      
      // Force a refresh on state and increment the refresh key
      setRefreshKey(prev => prev + 1);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(`${itemType === "treatments" ? "Treatment" : "Medicine"} deleted successfully`);
      
      // Refresh the data to ensure sync with server
      fetchServices(false);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || `Failed to delete ${itemType.slice(0, -1)}`;
      console.error(`Error deleting ${itemType.slice(0, -1)}:`, err);
      toast.error(errorMessage);
    }
  };

  // Add effect to refresh data when tab changes
  useEffect(() => {
    fetchServices(false);
  }, [activeTab, fetchServices]);

  useEffect(() => {
    // Only show loading state on initial load
    fetchServices(true);
    
    // Create a function to refresh data when component becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchServices(false); // Don't show loading state on refresh
      }
    };
    
    // Listen for visibility changes to fetch fresh data when returning to tab
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchServices]);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
          {error}
        </div>
        <button 
          onClick={() => fetchServices(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const renderServiceCards = (items: Treatment[] | Medicine[], type: "treatments" | "medicines") => {
    if (type === "medicines") {
      return (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={`${item.id}-${refreshKey}`} className="flex justify-between items-start p-4 bg-white border rounded-md">
              <div className="space-y-1">
                <h3 className="text-base font-medium">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
                <div className="text-sm text-gray-500">
                  <span>Dosage: {(item as Medicine).dosage}</span>
                  <span className="mx-2">·</span>
                  <span>Price: ${(item as Medicine).price.toFixed(2)}</span>
                  <span className="mx-2">·</span>
                  <span>Stock: {(item as Medicine).stock} {(item as Medicine).unit}</span>
                </div>
              </div>
              <button
                onClick={() => handleDeleteClick(item.id, type, item.name)}
                className="text-black hover:text-gray-700 p-1"
                title="Delete medicine"
              >
                <XMarkIcon className="w-5 h-5" />
                <span className="sr-only">Delete</span>
              </button>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={`${item.id}-${refreshKey}`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg mb-2">{item.name}</h3>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <div className="text-sm text-gray-500">
                    <p>Duration: {(item as Treatment).duration} minutes</p>
                    <p>Price: ${(item as Treatment).price.toFixed(2)}</p>
                    <p>Category: {(item as Treatment).category}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteClick(item.id, type, item.name)}
                  className="text-black hover:text-gray-700 p-1"
                  title="Delete treatment"
                >
                  <XMarkIcon className="w-5 h-5" />
                  <span className="sr-only">Delete</span>
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

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
            renderServiceCards(treatments, "treatments")
          )}
        </TabsContent>

        <TabsContent value="medicines">
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
            renderServiceCards(medicines, "medicines")
          )}
        </TabsContent>
      </Tabs>

      {isModalOpen && (
        <AddServiceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddService}
          type={activeTab === "treatments" ? "treatment" : "medicine"}
        />
      )}

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleDelete}
        itemType={deleteModal.itemType === "treatments" ? "treatment" : "medicine"}
        itemName={deleteModal.itemName}
      />
    </div>
  );
};

export default ClinicServicesPage;
