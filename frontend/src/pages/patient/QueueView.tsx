import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PatientService from "../../services/PatientService";

// Define QueueInfo interface
interface QueueInfo {
  tokenNumber: string;
  queueType: string;
  status: "waiting" | "in-progress" | "completed";
  patientsAhead: number;
  estimatedWaitTime: number;
  progressPercentage: number;
  message?: string;
}

const QueueView: React.FC = () => {
  const { tokenNumber } = useParams<{ tokenNumber?: string }>();
  const [queueInfo, setQueueInfo] = useState<QueueInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);

  useEffect(() => {
    if (!tokenNumber) {
      setLoading(false);
      return;
    }

    const unsubscribe = PatientService.subscribeToQueueUpdates(tokenNumber, 
      (updatedInfo: QueueInfo) => {
        setQueueInfo(updatedInfo);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [tokenNumber]);

  const handleNotificationToggle = async () => {
    try {
      const newState = !notificationsEnabled;
      await PatientService.updateNotificationPreference(tokenNumber!, newState);
      setNotificationsEnabled(newState);
    } catch (error) {
      console.error("Failed to update notifications:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading queue status...</p>
        </div>
      </div>
    );
  }

  if (!tokenNumber) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          No Active Queue
        </h2>
        <p className="text-gray-600 mb-8">
          You don't have an active queue number. Please book an appointment first.
        </p>
        <a
          href="/patient/book"
          className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Book Appointment
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Queue Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Token Header */}
        <div className="bg-blue-500 p-6 text-center text-white">
          <h1 className="text-2xl font-bold mb-2">Your Queue Token</h1>
          <div className="text-6xl font-bold">#{queueInfo?.tokenNumber}</div>
          <div className="mt-2 text-blue-100">
            {queueInfo?.queueType?.replace("-", " ").toUpperCase()}
          </div>
        </div>

        {/* Status Section */}
        <div className="p-6">
          {/* Current Status */}
          <div className="text-center mb-6">
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
              queueInfo?.status === "waiting" ? "bg-yellow-100 text-yellow-800" :
              queueInfo?.status === "in-progress" ? "bg-green-100 text-green-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {queueInfo?.status === "waiting" ? "In Queue" :
               queueInfo?.status === "in-progress" ? "It's Your Turn!" :
               "Completed"}
            </span>
          </div>

          {/* Queue Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Patients Ahead</div>
              <div className="text-3xl font-bold text-gray-700 mt-1">
                {queueInfo?.patientsAhead || 0}
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Est. Wait Time</div>
              <div className="text-3xl font-bold text-gray-700 mt-1">
                {queueInfo?.estimatedWaitTime || 0}
                <span className="text-sm"> min</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Queue Progress</span>
              <span>{queueInfo?.progressPercentage || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${queueInfo?.progressPercentage || 0}%` }}
              ></div>
            </div>
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-700">SMS Notifications</div>
              <div className="text-sm text-gray-500">Get updates about your queue</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notificationsEnabled}
                onChange={handleNotificationToggle}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Important Messages */}
      {queueInfo?.message && (
        <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{queueInfo.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueueView;
