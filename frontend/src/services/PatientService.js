import { db } from '../config/firebase';
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { COLLECTIONS, HOSPITAL, PatientStatus } from '../models/constants';

const PatientService = {
  // Get all patients with optional filters
  async getPatients(filters = {}) {
    try {
      const patientsRef = collection(db, COLLECTIONS.HOSPITALS, HOSPITAL.ID, COLLECTIONS.PATIENTS);
      let q = query(patientsRef);

      // Add filters if provided
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters.sortBy) {
        q = query(q, orderBy(filters.sortBy, filters.sortDirection || 'asc'));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() // Convert Firestore timestamp
      }));
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw new Error(`Failed to fetch patients: ${error.message}`);
    }
  },

  // Get queue patients (not completed)
  async getQueuePatients() {
    try {
      // Add debug logging
      console.log('Fetching queue patients...');
      
      const patientsRef = collection(db, 'patients'); // Simplified path
      const q = query(patientsRef, where('status', '==', 'pending'), orderBy('created_at'));
      
      console.log('Query created, fetching docs...');
      const snapshot = await getDocs(q);
      
      console.log('Docs fetched, processing data...');
      const patients = snapshot.docs.map((doc, index) => ({
        id: doc.id,
        ...doc.data(),
        token: index + 1,
        timeWaiting: this.calculateWaitingTime(doc.data().created_at?.toDate())
      }));
      
      console.log('Processed patients:', patients);
      return patients;
    } catch (error) {
      console.error('Detailed queue error:', error);
      throw new Error(`Failed to fetch queue: ${error.message}`);
    }
  },

  // Update patient status
  async updatePatientStatus(patientId, newStatus) {
    try {
      const docRef = doc(db, COLLECTIONS.HOSPITALS, HOSPITAL.ID, COLLECTIONS.PATIENTS, patientId);
      await updateDoc(docRef, { 
        status: newStatus,
        updated_at: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error updating patient status:', error);
      throw new Error(`Failed to update patient status: ${error.message}`);
    }
  },

  // Prioritize patient
  async prioritizePatient(patientId) {
    try {
      const docRef = doc(db, COLLECTIONS.HOSPITALS, HOSPITAL.ID, COLLECTIONS.PATIENTS, patientId);
      await updateDoc(docRef, { 
        priority: true,
        updated_at: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error prioritizing patient:', error);
      throw new Error(`Failed to prioritize patient: ${error.message}`);
    }
  },

  // Check-in a new patient to queue
  async checkInPatient(patientId, queueType = 'check-up') {
    try {
      const queueRef = collection(db, 'queues');
      const today = new Date().toISOString().split('T')[0];
      
      // Get current queue number for today
      const queueSnapshot = await getDocs(
        query(queueRef, 
          where('date', '==', today),
          where('queueType', '==', queueType),
          orderBy('tokenNumber', 'desc'),
          limit(1)
        )
      );
      
      const lastToken = queueSnapshot.docs[0]?.data()?.tokenNumber || 0;
      const newToken = lastToken + 1;

      // Add to queue collection
      await addDoc(queueRef, {
        patientId,
        tokenNumber: newToken,
        queueType,
        status: 'waiting',
        date: today,
        checkInTime: new Date(),
        estimatedWaitTime: 15 // minutes
      });

      return newToken;
    } catch (error) {
      console.error('Error checking in patient:', error);
      throw error;
    }
  },

  // Get queue status for each type
  async getQueueStatus() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const queueRef = collection(db, COLLECTIONS.HOSPITALS, HOSPITAL.ID, COLLECTIONS.QUEUES);
      const queueTypes = ['check-up', 'treatment', 'billing'];
      
      // Initialize empty queues object with all queue types
      const queues = {
        'check-up': [],
        'treatment': [],
        'billing': []
      };

      const snapshot = await getDocs(
        query(queueRef,
          where('date', '==', today),
          where('status', 'in', ['waiting', 'in-progress']),
          orderBy('checkInTime')
        )
      );

      // If no documents found, return the initialized empty queues
      if (snapshot.empty) {
        return queues;
      }

      // Group queues by type
      const queuesByType = snapshot.docs.reduce((acc, doc) => {
        const data = doc.data();
        const type = data.queueType || 'check-up'; // Provide default type if missing
        if (!acc[type]) acc[type] = [];
        acc[type].push({ id: doc.id, ...data });
        return acc;
      }, {});

      // Get all unique patient IDs
      const patientIds = [...new Set(snapshot.docs.map(doc => doc.data().patientId))];

      // Fetch all patient data in one batch using correct path
      const patientDocs = await Promise.all(
        patientIds.map(id => getDoc(doc(db, COLLECTIONS.HOSPITALS, HOSPITAL.ID, COLLECTIONS.PATIENTS, id)))
      );

      // Create patient lookup map
      const patientMap = patientDocs.reduce((acc, doc) => {
        if (!doc.exists()) return acc;
        const data = doc.data();
        acc[doc.id] = {
          id: doc.id,
          name: data.name,
          phone: data.phone
        };
        return acc;
      }, {});

      // Update queues object with found data
      queueTypes.forEach(type => {
        if (queuesByType[type]) {
          queues[type] = queuesByType[type].map(queue => ({
            id: queue.id,
            ...queue,
            patient: patientMap[queue.patientId] || { name: 'Unknown', phone: 'N/A' },
            timeWaiting: this.calculateWaitingTime(queue.checkInTime)
          }));
        }
      });

      return queues;
    } catch (error) {
      console.error('Error fetching queue status:', error);
      // Return empty queues object instead of throwing
      return {
        'check-up': [],
        'treatment': [],
        'billing': []
      };
    }
  },

  // Update patient queue status
  async updateQueueStatus(queueId, newStatus) {
    try {
      const queueRef = doc(db, 'queues', queueId);
      await updateDoc(queueRef, {
        status: newStatus,
        statusUpdatedAt: new Date(),
        ...(newStatus === 'in-progress' ? { startTime: new Date() } : {}),
        ...(newStatus === 'completed' ? { endTime: new Date() } : {})
      });
    } catch (error) {
      console.error('Error updating queue status:', error);
      throw error;
    }
  },

  // Calculate waiting time
  calculateWaitingTime(checkInTime) {
    if (!checkInTime) return '0 min';
    const now = new Date();
    const diffMs = now - checkInTime.toDate();
    const minutes = Math.floor(diffMs / 60000);
    
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  },

  // Get patient by ID
  async getPatientById(patientId) {
    try {
      const docRef = doc(db, COLLECTIONS.HOSPITALS, HOSPITAL.ID, COLLECTIONS.PATIENTS, patientId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Patient not found');
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
        created_at: docSnap.data().created_at?.toDate()
      };
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw new Error(`Failed to fetch patient: ${error.message}`);
    }
  }
};

export default PatientService;
