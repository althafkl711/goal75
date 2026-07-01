import { db, isFirebaseConfigured, auth } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy
} from 'firebase/firestore';
import type { WeightLog, UserProfile, UserSettings, Goal75Data } from '../../types';

// Mock/Initial Data generator
// Clean Initial Data starting state (no pre-populated dummy logs)
const getInitialData = (): Goal75Data => {
  return {
    profile: {
      uid: 'local-user',
      name: 'Guest',
      startWeight: 90.0,
      goalWeight: 80.0,
      createdAt: new Date().toISOString()
    },
    weights: [], // Start 100% clean and empty
    completedChallenges: [],
    settings: {
      notificationsEnabled: true,
      morningReminder: true,
      afternoonReminder: true,
      eveningReminder: false
    }
  };
};

// Demo/Preview Data generator (kept as an optional utility)
const getInitialDemoData = (): Goal75Data => {
  const now = new Date();
  const subDays = (d: number) => {
    const copy = new Date(now);
    copy.setDate(copy.getDate() - d);
    return copy.toISOString();
  };

  const initialWeights: WeightLog[] = [
    {
      id: 'w1',
      value: 91.45,
      time: subDays(6).split('T')[0] + 'T07:30:00.000Z',
      type: 'Morning',
      notes: 'Starting my weight loss journey today! Feeling motivated.',
      createdAt: subDays(6)
    },
    {
      id: 'w2',
      value: 91.6,
      time: subDays(6).split('T')[0] + 'T21:45:00.000Z',
      type: 'Night',
      notes: 'Slightly higher after dinner, expected.',
      createdAt: subDays(6)
    },
    {
      id: 'w3',
      value: 91.2,
      time: subDays(5).split('T')[0] + 'T07:15:00.000Z',
      type: 'Morning',
      notes: 'Down slightly. Drinking more water.',
      createdAt: subDays(5)
    },
    {
      id: 'w4',
      value: 90.85,
      time: subDays(4).split('T')[0] + 'T07:45:00.000Z',
      type: 'Morning',
      notes: 'Completed the 15 pushups challenge yesterday!',
      createdAt: subDays(4)
    },
    {
      id: 'w5',
      value: 91.1,
      time: subDays(4).split('T')[0] + 'T21:10:00.000Z',
      type: 'Night',
      notes: 'Had pizza tonight. Probably water retention tomorrow.',
      createdAt: subDays(4)
    },
    {
      id: 'w6',
      value: 91.3,
      time: subDays(3).split('T')[0] + 'T08:00:00.000Z',
      type: 'Morning',
      notes: 'Yep, weight is up. Keeping consistent anyway.',
      createdAt: subDays(3)
    },
    {
      id: 'w7',
      value: 90.4,
      time: subDays(2).split('T')[0] + 'T07:30:00.000Z',
      type: 'Morning',
      notes: 'Huge drop! Had a good workout yesterday.',
      createdAt: subDays(2)
    },
    {
      id: 'w8',
      value: 90.1,
      time: subDays(1).split('T')[0] + 'T07:00:00.000Z',
      type: 'Morning',
      notes: 'Almost under 90kg. Streak is going strong.',
      createdAt: subDays(1)
    },
    {
      id: 'w9',
      value: 90.4,
      time: subDays(1).split('T')[0] + 'T22:00:00.000Z',
      type: 'Night',
      notes: 'Late night snack.',
      createdAt: subDays(1)
    },
    {
      id: 'w10',
      value: 89.65,
      time: now.toISOString().split('T')[0] + 'T07:30:00.000Z',
      type: 'Morning',
      notes: 'Finally broke into the 89s! Stoked!',
      createdAt: now.toISOString()
    }
  ];

  return {
    profile: {
      uid: 'local-user',
      name: 'Alex Rivera',
      startWeight: 91.45,
      goalWeight: 78.0,
      createdAt: subDays(6)
    },
    weights: initialWeights,
    completedChallenges: ['c1', 'c2'],
    settings: {
      notificationsEnabled: true,
      morningReminder: true,
      afternoonReminder: true,
      eveningReminder: false
    }
  };
};

export const loadDemoData = () => {
  if (typeof window === 'undefined') return;
  const initial = getInitialDemoData();
  localStorage.setItem('goal75_profile', JSON.stringify(initial.profile));
  localStorage.setItem('goal75_weights', JSON.stringify(initial.weights));
  localStorage.setItem('goal75_completed_challenges', JSON.stringify(initial.completedChallenges));
  localStorage.setItem('goal75_settings', JSON.stringify(initial.settings));
  window.location.reload();
};

// Check and initialize local storage keys if empty
const initLocalStorage = () => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('goal75_profile')) {
    const initial = getInitialData();
    localStorage.setItem('goal75_profile', JSON.stringify(initial.profile));
    localStorage.setItem('goal75_weights', JSON.stringify(initial.weights));
    localStorage.setItem('goal75_completed_challenges', JSON.stringify(initial.completedChallenges));
    localStorage.setItem('goal75_settings', JSON.stringify(initial.settings));
  }
};

initLocalStorage();

// Check if we should use Firebase or LocalStorage
const getUserId = () => {
  if (!isFirebaseConfigured) return null;
  return auth?.currentUser?.uid || null;
};

export const getProfile = async (): Promise<UserProfile | null> => {
  const uid = getUserId();
  if (uid && db) {
    try {
      const docRef = doc(db, 'users', uid, 'profile', 'main');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
    } catch (e) {
      console.error('Error fetching profile from Firestore:', e);
    }
    
    // If signed in but no profile exists, return user auth display name instead of local "Guest"
    const firebaseUser = auth?.currentUser;
    if (firebaseUser) {
      return {
        uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        startWeight: 90.0,
        goalWeight: 80.0,
        createdAt: new Date().toISOString()
      };
    }
  }
  
  // Local Fallback
  initLocalStorage();
  const raw = localStorage.getItem('goal75_profile');
  return raw ? JSON.parse(raw) : null;
};

export const updateProfile = async (profile: Partial<UserProfile>): Promise<UserProfile> => {
  const uid = getUserId();
  if (uid && db) {
    try {
      const docRef = doc(db, 'users', uid, 'profile', 'main');
      const docSnap = await getDoc(docRef);
      let updated: UserProfile;
      
      if (docSnap.exists()) {
        updated = { ...docSnap.data(), ...profile } as UserProfile;
      } else {
        updated = {
          uid,
          name: profile.name || 'User',
          startWeight: profile.startWeight || 90,
          goalWeight: profile.goalWeight || 80,
          createdAt: new Date().toISOString(),
          ...profile
        } as UserProfile;
      }
      
      await setDoc(docRef, updated, { merge: true });
      return updated;
    } catch (e) {
      console.error('Error updating profile in Firestore:', e);
    }
  }

  // Local fallback
  initLocalStorage();
  const raw = localStorage.getItem('goal75_profile');
  const current: UserProfile = raw ? JSON.parse(raw) : {
    uid: 'local-user',
    name: 'User',
    startWeight: 90,
    goalWeight: 80,
    createdAt: new Date().toISOString()
  };
  const updated = { ...current, ...profile };
  localStorage.setItem('goal75_profile', JSON.stringify(updated));
  return updated;
};

export const getWeights = async (): Promise<WeightLog[]> => {
  const uid = getUserId();
  if (uid && db) {
    try {
      const colRef = collection(db, 'users', uid, 'weights');
      const q = query(colRef, orderBy('time', 'desc'));
      const querySnapshot = await getDocs(q);
      const list: WeightLog[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as WeightLog);
      });
      // Sort ascending for easier charts manipulation if needed
      return list.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    } catch (e) {
      console.error('Error fetching weights from Firestore:', e);
    }
  }

  // Local fallback
  initLocalStorage();
  const raw = localStorage.getItem('goal75_weights');
  const weights: WeightLog[] = raw ? JSON.parse(raw) : [];
  return weights.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
};

export const addWeight = async (log: Omit<WeightLog, 'id' | 'createdAt'>): Promise<WeightLog> => {
  const uid = getUserId();
  const now = new Date().toISOString();
  
  if (uid && db) {
    try {
      const colRef = collection(db, 'users', uid, 'weights');
      const docRef = await addDoc(colRef, {
        ...log,
        createdAt: now
      });
      return { id: docRef.id, ...log, createdAt: now };
    } catch (e) {
      console.error('Error adding weight to Firestore:', e);
    }
  }

  // Local fallback
  initLocalStorage();
  const raw = localStorage.getItem('goal75_weights');
  const weights: WeightLog[] = raw ? JSON.parse(raw) : [];
  
  const newLog: WeightLog = {
    ...log,
    id: 'w_' + Math.random().toString(36).substr(2, 9),
    createdAt: now
  };
  
  weights.push(newLog);
  localStorage.setItem('goal75_weights', JSON.stringify(weights));
  return newLog;
};

export const updateWeight = async (id: string, log: Partial<WeightLog>): Promise<WeightLog | null> => {
  const uid = getUserId();
  if (uid && db) {
    try {
      const docRef = doc(db, 'users', uid, 'weights', id);
      await updateDoc(docRef, log as any);
      const docSnap = await getDoc(docRef);
      return { id, ...docSnap.data() } as WeightLog;
    } catch (e) {
      console.error('Error updating weight in Firestore:', e);
    }
  }

  // Local fallback
  initLocalStorage();
  const raw = localStorage.getItem('goal75_weights');
  let weights: WeightLog[] = raw ? JSON.parse(raw) : [];
  
  const index = weights.findIndex(w => w.id === id);
  if (index !== -1) {
    weights[index] = { ...weights[index], ...log };
    localStorage.setItem('goal75_weights', JSON.stringify(weights));
    return weights[index];
  }
  return null;
};

export const deleteWeight = async (id: string): Promise<boolean> => {
  const uid = getUserId();
  if (uid && db) {
    try {
      const docRef = doc(db, 'users', uid, 'weights', id);
      await deleteDoc(docRef);
      return true;
    } catch (e) {
      console.error('Error deleting weight from Firestore:', e);
    }
  }

  // Local fallback
  initLocalStorage();
  const raw = localStorage.getItem('goal75_weights');
  let weights: WeightLog[] = raw ? JSON.parse(raw) : [];
  
  const filtered = weights.filter(w => w.id !== id);
  localStorage.setItem('goal75_weights', JSON.stringify(filtered));
  return true;
};

export const getCompletedChallenges = async (): Promise<string[]> => {
  const uid = getUserId();
  if (uid && db) {
    try {
      const docRef = doc(db, 'users', uid, 'challenges', 'completed');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().completedIds || [];
      }
    } catch (e) {
      console.error('Error fetching challenges from Firestore:', e);
    }
  }

  // Local fallback
  initLocalStorage();
  const raw = localStorage.getItem('goal75_completed_challenges');
  return raw ? JSON.parse(raw) : [];
};

export const completeChallenge = async (challengeId: string): Promise<string[]> => {
  const uid = getUserId();
  if (uid && db) {
    try {
      const docRef = doc(db, 'users', uid, 'challenges', 'completed');
      const docSnap = await getDoc(docRef);
      let list: string[] = [];
      if (docSnap.exists()) {
        list = docSnap.data().completedIds || [];
      }
      if (!list.includes(challengeId)) {
        list.push(challengeId);
        await setDoc(docRef, { completedIds: list }, { merge: true });
      }
      return list;
    } catch (e) {
      console.error('Error completing challenge in Firestore:', e);
    }
  }

  // Local fallback
  initLocalStorage();
  const raw = localStorage.getItem('goal75_completed_challenges');
  let list: string[] = raw ? JSON.parse(raw) : [];
  if (!list.includes(challengeId)) {
    list.push(challengeId);
    localStorage.setItem('goal75_completed_challenges', JSON.stringify(list));
  }
  return list;
};

export const getSettings = async (): Promise<UserSettings> => {
  const uid = getUserId();
  if (uid && db) {
    try {
      const docRef = doc(db, 'users', uid, 'settings', 'general');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserSettings;
      }
    } catch (e) {
      console.error('Error fetching settings from Firestore:', e);
    }
  }

  // Local fallback
  initLocalStorage();
  const raw = localStorage.getItem('goal75_settings');
  return raw ? JSON.parse(raw) : {
    notificationsEnabled: true,
    morningReminder: true,
    afternoonReminder: true,
    eveningReminder: false
  };
};

export const updateSettings = async (settings: Partial<UserSettings>): Promise<UserSettings> => {
  const uid = getUserId();
  if (uid && db) {
    try {
      const docRef = doc(db, 'users', uid, 'settings', 'general');
      await setDoc(docRef, settings, { merge: true });
      const docSnap = await getDoc(docRef);
      return docSnap.data() as UserSettings;
    } catch (e) {
      console.error('Error updating settings in Firestore:', e);
    }
  }

  // Local fallback
  initLocalStorage();
  const raw = localStorage.getItem('goal75_settings');
  const current = raw ? JSON.parse(raw) : {
    notificationsEnabled: true,
    morningReminder: true,
    afternoonReminder: true,
    eveningReminder: false
  };
  const updated = { ...current, ...settings };
  localStorage.setItem('goal75_settings', JSON.stringify(updated));
  return updated;
};

// Clear/Reset function for testing
export const resetToDefaults = () => {
  localStorage.removeItem('goal75_profile');
  localStorage.removeItem('goal75_weights');
  localStorage.removeItem('goal75_completed_challenges');
  localStorage.removeItem('goal75_settings');
  initLocalStorage();
  window.location.reload();
};
