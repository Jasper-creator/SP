import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../src/context/UserContext';
import {
  watchLeffalista,
  addLeffaItem,
  deleteLeffaItem,
} from '../src/firebase/db';
import { ListItem } from '../src/types';

const EMOJI_OPTIONS = ['🎬', '🎥', '🍿', '🎭', '😂', '❤️', '👻', '🤖', '🌊', '🔥', '😢', '😱'];

interface Props {
  onBack: () => void;
}

export default function LeffalistaScreen({ onBack }: Props) {
  const { userId } = useUser();
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🎬');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return watchLeffalista(data => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const handleAdd = async () => {
    if (!newName.trim() || !userId) return;
    setSaving(true);
    try {
      await addLeffaItem({
        name: newName.trim(),
        emoji: newEmoji,
        addedBy: userId,
        addedAt: Date.now(),
      });
      setNewName('');
      setNewEmoji('🎬');
      setShowAdd(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#7B61FF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Takaisin</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <Text style={styles.title}>🎬 Leffalista</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
            <Text style={styles.addBtnText}>+ Lisää</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>{items.length} leffaa listalla</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🎬</Text>
          <Text style={styles.emptyText}>Lista on tyhjä!</Text>
          <Text style={styles.emptyHint}>Lisää leffoja + Lisää painikkeesta</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {items.map(item => (
            <View key={item.id} style={styles.itemCard}>
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <TouchableOpacity onPress={() => deleteLeffaItem(item.id)} style={styles.removeBtn}>
                <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {showAdd && (
        <Modal animationType="slide" transparent>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <TouchableOpacity
              style={styles.overlay}
              activeOpacity={1}
              onPress={() => setShowAdd(false)}
            >
              <TouchableOpacity activeOpacity={1} style={styles.sheet}>
                <View style={styles.sheetHandle} />
                <Text style={styles.sheetTitle}>Lisää leffa</Text>

                <Text style={styles.fieldLabel}>Leffan nimi *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="esim. Oppenheimer"
                  placeholderTextColor="#CCC"
                  value={newName}
                  onChangeText={setNewName}
                  autoFocus
                />

                <Text style={styles.fieldLabel}>Emoji</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiRow}>
                  {EMOJI_OPTIONS.map(e => (
                    <TouchableOpacity
                      key={e}
                      style={[styles.emojiBtn, newEmoji === e && styles.emojiBtnActive]}
                      onPress={() => setNewEmoji(e)}
                    >
                      <Text style={styles.emojiText}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity style={styles.saveBtn} onPress={handleAdd} disabled={saving}>
                  {saving
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.saveBtnText}>Lisää listaan</Text>
                  }
                </TouchableOpacity>
              </TouchableOpacity>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 },
  backBtn: { marginBottom: 12 },
  backText: { color: '#7B61FF', fontSize: 16, fontWeight: '600' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#222' },
  addBtn: { backgroundColor: '#7B61FF', borderRadius: 14, paddingHorizontal: 18, paddingVertical: 9 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  subtitle: { color: '#AAA', fontSize: 13, marginTop: 4 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyEmoji: { fontSize: 56 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#333' },
  emptyHint: { fontSize: 14, color: '#AAA' },
  list: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, gap: 10 },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  itemEmoji: { fontSize: 30, marginRight: 14 },
  itemName: { flex: 1, fontSize: 16, fontWeight: '600', color: '#222' },
  removeBtn: { padding: 6 },
  removeText: { fontSize: 15, color: '#DDD', fontWeight: '700' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, gap: 6 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0', alignSelf: 'center', marginBottom: 12 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: '#222', marginBottom: 4 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#555', marginTop: 8 },
  input: { backgroundColor: '#F8F8F8', borderRadius: 14, padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#EEE', color: '#222' },
  emojiRow: { gap: 8, alignItems: 'center', paddingVertical: 4 },
  emojiBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' },
  emojiBtnActive: { backgroundColor: '#7B61FF' },
  emojiText: { fontSize: 22 },
  saveBtn: { backgroundColor: '#7B61FF', borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
