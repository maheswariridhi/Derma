import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PatientService from "../../services/PatientService";

// Define QueueStatus interface
interface QueueStatus {
  tokenNumber: string;
  queueType: string;
  status: "waiting" | "in-progress" | "completed";
}

// Define Appointment interface
interface Appointment {
  type: string;
  date: string;
  time: string;
}

// Define Visit interface
interface Visit {
  id: string;
  date: string;
  type: string;
  doctor: string;
  status: "completed" | "pending";
}

// Define Notification interface
interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
}

// Define DashboardData interface
interface DashboardData {
  activeQueue: QueueStatus | null;
  upcomingAppointment: Appointment | null;
  recentVisits: Visit[];
  notifications: Notification[];
}

const PatientDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    activeQueue: null,
    upcomingAppointment: null,
    recentVisits: [],
    notifications: [],
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data: DashboardData = await PatientService.getPatientDashboardData();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl p-4 mx-auto">
      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Active Queue Status */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Current Queue Status</h2>
          {dashboardData?.activeQueue ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-3xl font-bold text-blue-600">
                    #{dashboardData?.activeQueue?.tokenNumber}
                  </span>
                  <span className="ml-2 text-gray-500">
                    {dashboardData?.activeQueue?.queueType}
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    dashboardData.activeQueue.status === "waiting"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {dashboardData?.activeQueue?.status}
                </span>
              </div>
              <Link
                to={`/patient/queue/${dashboardData?.activeQueue?.tokenNumber}`}
                className="block w-full py-2 text-center text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                View Queue Details
              </Link>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="mb-4 text-gray-500">No active queue</p>
              <Link
                to="/patient/book"
                className="inline-block px-6 py-2 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Book Appointment
              </Link>
            </div>
          )}
        </div>

        {/* Upcoming Appointment */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Upcoming Appointment</h2>
          {dashboardData.upcomingAppointment ? (
            <div>
              <div className="mb-4">
                <div className="text-lg font-medium">
                  {dashboardData.upcomingAppointment.type}
                </div>
                <div className="text-gray-500">
                  {dashboardData.upcomingAppointment.date
                    ? new Date(dashboardData.upcomingAppointment.date).toLocaleDateString()
                    : "N/A"}{" "}
                  at {dashboardData.upcomingAppointment.time}
                </div>
              </div>
              <button
                className="w-full py-2 text-white transition-colors bg-red-500 rounded-lg hover:bg-red-600"
                onClick={() => {
                  /* Handle cancellation */
                }}
              >
                Cancel Appointment
              </button>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No upcoming appointments
            </div>
          )}
        </div>
      </div>

      {/* Recent Visits */}
      <div className="p-6 mt-6 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Recent Visits</h2>
        {dashboardData.recentVisits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dashboardData.recentVisits.map((visit) => (
                  <tr key={visit.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(visit.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">{visit.type}</td>
                    <td className="px-6 py-4">{visit.doctor}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          visit.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {visit.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">No recent visits</div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
