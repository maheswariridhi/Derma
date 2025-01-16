import { Patient } from '../models/Patient';

const MOCK_PATIENTS = [
  {
    id: 1,
    name: "Nancy Out of Network",
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

class PatientService {
  static useApi = false;

  async getPatients() {
    if (PatientService.useApi) {
      const response = await fetch('/api/patients');
      const data = await response.json();
      return data.map(patient => new Patient(patient));
    }
    return MOCK_PATIENTS.map(patient => new Patient(patient));
  }

  async getPatientById(id) {
    if (PatientService.useApi) {
      const response = await fetch(`/api/patients/${id}`);
      const data = await response.json();
      return new Patient(data);
    }
    const patient = MOCK_PATIENTS.find(p => p.id === parseInt(id));
    return new Patient(patient || {});
  }

  async updatePatient(id, patientData) {
    if (PatientService.useApi) {
      const response = await fetch(`/api/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
      });
      const data = await response.json();
      return new Patient(data);
    }
    return new Patient({ ...patientData, id });
  }

  async updateWorkflowStep(id, stepData, step) {
    if (PatientService.useApi) {
      const response = await fetch(`/api/patients/${id}/workflow/${step}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stepData)
      });
      return response.json();
    }
    console.log(`Updating workflow step ${step} for patient ${id}:`, stepData);
    return stepData;
  }
}

export default new PatientService(); 