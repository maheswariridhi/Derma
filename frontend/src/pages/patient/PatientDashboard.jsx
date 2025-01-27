import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PatientService from '../../services/PatientService';

const PatientDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    activeQueue: null,
    upcomingAppointment: null,
    recentVisits: [],
    notifications: []
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
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Queue Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Current Queue Status</h2>
          {dashboardData.activeQueue ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-3xl font-bold text-blue-600">
                    #{dashboardData.activeQueue.tokenNumber}
                  </span>
                  <span className="ml-2 text-gray-500">
                    {dashboardData.activeQueue.queueType}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  dashboardData.activeQueue.status === 'waiting' 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {dashboardData.activeQueue.status}
                </span>
              </div>
              <Link 
                to={`/patient/queue/${dashboardData.activeQueue.tokenNumber}`}
                className="block w-full text-center bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                View Queue Details
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No active queue</p>
              <Link 
                to="/patient/book"
                className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Book Appointment
              </Link>
            </div>
          )}
        </div>

        {/* Upcoming Appointment */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Upcoming Appointment</h2>
          {dashboardData.upcomingAppointment ? (
            <div>
              <div className="mb-4">
                <div className="text-lg font-medium">
                  {dashboardData.upcomingAppointment.type}
                </div>
                <div className="text-gray-500">
                  {new Date(dashboardData.upcomingAppointment.date).toLocaleDateString()}
                  {' at '}
                  {dashboardData.upcomingAppointment.time}
                </div>
              </div>
              <button 
                className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
                onClick={() => {/* Handle cancellation */}}
              >
                Cancel Appointment
              </button>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No upcoming appointments
            </div>
          )}
        </div>
      </div>

      {/* Recent Visits */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Visits</h2>
        {dashboardData.recentVisits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
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
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        visit.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {visit.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No recent visits
          </div>
        )}
      </div>

      {/* Notifications */}
      {dashboardData.notifications.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <div className="space-y-4">
            {dashboardData.notifications.map((notification) => (
              <div 
                key={notification.id}
                className="flex items-start p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <svg 
                    className="h-6 w-6 text-blue-500"
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
                <div className="ml-3 w-full">
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