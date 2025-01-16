import { PatientStatus } from './constants';

export class Patient {
  constructor(data = {}) {
    this.id = data.id;
    this.name = data.name || data.patient || '';
    this.status = data.status || PatientStatus.PENDING;
    this.phone = data.phone || '';
    this.email = data.email || 'No email';
    this.appointmentDate = data.time || data.createdDate || data.appointment || '';
    this.treatmentValue = data.treatmentValue || '';
    this.condition = data.condition || '';
    this.lastVisit = data.lastVisit || '';
    this.treatmentPlan = data.treatmentPlan || {
      diagnosis: '',
      currentStatus: '',
      medications: [],
      nextSteps: []
    };
  }

  getStatusStyle() {
    const styles = {
      [PatientStatus.SAVED]: "text-green-600 bg-green-100",
      [PatientStatus.PENDING]: "text-yellow-600 bg-yellow-100",
      [PatientStatus.COMPLETED]: "text-blue-600 bg-blue-100",
      [PatientStatus.CONFIRMED]: "text-blue-600 bg-blue-100",
      [PatientStatus.ERROR]: "text-red-600 bg-red-100"
    };
    return styles[this.status] || styles[PatientStatus.PENDING];
  }

  toNavigationState() {
    return {
      state: {
        patient: {
          id: this.id,
          name: this.name,
          status: this.status,
          phone: this.phone,
          email: this.email,
          appointment: this.appointmentDate,
          treatmentValue: this.treatmentValue,
          condition: this.condition,
          lastVisit: this.lastVisit,
          treatmentPlan: this.treatmentPlan
        }
      }
    };
  }
}

export const transformPatients = (patientsData) => {
  return patientsData.map(data => new Patient(data));
}; 