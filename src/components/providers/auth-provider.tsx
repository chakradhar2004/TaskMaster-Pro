'use client';

import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getClientServices } from '@/lib/firebase/config';
import type { FirebaseOptions } from 'firebase/app';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  idToken: string | null;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  idToken: null,
});

export const AuthProvider = ({ 
  children,
  firebaseConfig
}: { 
  children: React.ReactNode,
  firebaseConfig: FirebaseOptions
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState<string | null>(null);

  const { auth } = getClientServices();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const token = await user.getIdToken();
        setIdToken(token);
      } else {
        setUser(null);
        setIdToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <AuthContext.Provider value={{ user, loading, idToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
