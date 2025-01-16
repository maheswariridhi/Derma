import { PatientStatus } from './constants';

export class Patient {
  constructor(data = {}) {
    this.id = data.id;
    this.name = data.name || '';
    this.status = data.status || PatientStatus.PENDING;
    this.phone = data.phone || '';
    this.email = data.email || '';
    this.appointmentDate = data.appointmentDate || '';
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
      [PatientStatus.ERROR]: "text-red-600 bg-red-100"
    };
    return styles[this.status] || styles[PatientStatus.PENDING];
  }
}

export default Patient; 