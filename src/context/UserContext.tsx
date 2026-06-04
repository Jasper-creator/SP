import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserId } from '../types';

interface UserContextType {
  userId: UserId | null;
  loading: boolean;
  setUser: (userId: UserId) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  userId: null,
  loading: true,
  setUser: async () => {},
  logout: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<UserId | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('userId').then(stored => {
      if (stored === 'jasper' || stored === 'senja') {
        setUserId(stored as UserId);
      }
      setLoading(false);
    });
  }, []);

  const setUser = async (id: UserId) => {
    await AsyncStorage.setItem('userId', id);
    setUserId(id);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userId');
    setUserId(null);
  };

  return (
    <UserContext.Provider value={{ userId, loading, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
