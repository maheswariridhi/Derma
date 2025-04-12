import { db } from "../config/firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { COLLECTIONS, HOSPITAL } from "../models/constants";

// Define interfaces based on the existing structure
interface Patient {
  id: string;
  name?: string;
  phone?: string;
  status: string;
  priority?: boolean;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

interface QueueEntry {
  id: string;
  patientId: string;
  queueType: string;
  tokenNumber: number;
  status: string;
  date: string;
  checkInTime: Timestamp;
  estimatedWaitTime?: number;
}

interface PatientFilters {
  status?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

// Define the PatientReport interface
interface PatientReport {
  id?: string;
  patientId: string;
  diagnosis?: string;
  diagnosisDetails?: string;
  medications?: Array<{ name: string; dosage: string }>;
  nextSteps?: string[];
  next_appointment?: string;
  recommendations?: any[];
  additional_notes?: string;
  selectedTreatments?: any[];
  selectedMedicines?: any[];
  created_at?: Timestamp;
  doctor?: string;
  messages?: {
    id: string;
    sender: 'patient' | 'doctor';
    content: string;
    timestamp: Timestamp;
  }[];
}

interface PatientProfileData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
}

const PatientService = {
  async getPatients(filters: PatientFilters = {}): Promise<Patient[]> {
    try {
      const patientsRef = collection(
        db,
        COLLECTIONS.HOSPITALS,
        HOSPITAL.ID,
        COLLECTIONS.PATIENTS
      );
      let q = query(patientsRef);

      if (filters.status) {
        q = query(q, where("status", "==", filters.status));
      }
      if (filters.sortBy) {
        q = query(q, orderBy(filters.sortBy, filters.sortDirection || "asc"));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate(),
      })) as Patient[];
    } catch (error) {
      console.error("Error fetching patients:", error);
      throw new Error(`Failed to fetch patients: ${(error as Error).message}`);
    }
  },

  async getQueuePatients(): Promise<QueueEntry[]> {
    try {
      console.log("Fetching queue patients...");
      const patientsRef = collection(db, "patients");
      const q = query(
        patientsRef,
        where("status", "==", "pending"),
        orderBy("created_at")
      );

      console.log("Query created, fetching docs...");
      const snapshot = await getDocs(q);

      console.log("Docs fetched, processing data...");
      return snapshot.docs.map((doc, index) => ({
        id: doc.id,
        ...doc.data(),
        token: index + 1,
        timeWaiting: this.calculateWaitingTime(doc.data().created_at),
      })) as QueueEntry[];
    } catch (error) {
      console.error("Detailed queue error:", error);
      throw new Error(`Failed to fetch queue: ${(error as Error).message}`);
    }
  },

  async updatePatientStatus(patientId: string, newStatus: string): Promise<boolean> {
    try {
      const docRef = doc(
        db,
        COLLECTIONS.HOSPITALS,
        HOSPITAL.ID,
        COLLECTIONS.PATIENTS,
        patientId
      );
      await updateDoc(docRef, {
        status: newStatus,
        updated_at: Timestamp.now(),
      });
      return true;
    } catch (error) {
      console.error("Error updating patient status:", error);
      throw new Error(`Failed to update patient status: ${(error as Error).message}`);
    }
  },

  async prioritizePatient(patientId: string): Promise<boolean> {
    try {
      const docRef = doc(
        db,
        COLLECTIONS.HOSPITALS,
        HOSPITAL.ID,
        COLLECTIONS.PATIENTS,
        patientId
      );
      await updateDoc(docRef, {
        priority: true,
        updated_at: Timestamp.now(),
      });
      return true;
    } catch (error) {
      console.error("Error prioritizing patient:", error);
      throw new Error(`Failed to prioritize patient: ${(error as Error).message}`);
    }
  },

  async checkInPatient(patientId: string, queueType: string = "check-up"): Promise<number> {
    try {
      const queueRef = collection(db, "queues");
      const today = new Date().toISOString().split("T")[0];

      const queueSnapshot = await getDocs(
        query(
          queueRef,
          where("date", "==", today),
          where("queueType", "==", queueType),
          orderBy("tokenNumber", "desc"),
          limit(1)
        )
      );

      const lastToken = queueSnapshot.docs[0]?.data()?.tokenNumber || 0;
      const newToken = lastToken + 1;

      await addDoc(queueRef, {
        patientId,
        tokenNumber: newToken,
        queueType,
        status: "waiting",
        date: today,
        checkInTime: Timestamp.now(),
        estimatedWaitTime: 15,
      });

      return newToken;
    } catch (error) {
      console.error("Error checking in patient:", error);
      throw error;
    }
  },

  async getQueueStatus(): Promise<Record<string, QueueEntry[]>> {
    try {
      const today = new Date().toISOString().split("T")[0];
      const queueRef = collection(
        db,
        COLLECTIONS.HOSPITALS,
        HOSPITAL.ID,
        COLLECTIONS.QUEUES
      );

      const snapshot = await getDocs(
        query(
          queueRef,
          where("date", "==", today),
          where("status", "in", ["waiting", "in-progress"]),
          orderBy("checkInTime")
        )
      );

      if (snapshot.empty) {
        return { "check-up": [], treatment: [], billing: [] };
      }

      return snapshot.docs.reduce((acc, doc) => {
        const data = doc.data() as QueueEntry;
        acc[data.queueType] = acc[data.queueType] || [];
        acc[data.queueType].push({ id: doc.id, ...data });
        return acc;
      }, {} as Record<string, QueueEntry[]>);
    } catch (error) {
      console.error("Error fetching queue status:", error);
      return { "check-up": [], treatment: [], billing: [] };
    }
  },

  async updateQueueStatus(queueId: string, newStatus: string): Promise<void> {
    try {
      const queueRef = doc(db, "queues", queueId);
      await updateDoc(queueRef, {
        status: newStatus,
        statusUpdatedAt: Timestamp.now(),
        ...(newStatus === "in-progress" ? { startTime: Timestamp.now() } : {}),
        ...(newStatus === "completed" ? { endTime: Timestamp.now() } : {}),
      });
    } catch (error) {
      console.error("Error updating queue status:", error);
      throw error;
    }
  },

  calculateWaitingTime(checkInTime?: Timestamp): string {
    if (!checkInTime) return "0 min";
    const now = new Date();
    const checkInDate = checkInTime.toDate();
    const diffMs = now.getTime() - checkInDate.getTime();
    const minutes = Math.floor(diffMs / 60000);

    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  },

  async getPatientById(patientId: string): Promise<Patient> {
    try {
      const docRef = doc(
        db,
        COLLECTIONS.HOSPITALS,
        HOSPITAL.ID,
        COLLECTIONS.PATIENTS,
        patientId
      );
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Patient not found");
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
        created_at: docSnap.data().created_at?.toDate(),
      } as Patient;
    } catch (error) {
      console.error("Error fetching patient:", error);
      throw new Error(`Failed to fetch patient: ${(error as Error).message}`);
    }
  },

  async getPatientDashboardData() {
    try {
      // For demo purposes, we'll just show all reports
      // In a real app with authentication, you would filter by the current user's ID
      const reports = await this.getAllReports();
      
      // Convert reports to Visit format for the dashboard
      const recentVisits = reports.map(report => ({
        id: report.id || '',
        date: report.created_at ? report.created_at.toDate().toISOString() : new Date().toISOString(),
        type: 'Consultation',
        doctor: report.doctor || 'Dr. Smith',
        status: 'completed'
      }));
      
      // Mock data for the dashboard
      return {
        activeQueue: null,
        upcomingAppointment: null,
        recentVisits,
        notifications: [],
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw new Error(`Failed to fetch dashboard data: ${(error as Error).message}`);
    }
  },

  async getAllReports(): Promise<PatientReport[]> {
    try {
      const reportsRef = collection(
        db,
        COLLECTIONS.HOSPITALS,
        HOSPITAL.ID,
        COLLECTIONS.REPORTS
      );
      
      const snapshot = await getDocs(reportsRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PatientReport[];
    } catch (error) {
      console.error('Error fetching all reports:', error);
      return [];
    }
  },

  async sendPatientReport(reportData: PatientReport): Promise<boolean> {
    try {
      const reportsRef = collection(
        db,
        COLLECTIONS.HOSPITALS,
        HOSPITAL.ID,
        COLLECTIONS.REPORTS
      );
      
      // Create a new report with the current timestamp and empty messages array
      await addDoc(reportsRef, {
        ...reportData,
        created_at: Timestamp.now(),
        doctor: reportData.doctor || 'Doctor',
        messages: [] // Initialize empty messages array for chat functionality
      });
      
      // Update patient's status to indicate a report was sent
      if (reportData.patientId) {
        const patientRef = doc(
          db, 
          COLLECTIONS.HOSPITALS, 
          HOSPITAL.ID, 
          COLLECTIONS.PATIENTS, 
          reportData.patientId
        );
        
        await updateDoc(patientRef, {
          lastReportDate: Timestamp.now(),
          status: 'report-sent',
          updated_at: Timestamp.now()
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error sending patient report:', error);
      throw new Error(`Failed to send patient report: ${(error as Error).message}`);
    }
  },
  
  async getPatientReports(patientId: string): Promise<PatientReport[]> {
    try {
      const reportsRef = collection(
        db,
        COLLECTIONS.HOSPITALS,
        HOSPITAL.ID,
        COLLECTIONS.REPORTS
      );
      
      const q = query(
        reportsRef,
        where('patientId', '==', patientId),
        orderBy('created_at', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PatientReport[];
    } catch (error) {
      console.error('Error fetching patient reports:', error);
      throw new Error(`Failed to fetch patient reports: ${(error as Error).message}`);
    }
  },
  
  async getReportById(reportId: string): Promise<PatientReport> {
    try {
      const reportRef = doc(
        db,
        COLLECTIONS.HOSPITALS,
        HOSPITAL.ID,
        COLLECTIONS.REPORTS,
        reportId
      );
      
      const snapshot = await getDoc(reportRef);
      if (!snapshot.exists()) {
        throw new Error('Report not found');
      }
      
      return {
        id: snapshot.id,
        ...snapshot.data()
      } as PatientReport;
    } catch (error) {
      console.error('Error fetching report:', error);
      throw new Error(`Failed to fetch report: ${(error as Error).message}`);
    }
  },
  
  async sendMessageToReport(reportId: string, message: string, sender: 'patient' | 'doctor'): Promise<boolean> {
    try {
      const reportRef = doc(
        db,
        COLLECTIONS.HOSPITALS,
        HOSPITAL.ID,
        COLLECTIONS.REPORTS,
        reportId
      );
      
      // Get the current messages
      const reportSnap = await getDoc(reportRef);
      if (!reportSnap.exists()) {
        throw new Error('Report not found');
      }
      
      const report = reportSnap.data();
      const messages = report.messages || [];
      
      // Add the new message
      const newMessage = {
        id: crypto.randomUUID(), // Generate a unique ID for the message
        sender,
        content: message,
        timestamp: Timestamp.now(),
        readByDoctor: sender === 'doctor', // If doctor sent it, mark as read by doctor
        readByPatient: sender === 'patient' // If patient sent it, mark as read by patient
      };
      
      // Update the report with the new message
      await updateDoc(reportRef, {
        messages: [...messages, newMessage]
      });
      
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error(`Failed to send message: ${(error as Error).message}`);
    }
  },

  async getReportsWithUnreadMessages(): Promise<PatientReport[]> {
    try {
      const reportsRef = collection(
        db,
        COLLECTIONS.HOSPITALS,
        HOSPITAL.ID,
        COLLECTIONS.REPORTS
      );
      
      // First, get all reports
      const snapshot = await getDocs(reportsRef);
      
      // Go through each report and check for unread messages
      const reportsWithUnread = [];
      
      for (const doc of snapshot.docs) {
        const reportData = doc.data();
        const messages = reportData.messages || [];
        
        // Get the patient name for the report
        let patientName = 'Unknown';
        try {
          if (reportData.patientId) {
            const patientDoc = await getDoc(
              doc(db, COLLECTIONS.HOSPITALS, HOSPITAL.ID, COLLECTIONS.PATIENTS, reportData.patientId)
            );
            if (patientDoc.exists()) {
              patientName = patientDoc.data().name || 'Unknown';
            }
          }
        } catch (error) {
          console.error('Error fetching patient name:', error);
        }
        
        // Calculate unread messages (from patient that doctor hasn't seen)
        const unreadMessages = messages.filter(
          (msg: any) => msg.sender === 'patient' && !msg.readByDoctor
        ).length;
        
        // Get timestamp of latest message
        let lastMessageTime = null;
        if (messages.length > 0) {
          const latestMessage = messages[messages.length - 1];
          lastMessageTime = latestMessage.timestamp?.toDate();
        }
        
        // If there are unread messages or recent messages (within last 7 days)
        if (unreadMessages > 0 || 
            (lastMessageTime && (new Date().getTime() - lastMessageTime.getTime()) < 7 * 24 * 60 * 60 * 1000)) {
          reportsWithUnread.push({
            id: doc.id,
            patientId: reportData.patientId,
            patientName,
            diagnosis: reportData.diagnosis,
            created_at: reportData.created_at,
            doctor: reportData.doctor,
            unreadMessages,
            lastMessageTime
          });
        }
      }
      
      // Sort by unread messages count (desc) and then by last message time (desc)
      return reportsWithUnread.sort((a, b) => {
        if (a.unreadMessages !== b.unreadMessages) {
          return b.unreadMessages - a.unreadMessages;
        }
        
        if (a.lastMessageTime && b.lastMessageTime) {
          return b.lastMessageTime.getTime() - a.lastMessageTime.getTime();
        }
        
        return 0;
      });
    } catch (error) {
      console.error('Error fetching reports with unread messages:', error);
      return [];
    }
  },

  async updateReportMessages(reportId: string, messages: any[]): Promise<boolean> {
    try {
      const reportRef = doc(
        db,
        COLLECTIONS.HOSPITALS,
        HOSPITAL.ID,
        COLLECTIONS.REPORTS,
        reportId
      );
      
      await updateDoc(reportRef, { messages });
      return true;
    } catch (error) {
      console.error('Error updating report messages:', error);
      throw new Error(`Failed to update report messages: ${(error as Error).message}`);
    }
  },

  async getPatientProfile(): Promise<PatientProfileData> {
    try {
      // Get the current user's ID from auth (you'll need to implement this)
      const currentUserId = await this.getCurrentUserId();
      
      const docRef = doc(
        db,
        COLLECTIONS.HOSPITALS,
        HOSPITAL.ID,
        COLLECTIONS.PATIENTS,
        currentUserId
      );
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Patient profile not found");
      }

      const data = docSnap.data();
      return {
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        dateOfBirth: data.dateOfBirth || "",
        address: data.address || "",
      };
    } catch (error) {
      console.error("Error fetching patient profile:", error);
      throw new Error(`Failed to fetch patient profile: ${(error as Error).message}`);
    }
  },

  async updateProfile(profile: PatientProfileData): Promise<void> {
    try {
      // Get the current user's ID from auth (you'll need to implement this)
      const currentUserId = await this.getCurrentUserId();
      
      const docRef = doc(
        db,
        COLLECTIONS.HOSPITALS,
        HOSPITAL.ID,
        COLLECTIONS.PATIENTS,
        currentUserId
      );

      await updateDoc(docRef, {
        ...profile,
        updated_at: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating patient profile:", error);
      throw new Error(`Failed to update patient profile: ${(error as Error).message}`);
    }
  },

  // Helper method to get current user ID (you'll need to implement this based on your auth system)
  async getCurrentUserId(): Promise<string> {
    // TODO: Implement this method based on your authentication system
    // For example, if using Firebase Auth:
    // return auth.currentUser?.uid;
    throw new Error("getCurrentUserId not implemented");
  },

  async registerPatient(patientData: { name: string; email: string; phone: string; }): Promise<string> {
    try {
      const patientsRef = collection(
        db,
        COLLECTIONS.HOSPITALS,
        HOSPITAL.ID,
        COLLECTIONS.PATIENTS
      );

      // Add the new patient document
      const docRef = await addDoc(patientsRef, {
        ...patientData,
        status: 'active',
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });

      return docRef.id;
    } catch (error) {
      console.error("Error registering patient:", error);
      throw new Error(`Failed to register patient: ${(error as Error).message}`);
    }
  },

  async deletePatient(patientId: string): Promise<boolean> {
    try {
      const docRef = doc(
        db,
        COLLECTIONS.HOSPITALS,
        HOSPITAL.ID,
        COLLECTIONS.PATIENTS,
        patientId
      );
      
      // First, check if the patient exists
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error("Patient not found");
      }

      // Delete the patient document
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error("Error deleting patient:", error);
      throw new Error(`Failed to delete patient: ${(error as Error).message}`);
    }
  }
};

export default PatientService;
