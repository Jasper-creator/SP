import React, { useEffect, useState } from 'react';
import {
  Animated,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './screens/HomeScreen';
import KauppalistaScreen from './screens/KauppalistaScreen';
import KohdelistaScreen from './screens/KohdelistaScreen';
import LeffalistaScreen from './screens/LeffalistaScreen';
import LoginScreen from './screens/LoginScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import TehdaanRuokaaScreen from './screens/TehdaanRuokaaScreen';
import TilaaRuokaaScreen from './screens/TilaaRuokaaScreen';
import TreffitScreen from './screens/TreffitScreen';
import { UserProvider, useUser } from './src/context/UserContext';
import { seedDefaultRecipes } from './src/firebase/db';
import {
  initFCM,
  onForegroundMessage,
  registerBackgroundHandler,
} from './src/firebase/fcm';

export type Screen =
  | 'home'
  | 'treffit'
  | 'ruoka'
  | 'kauppalista'
  | 'tilaa'
  | 'notifications'
  | 'leffalista'
  | 'kohdelista';

// Register background handler at module level (required by Firebase)
registerBackgroundHandler();

interface Banner {
  title: string;
  body: string;
}

function AppContent() {
  const { userId, loading, setUser } = useUser();
  const [screen, setScreen] = useState<Screen>('home');
  const [banner, setBanner] = useState<Banner | null>(null);
  const bannerOpacity = useState(new Animated.Value(0))[0];

  const goBack = () => setScreen('home');

  useEffect(() => {
    if (!userId) return;
    initFCM(userId).catch(() => {});
    seedDefaultRecipes().catch(() => {});

    return onForegroundMessage((title, body) => {
      setBanner({ title, body });
      Animated.sequence([
        Animated.timing(bannerOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3500),
        Animated.timing(bannerOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setBanner(null));
    });
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashHeart}>💕</Text>
      </View>
    );
  }

  if (!userId) {
    return <LoginScreen onSelect={setUser} />;
  }

  return (
    <View style={{ flex: 1 }}>
      {screen === 'home' && <HomeScreen onNavigate={setScreen} />}
      {screen === 'treffit' && <TreffitScreen onBack={goBack} />}
      {screen === 'ruoka' && <TehdaanRuokaaScreen onBack={goBack} />}
      {screen === 'kauppalista' && <KauppalistaScreen onBack={goBack} />}
      {screen === 'tilaa' && <TilaaRuokaaScreen onBack={goBack} />}
      {screen === 'notifications' && <NotificationsScreen onBack={goBack} />}
      {screen === 'leffalista' && <LeffalistaScreen onBack={goBack} />}
      {screen === 'kohdelista' && <KohdelistaScreen onBack={goBack} />}

      {banner && (
        <Animated.View style={[styles.banner, { opacity: bannerOpacity }]}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>{banner.title}</Text>
            <Text style={styles.bannerBody}>{banner.body}</Text>
          </View>
          <TouchableOpacity onPress={() => setBanner(null)}>
            <Text style={styles.bannerClose}>✕</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

export default function App() {
  return (
    <UserProvider>
      <SafeAreaProvider>
        <ImageBackground
          source={require('./Images/Background.webp')}
          style={{ flex: 1 }}
          resizeMode="cover"
        >
          <StatusBar barStyle="dark-content" />
          <AppContent />
        </ImageBackground>
      </SafeAreaProvider>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashHeart: { fontSize: 72 },
  banner: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#222',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  bannerContent: { flex: 1 },
  bannerTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  bannerBody: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  bannerClose: { color: '#888', fontSize: 16, padding: 4 },
});
