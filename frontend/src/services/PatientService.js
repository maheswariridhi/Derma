import { db } from '../config/firebase';
import { collection, doc, getDocs, getDoc, addDoc } from 'firebase/firestore';
import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const MOCK_PATIENTS = [
  {
    id: 1,
    name: "Sampreeta Maheswari",
    time: "11/18/2024",
    status: "Saved",
    phone: "(855) 369-8746",
    email: "No email",
    condition: "Chronic Pain",
    lastVisit: "2024-02-15",
    treatmentPlan: {
      diagnosis: "Initial Consultation",
      currentStatus: "Pending Review",
      medications: [],
      nextSteps: ["Schedule initial consultation"]
    }
  },
  // Add more mock data here
];

const PatientService = {
  async registerPatient(patientData) {
    try {
      // First save to Firebase directly
      const patientsRef = collection(db, 'patients');
      const docRef = await addDoc(patientsRef, {
        ...patientData,
        status: "Active",
        created_at: new Date()
      });

      // Then notify backend
      await axios.post(`${BASE_URL}/api/patients`, {
        ...patientData,
        id: docRef.id
      });

      return { id: docRef.id, ...patientData };
    } catch (error) {
      console.error('Registration error:', error);
      throw error.message;
    }
  },

  async getAllPatients() {
    try {
      const patientsRef = collection(db, 'patients');
      const snapshot = await getDocs(patientsRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error.message;
    }
  },

  async getPatientById(id) {
    try {
      const docRef = doc(db, 'patients', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      throw new Error('Patient not found');
    } catch (error) {
      console.error('Error getting patient by ID:', error);
      throw error.message;
    }
  },

  async getPatient(id) {
    return this.getPatientById(id);
  },

  async getPatients() {
    return this.getAllPatients();
  },

  // Add more patient-related methods as needed
};

export default PatientService; 