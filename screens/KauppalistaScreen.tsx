import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useUser } from '../src/context/UserContext';
import {
  watchShoppingList,
  addShoppingItem,
  toggleShoppingItem,
  deleteShoppingItem,
  clearDoneItems,
  sendNotification,
} from '../src/firebase/db';
import { getPartnerId } from '../src/firebase/fcm';
import { ShoppingItem } from '../src/types';

const UNITS = ['kpl', 'g', 'kg', 'l', 'dl', 'ml', 'tl', 'rkl', 'pkt', 'pss', 'prk', 'ltk'];
const CATEGORIES = ['Vihannekset', 'Hedelmät', 'Maitotuotteet', 'Liha & Kala', 'Leivonnaiset', 'Juomat', 'Pakasteet', 'Muut'];
const CATEGORY_EMOJIS: Record<string, string> = {
  Vihannekset: '🥦', Hedelmät: '🍎', 'Maitotuotteet': '🥛',
  'Liha & Kala': '🥩', Leivonnaiset: '🍞', Juomat: '🥤',
  Pakasteet: '🧊', Muut: '🛒',
};

interface Props {
  onBack: () => void;
}

export default function KauppalistaScreen({ onBack }: Props) {
  const { userId } = useUser();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('1');
  const [newUnit, setNewUnit] = useState('kpl');
  const [newCategory, setNewCategory] = useState('Muut');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return watchShoppingList(data => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const toggle = (id: string, done: boolean) => toggleShoppingItem(id, !done);
  const remove = (id: string) => deleteShoppingItem(id);

  const handleAdd = async () => {
    if (!newName.trim() || !userId) return;
    setSaving(true);
    try {
      const myName = userId === 'jasper' ? 'Jasper' : 'Senja';
      await addShoppingItem({
        name: newName.trim(),
        amount: newAmount,
        unit: newUnit,
        category: newCategory,
        done: false,
        addedBy: userId,
        addedAt: Date.now(),
      });
      await sendNotification({
        to: getPartnerId(userId),
        message: `${myName} lisäsi kauppalistaan: ${newName.trim()} (${newAmount} ${newUnit})`,
        type: 'kauppalista',
        from: userId,
        createdAt: Date.now(),
        read: {},
      });
      setNewName('');
      setNewAmount('1');
      setNewUnit('kpl');
      setNewCategory('Muut');
      setShowAdd(false);
    } finally {
      setSaving(false);
    }
  };

  const handleClearDone = async () => {
    await clearDoneItems();
  };

  const remaining = items.filter(i => !i.done).length;
  const doneCount = items.filter(i => i.done).length;

  const grouped = CATEGORIES.map(cat => ({
    category: cat,
    items: items.filter(i => i.category === cat),
  })).filter(g => g.items.length > 0);

  const otherItems = items.filter(i => !CATEGORIES.includes(i.category));
  if (otherItems.length > 0) grouped.push({ category: 'Muut', items: otherItems });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#5BB8D4" />
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
          <Text style={styles.title}>🛒 Kauppalista</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
            <Text style={styles.addBtnText}>+ Lisää</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>
            {remaining} ostettavaa{doneCount > 0 ? ` · ${doneCount} ostettu` : ''}
          </Text>
          {doneCount > 0 && (
            <TouchableOpacity onPress={handleClearDone}>
              <Text style={styles.clearText}>Poista ostetut</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyText}>Lista on tyhjä!</Text>
          <Text style={styles.emptyHint}>Lisää tuotteita + Lisää painikkeesta</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {grouped.map(group => (
            <View key={group.category}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupEmoji}>{CATEGORY_EMOJIS[group.category] ?? '🛒'}</Text>
                <Text style={styles.groupLabel}>{group.category}</Text>
              </View>
              {group.items.map(item => (
                <View key={item.id} style={[styles.itemCard, item.done && styles.itemDone]}>
                  <TouchableOpacity onPress={() => toggle(item.id, item.done)} style={styles.checkArea}>
                    <View style={[styles.checkbox, item.done && styles.checkboxDone]}>
                      {item.done && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, item.done && styles.itemNameDone]}>
                      {item.name}
                    </Text>
                    <View style={styles.itemMeta}>
                      <Text style={styles.itemAmount}>{item.amount} {item.unit}</Text>
                      <Text style={styles.itemBy}>
                        {item.addedBy === 'jasper' ? '👦' : '👧'} {item.addedBy === 'jasper' ? 'Jasper' : 'Senja'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => remove(item.id)} style={styles.removeBtn}>
                    <Text style={styles.removeText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
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
                <Text style={styles.sheetTitle}>Lisää tuote</Text>

                <Text style={styles.fieldLabel}>Tuotteen nimi *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="esim. Maito"
                  placeholderTextColor="#CCC"
                  value={newName}
                  onChangeText={setNewName}
                  autoFocus
                />

                <Text style={styles.fieldLabel}>Määrä</Text>
                <View style={styles.amountRow}>
                  <TextInput
                    style={[styles.input, styles.amountInput]}
                    value={newAmount}
                    onChangeText={setNewAmount}
                    keyboardType="decimal-pad"
                  />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chipRow}
                  >
                    {UNITS.map(u => (
                      <TouchableOpacity
                        key={u}
                        style={[styles.unitChip, newUnit === u && styles.chipActive]}
                        onPress={() => setNewUnit(u)}
                      >
                        <Text style={[styles.unitText, newUnit === u && styles.chipTextActive]}>{u}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <Text style={styles.fieldLabel}>Kategoria</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                  {CATEGORIES.map(c => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.unitChip, newCategory === c && styles.chipActive]}
                      onPress={() => setNewCategory(c)}
                    >
                      <Text style={[styles.unitText, newCategory === c && styles.chipTextActive]}>
                        {CATEGORY_EMOJIS[c]} {c}
                      </Text>
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
  container: { flex: 1, backgroundColor: '#FFF5F7' },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 },
  backBtn: { marginBottom: 12 },
  backText: { color: '#FF6B9D', fontSize: 16, fontWeight: '600' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#222' },
  addBtn: { backgroundColor: '#5BB8D4', borderRadius: 14, paddingHorizontal: 18, paddingVertical: 9 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  statsText: { color: '#AAA', fontSize: 13 },
  clearText: { color: '#FF6B9D', fontSize: 13, fontWeight: '600' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyEmoji: { fontSize: 56 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#333' },
  emptyHint: { fontSize: 14, color: '#AAA' },
  list: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 32 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20, marginBottom: 8 },
  groupEmoji: { fontSize: 14 },
  groupLabel: { fontSize: 12, fontWeight: '700', color: '#AAA', textTransform: 'uppercase', letterSpacing: 0.8 },
  itemCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center', marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 1,
  },
  itemDone: { opacity: 0.45 },
  checkArea: { padding: 4, marginRight: 12 },
  checkbox: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: '#DDD', justifyContent: 'center', alignItems: 'center' },
  checkboxDone: { backgroundColor: '#5BB8D4', borderColor: '#5BB8D4' },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '800' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#222' },
  itemNameDone: { textDecorationLine: 'line-through', color: '#AAA' },
  itemMeta: { flexDirection: 'row', gap: 10, marginTop: 2 },
  itemAmount: { fontSize: 13, color: '#5BB8D4', fontWeight: '700' },
  itemBy: { fontSize: 12, color: '#CCC' },
  removeBtn: { padding: 6 },
  removeText: { fontSize: 15, color: '#DDD', fontWeight: '700' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40, gap: 6 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0', alignSelf: 'center', marginBottom: 12 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: '#222', marginBottom: 4 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#555', marginTop: 8 },
  input: { backgroundColor: '#F8F8F8', borderRadius: 14, padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#EEE', color: '#222' },
  amountRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  amountInput: { width: 80 },
  chipRow: { gap: 6, alignItems: 'center' },
  unitChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#F0F0F0' },
  chipActive: { backgroundColor: '#5BB8D4' },
  unitText: { color: '#666', fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: '#fff' },
  saveBtn: { backgroundColor: '#5BB8D4', borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
