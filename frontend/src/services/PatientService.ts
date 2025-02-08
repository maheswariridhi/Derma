import { db } from "../config/firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
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
};

export default PatientService;
