import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { UserId } from '../src/types';

interface Props {
  onSelect: (userId: UserId) => void;
}

export default function LoginScreen({ onSelect }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heart}>💕</Text>
        <Text style={styles.title}>Tervetuloa!</Text>
        <Text style={styles.subtitle}>Kuka sinä olet?</Text>

        <TouchableOpacity
          style={[styles.userBtn, styles.jasperBtn]}
          onPress={() => onSelect('jasper')}
          activeOpacity={0.85}
        >
          <Text style={styles.userEmoji}>👦</Text>
          <Text style={styles.userName}>Jasper</Text>
          <Text style={styles.userHint}>Se romanttisempi</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.userBtn, styles.senjaBtn]}
          onPress={() => onSelect('senja')}
          activeOpacity={0.85}
        >
          <Text style={styles.userEmoji}>👧</Text>
          <Text style={styles.userName}>Senja</Text>
          <Text style={styles.userHint}>Jasperille tehty sovellus</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F7' },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  heart: { fontSize: 72, marginBottom: 8 },
  title: { fontSize: 34, fontWeight: '800', color: '#222' },
  subtitle: { fontSize: 18, color: '#AAA', marginBottom: 16 },
  userBtn: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  jasperBtn: { backgroundColor: '#D6EFF8' },
  senjaBtn: { backgroundColor: '#FFE4EE' },
  userEmoji: { fontSize: 52 },
  userName: { fontSize: 26, fontWeight: '800', color: '#222' },
  userHint: { fontSize: 13, color: '#AAA' },
});
