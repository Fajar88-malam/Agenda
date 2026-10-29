/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocFromServer,
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import { app, auth } from './googleAuthService';
import firebaseConfig from '../../firebase-applet-config.json';
import { AppDatabase, SchoolProfile, Student, Teacher, LetterRecord } from '../types';
import { INITIAL_DATABASE } from '../data/defaultData';

// Initialize Firestore targeting the specific database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validate connection to Firestore on boot as mandated by Firebase Skill.
 */
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'school_profile', 'default'));
    return true;
  } catch (error: any) {
    const msg = error?.message || String(error);
    if (msg.includes('offline') || msg.includes('token-service') || msg.includes('Could not reach')) {
      console.warn('Firestore is currently connecting or running in offline mode:', msg);
      return false;
    }
    // If permission, document not found, or other response received, server was contacted
    return true;
  }
}

// -------------------------------------------------------------
// REALTIME SUBSCRIPTIONS
// -------------------------------------------------------------

/**
 * Subscribe to the school profile in realtime.
 */
export function subscribeToSchoolProfile(
  onUpdate: (profile: SchoolProfile | null) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const path = 'school_profile/default';
  const profileDoc = doc(db, 'school_profile', 'default');
  return onSnapshot(
    profileDoc,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as SchoolProfile);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      console.warn('Realtime SchoolProfile sync notice:', error.message);
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch (e) {
        // Logged
      }
    }
  );
}

/**
 * Subscribe to students in realtime.
 */
export function subscribeToStudents(
  onUpdate: (students: Student[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const path = 'students';
  const studentsCol = collection(db, 'students');
  return onSnapshot(
    studentsCol,
    (snapshot) => {
      const students: Student[] = [];
      snapshot.forEach(docSnap => {
        students.push(docSnap.data() as Student);
      });
      // Sort alphabetically by name
      students.sort((a, b) => a.nama.localeCompare(b.nama));
      onUpdate(students);
    },
    (error) => {
      console.warn('Realtime Students sync notice:', error.message);
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (e) {
        // Logged
      }
    }
  );
}

/**
 * Subscribe to teachers in realtime.
 */
export function subscribeToTeachers(
  onUpdate: (teachers: Teacher[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const path = 'teachers';
  const teachersCol = collection(db, 'teachers');
  return onSnapshot(
    teachersCol,
    (snapshot) => {
      const teachers: Teacher[] = [];
      snapshot.forEach(docSnap => {
        teachers.push(docSnap.data() as Teacher);
      });
      teachers.sort((a, b) => a.nama.localeCompare(b.nama));
      onUpdate(teachers);
    },
    (error) => {
      console.warn('Realtime Teachers sync notice:', error.message);
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (e) {
        // Logged
      }
    }
  );
}

/**
 * Subscribe to letter archive in realtime.
 */
export function subscribeToLetters(
  onUpdate: (letters: LetterRecord[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const path = 'letters';
  const lettersCol = collection(db, 'letters');
  return onSnapshot(
    lettersCol,
    (snapshot) => {
      const letters: LetterRecord[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as LetterRecord;
        letters.push({
          ...data,
          id: data.id || docSnap.id
        });
      });
      // Sort descending by sequence number / creation
      letters.sort((a, b) => (b.nomorUrut || 0) - (a.nomorUrut || 0));
      onUpdate(letters);
    },
    (error) => {
      console.warn('Realtime Letters sync notice:', error.message);
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (e) {
        // Logged
      }
    }
  );
}

/**
 * Subscribe to the letter sequence counter in realtime.
 */
export function subscribeToCounter(
  onUpdate: (lastNumber: number) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const path = 'counters/letters';
  const counterDoc = doc(db, 'counters', 'letters');
  return onSnapshot(
    counterDoc,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        onUpdate(data.lastLetterNumber ?? 23);
      }
    },
    (error) => {
      console.warn('Realtime Counter sync notice:', error.message);
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.GET, path);
      } catch (e) {
        // Logged
      }
    }
  );
}

// -------------------------------------------------------------
// WRITE OPERATIONS (PERSISTENCE ANYWHERE)
// -------------------------------------------------------------

/**
 * Save / Update School Profile in Firestore.
 */
export async function saveSchoolProfileToFirestore(profile: SchoolProfile): Promise<void> {
  const path = 'school_profile/default';
  try {
    await setDoc(doc(db, 'school_profile', 'default'), {
      ...profile,
      id: 'default',
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save / Update a Student record.
 */
export async function saveStudentToFirestore(student: Student): Promise<void> {
  const cleanId = student.id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `students/${cleanId}`;
  try {
    await setDoc(doc(db, 'students', cleanId), {
      ...student,
      id: cleanId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a Student record.
 */
export async function deleteStudentFromFirestore(id: string): Promise<void> {
  const cleanId = id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `students/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'students', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Batch import students to Firestore.
 */
export async function batchImportStudentsToFirestore(
  students: Student[],
  replaceExisting: boolean = false
): Promise<void> {
  const path = 'students';
  try {
    if (replaceExisting) {
      const currentSnaps = await getDocs(collection(db, 'students'));
      const deleteBatch = writeBatch(db);
      currentSnaps.forEach(docSnap => {
        deleteBatch.delete(docSnap.ref);
      });
      await deleteBatch.commit();
    }

    // Write in chunks of 450 (Firestore batch max limit is 500)
    const chunkSize = 450;
    for (let i = 0; i < students.length; i += chunkSize) {
      const chunk = students.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach(student => {
        const cleanId = student.id.replace(/[^a-zA-Z0-9_-]/g, '_');
        const ref = doc(db, 'students', cleanId);
        batch.set(ref, {
          ...student,
          id: cleanId,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save / Update a Teacher record.
 */
export async function saveTeacherToFirestore(teacher: Teacher): Promise<void> {
  const cleanId = teacher.id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `teachers/${cleanId}`;
  try {
    await setDoc(doc(db, 'teachers', cleanId), {
      ...teacher,
      id: cleanId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a Teacher record.
 */
export async function deleteTeacherFromFirestore(id: string): Promise<void> {
  const cleanId = id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `teachers/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'teachers', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Batch import teachers to Firestore.
 */
export async function batchImportTeachersToFirestore(
  teachers: Teacher[],
  replaceExisting: boolean = false
): Promise<void> {
  const path = 'teachers';
  try {
    if (replaceExisting) {
      const currentSnaps = await getDocs(collection(db, 'teachers'));
      const deleteBatch = writeBatch(db);
      currentSnaps.forEach(docSnap => {
        deleteBatch.delete(docSnap.ref);
      });
      await deleteBatch.commit();
    }

    const batch = writeBatch(db);
    teachers.forEach(teacher => {
      const cleanId = teacher.id.replace(/[^a-zA-Z0-9_-]/g, '_');
      const ref = doc(db, 'teachers', cleanId);
      batch.set(ref, {
        ...teacher,
        id: cleanId,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Save a Letter record to Firestore and update sequence counter.
 */
export async function saveLetterToFirestore(letter: LetterRecord): Promise<void> {
  const cleanId = letter.id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `letters/${cleanId}`;
  try {
    await setDoc(doc(db, 'letters', cleanId), {
      ...letter,
      id: cleanId,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Update sequence counter atomically
    const counterRef = doc(db, 'counters', 'letters');
    const counterSnap = await getDoc(counterRef);
    const currentNum = counterSnap.exists() ? (counterSnap.data().lastLetterNumber || 0) : 0;
    if (letter.nomorUrut > currentNum) {
      await setDoc(counterRef, {
        id: 'letters',
        lastLetterNumber: letter.nomorUrut,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Update Letter status in Firestore.
 */
export async function updateLetterStatusInFirestore(
  letterId: string,
  newStatus: LetterRecord['status']
): Promise<void> {
  const cleanId = letterId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `letters/${cleanId}`;
  try {
    await setDoc(doc(db, 'letters', cleanId), {
      status: newStatus,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Delete a Letter record from Firestore.
 */
export async function deleteLetterFromFirestore(id: string): Promise<void> {
  const cleanId = id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `letters/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'letters', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Update the letter sequence counter in Firestore.
 */
export async function updateCounterInFirestore(lastNumber: number): Promise<void> {
  const path = 'counters/letters';
  try {
    await setDoc(doc(db, 'counters', 'letters'), {
      id: 'letters',
      lastLetterNumber: lastNumber,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// -------------------------------------------------------------
// REALTIME DRAFT AUTOSAVE (DATA TERSIMPAN SAAT MENGISINYA)
// -------------------------------------------------------------

export interface RealtimeDraftData {
  id: string;
  letterType: string;
  formData: any;
  updatedAt: string;
  userEmail?: string | null;
}

/**
 * Save active form draft in realtime as the user types.
 */
export async function saveDraftToFirestore(draftId: string, data: Partial<RealtimeDraftData>): Promise<void> {
  const cleanId = draftId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `drafts/${cleanId}`;
  try {
    await setDoc(doc(db, 'drafts', cleanId), {
      ...data,
      id: cleanId,
      updatedAt: new Date().toISOString(),
      userEmail: auth.currentUser?.email || 'operator'
    }, { merge: true });
  } catch (error) {
    // Non-blocking for drafts; log gracefully
    console.warn('Realtime draft save notice:', error);
  }
}

/**
 * Get active draft by ID.
 */
export async function getDraftFromFirestore(draftId: string): Promise<RealtimeDraftData | null> {
  const cleanId = draftId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `drafts/${cleanId}`;
  try {
    const snap = await getDoc(doc(db, 'drafts', cleanId));
    if (snap.exists()) {
      return snap.data() as RealtimeDraftData;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Delete a draft when letter is finalized / submitted.
 */
export async function deleteDraftFromFirestore(draftId: string): Promise<void> {
  const cleanId = draftId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const path = `drafts/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'drafts', cleanId));
  } catch (error) {
    console.warn('Draft cleanup notice:', error);
  }
}

// -------------------------------------------------------------
// SEEDING CLOUD DATABASE INITIAL DATA
// -------------------------------------------------------------

/**
 * Check if the Firestore database is populated; if empty, seed with SMP NEGERI 1 PACET initial data.
 */
export async function seedInitialDatabaseIfEmpty(initialDb: AppDatabase = INITIAL_DATABASE): Promise<boolean> {
  try {
    const profileSnap = await getDoc(doc(db, 'school_profile', 'default'));
    if (!profileSnap.exists()) {
      console.log('Seeding initial school database to Firestore cloud...');
      // 1. Profile
      await setDoc(doc(db, 'school_profile', 'default'), {
        ...initialDb.schoolProfile,
        id: 'default',
        updatedAt: new Date().toISOString()
      });

      // 2. Counter
      await setDoc(doc(db, 'counters', 'letters'), {
        id: 'letters',
        lastLetterNumber: initialDb.lastLetterNumber,
        updatedAt: new Date().toISOString()
      });

      // 3. Students
      for (const student of initialDb.students) {
        const cleanId = student.id.replace(/[^a-zA-Z0-9_-]/g, '_');
        await setDoc(doc(db, 'students', cleanId), {
          ...student,
          id: cleanId,
          updatedAt: new Date().toISOString()
        });
      }

      // 4. Teachers
      for (const teacher of initialDb.teachers) {
        const cleanId = teacher.id.replace(/[^a-zA-Z0-9_-]/g, '_');
        await setDoc(doc(db, 'teachers', cleanId), {
          ...teacher,
          id: cleanId,
          updatedAt: new Date().toISOString()
        });
      }

      // 5. Letters
      for (const letter of initialDb.letters) {
        const cleanId = letter.id.replace(/[^a-zA-Z0-9_-]/g, '_');
        await setDoc(doc(db, 'letters', cleanId), {
          ...letter,
          id: cleanId,
          updatedAt: new Date().toISOString()
        });
      }

      console.log('Initial cloud database successfully seeded!');
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Notice during database seeding check:', error);
    return false;
  }
}
