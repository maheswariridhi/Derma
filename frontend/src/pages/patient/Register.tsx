import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import PatientService from '../../services/PatientService';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Removed useEffect that redirected to dashboard

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password) {
      setError('Password is required.');
      return;
    }
    try {
      // 1. Register with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { phone, firstName }
        }
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      // 2. Register in backend DB (patients table)
      const patientId = await PatientService.registerPatient({
        name: firstName,
        email,
        phone
      });
      if (patientId) {
        localStorage.setItem('patient_id', patientId);
      } else if (data && data.user && data.user.id) {
        // fallback: store Supabase user id
        localStorage.setItem('patient_id', data.user.id);
      } else {
        // fallback: fetch all patients and use the latest
        const patients = await PatientService.getAllPatients();
        if (patients && patients.length > 0) {
          localStorage.setItem('patient_id', patients[patients.length - 1].id);
        }
      }
      navigate('/patient/dashboard');
    } catch (err) {
      setError('Network error');
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded shadow max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Patient Registration</h1>
        <div className="mb-4">
          <label className="block mb-1">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Phone</label>
          <input
            type="text"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
            placeholder="Enter a secure password"
          />
        </div>
        {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register; 