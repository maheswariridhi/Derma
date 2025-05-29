import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PatientService from "../../services/PatientService";

// Define AppointmentData interface
interface AppointmentData {
  type: "check-up" | "treatment" | "follow-up";
  date: string;
  time: string;
  symptoms: string;
  notes?: string;
}

const AppointmentBooking: React.FC = () => {
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<AppointmentData>({
    type: "check-up",
    date: "",
    time: "",
    symptoms: "",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const result = await PatientService.bookAppointment(appointment);
      navigate(`/patient/queue/${result.tokenNumber}`);
    } catch (err: any) {
      setError("Failed to book appointment: " + err.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-6">Book Appointment</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Type
            </label>
            <select
              value={appointment.type}
              onChange={(e) =>
                setAppointment({ ...appointment, type: e.target.value as AppointmentData["type"] })
              }
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="check-up">Check-up</option>
              <option value="treatment">Treatment</option>
              <option value="follow-up">Follow-up</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={appointment.date}
                onChange={(e) => setAppointment({ ...appointment, date: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                value={appointment.time}
                onChange={(e) => setAppointment({ ...appointment, time: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Symptoms
            </label>
            <textarea
              value={appointment.symptoms}
              onChange={(e) => setAppointment({ ...appointment, symptoms: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              value={appointment.notes}
              onChange={(e) => setAppointment({ ...appointment, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              rows={2}
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
          >
            Book Appointment
          </button>
        </form>
      </div>
    </div>
  );
};

export default AppointmentBooking;
