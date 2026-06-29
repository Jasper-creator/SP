import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ImageBackground,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BasicView, { fontFamily, lightShadow } from './Components/BasicView';
import HomeScreen from './screens/HomeScreen';
import KauppalistaScreen from './screens/KauppalistaScreen';
import KohdelistaScreen from './screens/KohdelistaScreen';
import LahjapakettScreen from './screens/LahjapakettScreen';
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
  onNotificationTap,
  getInitialNotificationScreen,
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
  | 'kohdelista'
  | 'lahjapaketti';

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
  const [showBirthday, setShowBirthday] = useState(false);
  const birthdayScale = useRef(new Animated.Value(0.85)).current;
  const birthdayOpacity = useRef(new Animated.Value(0)).current;

  const goBack = () => setScreen('home');

  useEffect(() => {
    if (userId !== 'senja') return;
    AsyncStorage.getItem('birthday_senja_24').then(val => {
      if (!val) {
        setShowBirthday(true);
        Animated.parallel([
          Animated.spring(birthdayScale, {
            toValue: 1,
            useNativeDriver: true,
            bounciness: 12,
          }),
          Animated.timing(birthdayOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
        ]).start();
      }
    });
  }, [userId]);

  const dismissBirthday = async () => {
    await AsyncStorage.setItem('birthday_senja_24', 'true');
    setShowBirthday(false);
  };

  useEffect(() => {
    const unsubscribe = onNotificationTap(screen => {
      setScreen(screen as Screen);
    });
    getInitialNotificationScreen().then(screen => {
      if (screen) setScreen(screen as Screen);
    });
    return unsubscribe;
  }, []);

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
      {screen === 'lahjapaketti' && <LahjapakettScreen onBack={goBack} />}

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

      {showBirthday && (
        <Modal transparent animationType="none">
          <ImageBackground
            source={require('./Images/Background.webp')}
            style={styles.bdayOverlay}
            resizeMode="cover"
          >
            <Animated.View
              style={{
                transform: [{ scale: birthdayScale }],
                opacity: birthdayOpacity,
              }}
            >
              <BasicView style={styles.bdayCard}>
                <Text style={styles.bdayCake}>🎂</Text>
                <Text style={styles.bdayTitle}>
                  Hyvää 24V Syntymäpäivää{'\n'}Senja! 🎉
                </Text>
                <Text style={styles.bdayMsg}>
                  Teit maailmasta paremman paikan{'\n'}
                  syntymällä siihen. Rakastan sua{'\n'}
                  enemmän kuin osaat kuvitella. 💕
                </Text>
                <Text style={styles.bdayFrom}>— Jasper</Text>
                <TouchableOpacity
                  style={[lightShadow, styles.bdayBtn]}
                  onPress={dismissBirthday}
                  activeOpacity={0.8}
                >
                  <Text style={styles.bdayBtnText}>Kiitos, Raksu 🥰</Text>
                </TouchableOpacity>
              </BasicView>
            </Animated.View>
          </ImageBackground>
        </Modal>
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
  bdayOverlay: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  bdayCard: {
    alignItems: 'center',
    padding: 36,
    gap: 10,
  },
  bdayCake: { fontSize: 80, marginBottom: 4 },
  bdayTitle: {
    fontSize: 28,
    fontFamily: fontFamily.bold,
    color: '#222',
    textAlign: 'center',
    lineHeight: 36,
  },
  bdayAge: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    color: 'rgba(0,0,0,0.36)',
    marginBottom: 4,
  },
  bdayMsg: {
    fontSize: 16,
    fontFamily: fontFamily.medium,
    color: '#444',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 4,
  },
  bdayFrom: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    color: '#000',
    marginTop: 6,
  },
  bdayBtn: {
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'white',
    paddingHorizontal: 32,
    paddingVertical: 14,
    overflow: 'hidden',
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  bdayBtnText: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: '#222',
  },
});
