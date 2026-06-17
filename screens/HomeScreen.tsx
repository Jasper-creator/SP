import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Screen } from '../App';
import { fontFamily } from '../Components/BasicView';
import { useStyles } from '../Components/Styles';
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
    image: require('../Images/Treffi.webp'),
    color: 'rgba(0,0,0,0.36)',
    bg: '#FFE4EE',
    description: 'Suunnittele yhteinen ilta',
  },
  {
    id: 'ruoka',
    label: 'Tehdään Ruokaa',
    image: require('../Images/Kokki.webp'),
    color: '#FF8C69',
    bg: '#FFE8D6',
    description: 'Reseptit ja valmistusohjeet',
  },
  {
    id: 'kauppalista',
    label: 'Kauppalista',
    image: require('../Images/Kauppa.webp'),
    color: '#5BB8D4',
    bg: '#D6EFF8',
    description: 'Ostokset helposti listaan',
  },
  {
    id: 'tilaa',
    label: 'Tilaa Ruokaa',
    image: require('../Images/Tilaus.webp'),
    color: '#4BAF9E',
    bg: '#D4F0EA',
    description: 'Löydä paikalliset ravintolat',
  },
  {
    id: 'leffalista',
    label: 'Leffalista',
    image: require('../Images/Elokuva.webp'),
    color: '#7B61FF',
    bg: '#EDE8FF',
    description: 'Leffavinkit odottamassa',
  },
  {
    id: 'kohdelista',
    label: 'Kohdelista',
    image: require('../Images/Kartta.webp'),
    color: 'rgba(0,0,0,0.36)',
    bg: '#FFF0DE',
    description: 'Paikat joissa halutaan käydä',
  },
];

export default function HomeScreen({ onNavigate }: Props) {
  const { userId, logout } = useUser();
  const styles1 = useStyles();
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
    <View>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ marginTop: 50 }}>
            <Text style={styles.greeting}>Hei {displayName}! 💕</Text>
            <Text style={[styles.subtitle, { color: styles1.Black36.color }]}>
              Mitä tehdään tänään?
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => onNavigate('notifications')}
            >
              <Text style={styles.notifIcon}>🔔</Text>
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Vaihda</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.card, { backgroundColor: cat.bg }]}
            onPress={() => onNavigate(cat.id as Screen)}
            activeOpacity={0.82}
          >
            {/* <View style={[styles.iconCircle, { backgroundColor: cat.color }]}> */}
            <Image
              source={cat.image}
              style={styles.iconCircle}
              resizeMode="contain"
            />
            {/* </View> */}
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{cat.label}</Text>
              <Text style={[styles.cardDesc, { color: styles1.Black36.color }]}>
                {cat.description}
              </Text>
            </View>
            <Text style={[styles.arrow, { color: cat.color }]}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 20 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 30,
    color: 'black',
    marginBottom: 4,
    fontFamily: fontFamily.bold,
  },
  subtitle: { fontSize: 17, fontFamily: fontFamily.semiBold },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 50,
  },
  notifBtn: { position: 'relative', padding: 6 },
  notifIcon: { fontSize: 26 },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundcolor: 'rgba(0,0,0,0.36)',
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
  logoutText: { fontSize: 13, fontFamily: fontFamily.semiBold },
  grid: {
    paddingHorizontal: 20,
    paddingBottom: 102,
    gap: 15,
  },
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
  categoryImage: { width: 36, height: 36 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 19, fontWeight: '700', marginBottom: 3 },
  cardDesc: { fontSize: 13, color: '#888' },
  arrow: { fontSize: 28, fontWeight: '300', marginLeft: 4 },
});
