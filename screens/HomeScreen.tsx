import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Screen } from '../App';
import { useUser } from '../src/context/UserContext';
import { watchNotifications } from '../src/firebase/db';
import { AppNotification } from '../src/types';

interface Props {
  onNavigate: (screen: Screen) => void;
}

const categories = [
  {
    id: 'treffit',
    label: 'Treffit',
    emoji: '💑',
    color: '#FF6B9D',
    bg: '#FFE4EE',
    description: 'Ideoita yhteiseen aikaan',
  },
  {
    id: 'ruoka',
    label: 'Tehdään Ruokaa',
    emoji: '👨‍🍳',
    color: '#FF8C69',
    bg: '#FFE8D6',
    description: 'Reseptit ja valmistusohjeet',
  },
  {
    id: 'kauppalista',
    label: 'Kauppalista',
    emoji: '🛒',
    color: '#5BB8D4',
    bg: '#D6EFF8',
    description: 'Ostokset helposti listaan',
  },
  {
    id: 'tilaa',
    label: 'Tilaa Ruokaa',
    emoji: '🍜',
    color: '#4BAF9E',
    bg: '#D4F0EA',
    description: 'Löydä paikalliset ravintolat',
  },
];

export default function HomeScreen({ onNavigate }: Props) {
  const { userId, logout } = useUser();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!userId) return;
    return watchNotifications(userId, setNotifications);
  }, [userId]);

  const unreadCount = userId
    ? notifications.filter(n => !n.read?.[userId]).length
    : 0;

  const displayName = userId === 'jasper' ? 'Jasper' : 'Senja';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Hei {displayName}! 💕</Text>
            <Text style={styles.subtitle}>Mitä tehdään tänään?</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => onNavigate('notifications')}
            >
              <Text style={styles.notifIcon}>🔔</Text>
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Vaihda</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.card, { backgroundColor: cat.bg }]}
            onPress={() => onNavigate(cat.id as Screen)}
            activeOpacity={0.82}
          >
            <View style={[styles.iconCircle, { backgroundColor: cat.color }]}>
              <Text style={styles.emoji}>{cat.emoji}</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: cat.color }]}>{cat.label}</Text>
              <Text style={styles.cardDesc}>{cat.description}</Text>
            </View>
            <Text style={[styles.arrow, { color: cat.color }]}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F7' },
  header: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 30, fontWeight: '800', color: '#222', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#999', fontWeight: '500' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  notifBtn: { position: 'relative', padding: 6 },
  notifIcon: { fontSize: 26 },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF6B9D',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  logoutBtn: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logoutText: { color: '#888', fontSize: 13, fontWeight: '600' },
  grid: { paddingHorizontal: 20, paddingBottom: 32, gap: 14 },
  card: {
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emoji: { fontSize: 30 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 19, fontWeight: '700', marginBottom: 3 },
  cardDesc: { fontSize: 13, color: '#888' },
  arrow: { fontSize: 28, fontWeight: '300', marginLeft: 4 },
});
