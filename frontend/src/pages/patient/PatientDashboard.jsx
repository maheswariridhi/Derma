import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PatientService from "../../services/PatientService";

const PatientDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
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
      const data = await PatientService.getPatientDashboardData();
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
                  {new Date(
                    dashboardData.upcomingAppointment.date
                  ).toLocaleDateString()}
                  {" at "}
                  {dashboardData.upcomingAppointment.time}
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

      {/* Notifications */}
      {dashboardData.notifications.length > 0 && (
        <div className="p-6 mt-6 bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-xl font-semibold">Notifications</h2>
          <div className="space-y-4">
            {dashboardData.notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start p-4 rounded-lg bg-gray-50"
              >
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-blue-500"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                  </svg>
                </div>
                <div className="w-full ml-3">
                  <div className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    {notification.message}
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    {new Date(notification.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
