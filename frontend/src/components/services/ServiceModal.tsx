import React, { useState } from "react";

// Define Service interface
interface Service {
  name?: string;
  description?: string;
  [key: string]: any; // Allows additional dynamic properties
}

// Define AI Suggestion interface
interface AISuggestion {
  name: string;
  description: string;
}

// Define Props interface
interface ServiceModalProps {
  service?: Service;
  aiSuggestions?: AISuggestion[];
  onSave: (service: Service) => void;
  onClose: () => void;
}

const ServiceModal: React.FC<ServiceModalProps> = ({
  service,
  aiSuggestions,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<Service>(service || {});
  const [selectedSuggestion, setSelectedSuggestion] = useState<AISuggestion | null>(null);

  const handleSuggestionSelect = (suggestion: AISuggestion) => {
    setFormData({ ...formData, ...suggestion });
    setSelectedSuggestion(suggestion);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="grid grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Add New Service</h2>
            {/* Your form fields */}
            <div className="mt-4">
              <button
                onClick={() => onSave(formData)}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Save Service
              </button>
            </div>
          </div>

          {/* AI Suggestions Section */}
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-medium text-gray-700 mb-4">AI Suggestions</h3>
            {aiSuggestions?.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleSuggestionSelect(suggestion)}
                className={`p-3 rounded cursor-pointer mb-2 ${
                  selectedSuggestion === suggestion
                    ? "bg-blue-50 border border-blue-200"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                <h4 className="font-medium">{suggestion.name}</h4>
                <p className="text-sm text-gray-600">{suggestion.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;
