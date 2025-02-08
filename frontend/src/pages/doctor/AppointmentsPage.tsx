import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PatientService from "../../services/PatientService";

// Define interfaces for queue entries and patients
interface Patient {
  id: string;
  name: string;
  phone?: string;
}

interface QueueEntry {
  id: string;
  tokenNumber: number;
  patient: Patient;
  timeWaiting: string;
  status: "waiting" | "in-progress" | "completed";
}

// Define queue state structure
interface Queues {
  "check-up": QueueEntry[];
  treatment: QueueEntry[];
  billing: QueueEntry[];
}

const AppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [queues, setQueues] = useState<Queues>({
    "check-up": [],
    treatment: [],
    billing: [],
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeQueue, setActiveQueue] = useState<keyof Queues>("check-up");

  const fetchQueues = async () => {
    try {
      console.log("Fetching queues...");
      setLoading(true);
      const queueStatus: Queues = await PatientService.getQueueStatus();
      console.log("Queue status received:", queueStatus);
      if (!queueStatus || typeof queueStatus !== "object") {
        throw new Error("Invalid queue status received");
      }
      setQueues(queueStatus);
      setError(null);
    } catch (err) {
      console.error("Queue fetch error:", err);
      setError("Failed to fetch queues: " + (err as Error).message);
      setQueues({
        "check-up": [],
        treatment: [],
        billing: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
    const interval = setInterval(fetchQueues, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (queueId: string, newStatus: "in-progress" | "completed") => {
    try {
      await PatientService.updateQueueStatus(queueId, newStatus);
      await fetchQueues();
    } catch (err) {
      setError("Failed to update status: " + (err as Error).message);
    }
  };

  if (loading) {
    return <div className="p-6">Loading queues...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Patient Queues</h2>

        {/* Queue Type Tabs */}
        <div className="flex space-x-4 mt-4">
          {Object.keys(queues).map((queueType) => (
            <button
              key={queueType}
              onClick={() => setActiveQueue(queueType as keyof Queues)}
              className={`px-4 py-2 rounded-lg ${
                activeQueue === queueType
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {queueType.charAt(0).toUpperCase() + queueType.slice(1)}
              <span className="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded">
                {queues[queueType as keyof Queues].length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {/* Queue Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Token
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Waiting Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {queues[activeQueue].map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{entry.tokenNumber}</td>
                <td className="px-6 py-4">
                  <div className="font-medium">{entry.patient.name}</div>
                  <div className="text-sm text-gray-500">
                    {entry.patient.phone || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4">{entry.timeWaiting}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      entry.status === "waiting"
                        ? "bg-yellow-100 text-yellow-800"
                        : entry.status === "in-progress"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {entry.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {entry.status === "waiting" && (
                    <button
                      onClick={() => handleStatusUpdate(entry.id, "in-progress")}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Start
                    </button>
                  )}
                  {entry.status === "in-progress" && (
                    <button
                      onClick={() => handleStatusUpdate(entry.id, "completed")}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Complete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentsPage;
