import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useUser } from '../src/context/UserContext';
import {
  watchNotifications,
  markNotificationRead,
} from '../src/firebase/db';
import { AppNotification } from '../src/types';

const TYPE_ICONS: Record<string, string> = {
  treffit: '💑',
  kauppalista: '🛒',
  ruoka: '👨‍🍳',
  general: '💬',
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'juuri nyt';
  if (mins < 60) return `${mins} min sitten`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} t sitten`;
  const days = Math.floor(hours / 24);
  return `${days} pv sitten`;
}

interface Props {
  onBack: () => void;
}

export default function NotificationsScreen({ onBack }: Props) {
  const { userId } = useUser();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!userId) return;
    return watchNotifications(userId, setNotifications);
  }, [userId]);

  const handleOpen = async (n: AppNotification) => {
    if (!userId || n.read?.[userId]) return;
    await markNotificationRead(n.id, userId);
  };

  const unreadCount = userId
    ? notifications.filter(n => !n.read?.[userId]).length
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Takaisin</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔔 Ilmoitukset</Text>
        {unreadCount > 0 && (
          <Text style={styles.subtitle}>{unreadCount} uutta</Text>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🔕</Text>
          <Text style={styles.emptyText}>Ei ilmoituksia</Text>
          <Text style={styles.emptyHint}>Ilmoitukset ilmestyvät tänne</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {notifications.map(n => {
            const isUnread = userId ? !n.read?.[userId] : false;
            return (
              <TouchableOpacity
                key={n.id}
                style={[styles.card, isUnread && styles.cardUnread]}
                onPress={() => handleOpen(n)}
                activeOpacity={0.8}
              >
                <View style={styles.iconCircle}>
                  <Text style={styles.icon}>{TYPE_ICONS[n.type] ?? '💬'}</Text>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardMessage}>{n.message}</Text>
                  <Text style={styles.cardMeta}>
                    {n.from === 'jasper' ? 'Jasper' : 'Senja'} · {timeAgo(n.createdAt)}
                  </Text>
                </View>
                {isUnread && <View style={styles.dot} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F7' },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 },
  backBtn: { marginBottom: 12 },
  backText: { color: '#FF6B9D', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', color: '#222' },
  subtitle: { fontSize: 13, color: '#FF6B9D', marginTop: 4 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyEmoji: { fontSize: 56 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#333' },
  emptyHint: { fontSize: 13, color: '#AAA' },
  list: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, gap: 10 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardUnread: { backgroundColor: '#FFF0F5' },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFF5F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: { fontSize: 24 },
  cardContent: { flex: 1 },
  cardMessage: { fontSize: 15, fontWeight: '600', color: '#222', marginBottom: 3 },
  cardMeta: { fontSize: 12, color: '#AAA' },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B9D',
  },
});
