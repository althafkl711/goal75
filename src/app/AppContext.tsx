import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import confetti from 'canvas-confetti';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile as authUpdateProfile
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { 
  doc, 
  setDoc
} from 'firebase/firestore';
import { auth, googleProvider, db, isFirebaseConfigured } from '../services/firebase/config';
import { 
  getProfile, 
  updateProfile, 
  getWeights, 
  addWeight, 
  updateWeight, 
  deleteWeight, 
  getCompletedChallenges, 
  completeChallenge, 
  getSettings, 
  updateSettings 
} from '../services/firestore/db';
import type { UserProfile, WeightLog, UserSettings } from '../types';
import { calculateLoggingStreak } from '../utils/insights';
import { sendLocalNotification, requestNotificationPermission } from '../services/notifications/localNotifications';

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  profile: UserProfile | null;
  weights: WeightLog[];
  completedChallenges: string[];
  settings: UserSettings;
  isLoading: boolean;
  isLocalMode: boolean;
  streak: number;
  updateProfileData: (profile: Partial<UserProfile>) => Promise<void>;
  addWeightLog: (value: number, type: 'Morning' | 'Night', notes?: string, dateStr?: string) => Promise<WeightLog>;
  updateWeightLog: (id: string, log: Partial<WeightLog>) => Promise<void>;
  deleteWeightLog: (id: string) => Promise<void>;
  completeChallengeId: (challengeId: string) => Promise<void>;
  updateSettingsData: (settings: Partial<UserSettings>) => Promise<void>;
  triggerConfetti: () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

const InnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const qc = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Monitor Authentication State
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
      
      // When auth changes, wipe Query caches and reload
      qc.invalidateQueries({ queryKey: ['profile'] });
      qc.invalidateQueries({ queryKey: ['weights'] });
      qc.invalidateQueries({ queryKey: ['completedChallenges'] });
      qc.invalidateQueries({ queryKey: ['settings'] });
      
      // Auto-migrate local storage data to Cloud if signing in and local data exists
      if (firebaseUser) {
        try {
          await syncLocalDataToFirestore(firebaseUser.uid);
          // Invalidate again to fetch newly synced data
          qc.invalidateQueries({ queryKey: ['profile'] });
          qc.invalidateQueries({ queryKey: ['weights'] });
          qc.invalidateQueries({ queryKey: ['completedChallenges'] });
          qc.invalidateQueries({ queryKey: ['settings'] });
        } catch (e) {
          console.error('Failed to sync guest data to cloud:', e);
        }
      }
    });

    return unsubscribe;
  }, [qc]);

  // Sync Guest Data to Firestore when user registers or logs in
  const syncLocalDataToFirestore = async (uid: string) => {
    if (!db) return;
    
    const localProfileRaw = localStorage.getItem('goal75_profile');
    const localWeightsRaw = localStorage.getItem('goal75_weights');
    const localChallengesRaw = localStorage.getItem('goal75_completed_challenges');
    const localSettingsRaw = localStorage.getItem('goal75_settings');

    const defaultProfile = {
      uid,
      name: auth?.currentUser?.displayName || 'User',
      startWeight: 91.45,
      goalWeight: 78.0,
      createdAt: new Date().toISOString()
    };

    // 1. Profile Sync
    let profileData = defaultProfile;
    if (localProfileRaw) {
      const parsed = JSON.parse(localProfileRaw);
      const finalName = (parsed.name && parsed.name !== 'Guest') 
        ? parsed.name 
        : (auth?.currentUser?.displayName || parsed.name || 'User');
      
      profileData = {
        uid,
        name: finalName,
        startWeight: parsed.startWeight || defaultProfile.startWeight,
        goalWeight: parsed.goalWeight || defaultProfile.goalWeight,
        createdAt: parsed.createdAt || defaultProfile.createdAt
      };
    }
    await setDoc(doc(db, 'users', uid, 'profile', 'main'), profileData, { merge: true });

    // 2. Weights Sync
    if (localWeightsRaw) {
      const weights: WeightLog[] = JSON.parse(localWeightsRaw);
      for (const w of weights) {
        await setDoc(doc(db, 'users', uid, 'weights', w.id), {
          value: w.value,
          time: w.time,
          type: w.type,
          notes: w.notes || '',
          createdAt: w.createdAt
        }, { merge: true });
      }
    }

    // 3. Challenges Sync
    if (localChallengesRaw) {
      const challenges: string[] = JSON.parse(localChallengesRaw);
      await setDoc(doc(db, 'users', uid, 'challenges', 'completed'), {
        completedIds: challenges
      }, { merge: true });
    }

    // 4. Settings Sync
    if (localSettingsRaw) {
      const settings = JSON.parse(localSettingsRaw);
      await setDoc(doc(db, 'users', uid, 'settings', 'general'), settings, { merge: true });
    }

    // Clean up local items so we don't run this loop next time
    localStorage.removeItem('goal75_profile');
    localStorage.removeItem('goal75_weights');
    localStorage.removeItem('goal75_completed_challenges');
    localStorage.removeItem('goal75_settings');
  };

  // Queries
  const { data: profile = null, isLoading: loadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    enabled: !authLoading
  });

  const { data: weights = [], isLoading: loadingWeights } = useQuery({
    queryKey: ['weights'],
    queryFn: getWeights,
    enabled: !authLoading
  });

  const { data: completedChallenges = [], isLoading: loadingChallenges } = useQuery({
    queryKey: ['completedChallenges'],
    queryFn: getCompletedChallenges,
    enabled: !authLoading
  });

  const { data: settings = {
    notificationsEnabled: true,
    morningReminder: true,
    afternoonReminder: true,
    eveningReminder: false
  }, isLoading: loadingSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
    enabled: !authLoading
  });

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
    }
  });

  const addWeightMutation = useMutation({
    mutationFn: addWeight,
    onSuccess: (newLog) => {
      qc.invalidateQueries({ queryKey: ['weights'] });
      
      if (profile && newLog.value <= profile.goalWeight) {
        triggerConfetti();
        sendLocalNotification(
          '🏆 Goal Reached!',
          `Incredible! You weighed in at ${newLog.value}kg, meeting your goal of ${profile.goalWeight}kg!`
        );
      } else if (profile && weights.length > 0) {
        const previousLowest = Math.min(...weights.map(w => w.value));
        if (Math.floor(newLog.value) < Math.floor(previousLowest) && Math.floor(newLog.value) % 5 === 0) {
          triggerConfetti();
          sendLocalNotification(
            '🎉 Milestone Unlocked!',
            `Awesome progress! You've broken under ${Math.floor(newLog.value)}kg!`
          );
        }
      }
    }
  });

  const updateWeightMutation = useMutation({
    mutationFn: ({ id, log }: { id: string; log: Partial<WeightLog> }) => updateWeight(id, log),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['weights'] })
  });

  const deleteWeightMutation = useMutation({
    mutationFn: deleteWeight,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['weights'] })
  });

  const completeChallengeMutation = useMutation({
    mutationFn: completeChallenge,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['completedChallenges'] });
      triggerConfetti();
      sendLocalNotification(
        '💪 Challenge Complete!',
        'Consistency builds results. Keep pushing forward!'
      );
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: (newSettings) => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      if (newSettings.notificationsEnabled) {
        requestNotificationPermission();
      }
    }
  });

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#D7FF2F', '#52D273', '#FFFFFF']
    });
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#D7FF2F', '#52D273']
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#D7FF2F', '#52D273']
      });
    }, 250);
  };

  // Auth Functions
  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) return;
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!auth) return;
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    if (!auth) return;
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await authUpdateProfile(cred.user, { displayName });
    
    // Set Firestore profile initial state
    await updateProfile({
      name: displayName,
      startWeight: profile?.startWeight || 91.45,
      goalWeight: profile?.goalWeight || 78.0,
    });
  };

  const signOutUser = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    await updateProfileMutation.mutateAsync(data);
  };

  const addWeightLog = async (value: number, type: 'Morning' | 'Night', notes?: string, dateStr?: string) => {
    const time = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();
    return await addWeightMutation.mutateAsync({
      value,
      type,
      notes,
      time
    });
  };

  const updateWeightLog = async (id: string, log: Partial<WeightLog>) => {
    await updateWeightMutation.mutateAsync({ id, log });
  };

  const deleteWeightLog = async (id: string) => {
    await deleteWeightMutation.mutateAsync(id);
  };

  const completeChallengeId = async (challengeId: string) => {
    await completeChallengeMutation.mutateAsync(challengeId);
  };

  const updateSettingsData = async (data: Partial<UserSettings>) => {
    await updateSettingsMutation.mutateAsync(data);
  };

  const streak = calculateLoggingStreak(weights);

  const isLocalMode = !isFirebaseConfigured || !user;
  const isAuthenticated = !!user;

  const isLoading = authLoading || loadingProfile || loadingWeights || loadingChallenges || loadingSettings;

  return (
    <AppContext.Provider value={{
      user,
      isAuthenticated,
      profile,
      weights,
      completedChallenges,
      settings,
      isLoading,
      isLocalMode,
      streak,
      updateProfileData,
      addWeightLog,
      updateWeightLog,
      deleteWeightLog,
      completeChallengeId,
      updateSettingsData,
      triggerConfetti,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOutUser
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <InnerProvider>
        {children}
      </InnerProvider>
    </QueryClientProvider>
  );
};
