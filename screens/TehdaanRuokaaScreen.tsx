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
  watchRecipes,
  addRecipe,
  deleteRecipe,
  seedDefaultRecipes,
  sendNotification,
} from '../src/firebase/db';
import { getPartnerId } from '../src/firebase/fcm';
import { Recipe } from '../src/types';

interface Props {
  onBack: () => void;
}

export default function TehdaanRuokaaScreen({ onBack }: Props) {
  const { userId } = useUser();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🍽');
  const [newCategory, setNewCategory] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newIngredients, setNewIngredients] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    seedDefaultRecipes().catch(() => {});
    return watchRecipes(data => {
      setRecipes(data);
      setLoading(false);
    });
  }, []);

  const handleAdd = async () => {
    if (!newName.trim() || !userId) return;
    setSaving(true);
    try {
      const myName = userId === 'jasper' ? 'Jasper' : 'Senja';
      await addRecipe({
        name: newName.trim(),
        emoji: newEmoji || '🍽',
        category: newCategory.trim() || 'Oma resepti',
        time: newTime.trim() || '?',
        ingredients: newIngredients.split('\n').map(s => s.trim()).filter(Boolean),
        instructions: newInstructions.trim(),
        addedBy: userId,
        addedAt: Date.now(),
      });
      await sendNotification({
        to: getPartnerId(userId),
        message: `${myName} lisäsi uuden reseptin: ${newEmoji || '🍽'} ${newName.trim()}`,
        type: 'ruoka',
        from: userId,
        createdAt: Date.now(),
        read: {},
      });
      setNewName(''); setNewEmoji('🍽'); setNewCategory('');
      setNewTime(''); setNewIngredients(''); setNewInstructions('');
      setShowAdd(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteRecipe(id);
    setSelectedRecipe(null);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#FF8C69" />
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
          <Text style={styles.title}>👨‍🍳 Reseptit</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
            <Text style={styles.addBtnText}>+ Lisää</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>{recipes.length} reseptiä</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {recipes.map(r => (
          <TouchableOpacity
            key={r.id}
            style={styles.recipeCard}
            onPress={() => setSelectedRecipe(r)}
            activeOpacity={0.8}
          >
            <Text style={styles.recipeEmoji}>{r.emoji}</Text>
            <View style={styles.recipeInfo}>
              <Text style={styles.recipeName}>{r.name}</Text>
              <View style={styles.recipeMeta}>
                <Text style={styles.recipeTag}>{r.category}</Text>
                <Text style={styles.recipeTime}>⏱ {r.time}</Text>
                <Text style={styles.recipeBy}>
                  {r.addedBy === 'jasper' ? '👦' : '👧'}
                </Text>
              </View>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Recipe Detail */}
      {selectedRecipe && (
        <Modal animationType="slide">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedRecipe(null)}>
                <Text style={styles.backText}>← Takaisin</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(selectedRecipe.id)}>
                <Text style={styles.deleteText}>🗑 Poista</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.detailContent}>
              <Text style={styles.detailEmoji}>{selectedRecipe.emoji}</Text>
              <Text style={styles.detailName}>{selectedRecipe.name}</Text>
              <View style={styles.detailMetaRow}>
                <View style={styles.metaTag}><Text style={styles.metaTagText}>📂 {selectedRecipe.category}</Text></View>
                <View style={styles.metaTag}><Text style={styles.metaTagText}>⏱ {selectedRecipe.time}</Text></View>
                <View style={styles.metaTag}>
                  <Text style={styles.metaTagText}>
                    {selectedRecipe.addedBy === 'jasper' ? '👦 Jasper' : '👧 Senja'}
                  </Text>
                </View>
              </View>
              <Text style={styles.sectionTitle}>Ainekset</Text>
              {selectedRecipe.ingredients.map((ing, i) => (
                <View key={i} style={styles.ingredientRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.ingredientText}>{ing}</Text>
                </View>
              ))}
              <Text style={styles.sectionTitle}>Ohje</Text>
              <Text style={styles.instructions}>{selectedRecipe.instructions}</Text>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}

      {/* Add Recipe */}
      {showAdd && (
        <Modal animationType="slide">
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <SafeAreaView style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowAdd(false)}>
                  <Text style={styles.backText}>✕ Sulje</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Uusi resepti</Text>
                <TouchableOpacity onPress={handleAdd} disabled={saving}>
                  {saving
                    ? <ActivityIndicator color="#FF8C69" />
                    : <Text style={styles.saveText}>Tallenna</Text>
                  }
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
                <View style={styles.emojiRow}>
                  <View style={styles.emojiField}>
                    <Text style={styles.fieldLabel}>Emoji</Text>
                    <TextInput style={[styles.input, styles.emojiInput]} value={newEmoji} onChangeText={setNewEmoji} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Kategoria</Text>
                    <TextInput style={styles.input} value={newCategory} onChangeText={setNewCategory} placeholder="esim. Pasta, Keitto..." placeholderTextColor="#CCC" />
                  </View>
                </View>
                <Text style={styles.fieldLabel}>Nimi *</Text>
                <TextInput style={styles.input} value={newName} onChangeText={setNewName} placeholder="Reseptin nimi" placeholderTextColor="#CCC" />
                <Text style={styles.fieldLabel}>Valmistusaika</Text>
                <TextInput style={styles.input} value={newTime} onChangeText={setNewTime} placeholder="esim. 30 min" placeholderTextColor="#CCC" />
                <Text style={styles.fieldLabel}>Ainekset (yksi per rivi)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newIngredients}
                  onChangeText={setNewIngredients}
                  placeholder={'200 g jauhelihaa\n1 sipuli\n...'}
                  placeholderTextColor="#CCC"
                  multiline
                  textAlignVertical="top"
                />
                <Text style={styles.fieldLabel}>Valmistusohje</Text>
                <TextInput
                  style={[styles.input, styles.textAreaLarge]}
                  value={newInstructions}
                  onChangeText={setNewInstructions}
                  placeholder="Kirjoita ohjeet tähän..."
                  placeholderTextColor="#CCC"
                  multiline
                  textAlignVertical="top"
                />
              </ScrollView>
            </SafeAreaView>
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
  subtitle: { fontSize: 13, color: '#AAA', marginTop: 4 },
  addBtn: { backgroundColor: '#FF8C69', borderRadius: 14, paddingHorizontal: 18, paddingVertical: 9 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  list: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, gap: 12 },
  recipeCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 5, elevation: 2,
  },
  recipeEmoji: { fontSize: 42, marginRight: 14 },
  recipeInfo: { flex: 1 },
  recipeName: { fontSize: 17, fontWeight: '700', color: '#222' },
  recipeMeta: { flexDirection: 'row', gap: 10, marginTop: 5, alignItems: 'center' },
  recipeTag: { fontSize: 12, color: '#FF8C69', fontWeight: '600' },
  recipeTime: { fontSize: 12, color: '#AAA' },
  recipeBy: { fontSize: 14 },
  arrow: { fontSize: 24, color: '#DDD' },
  modalContainer: { flex: 1, backgroundColor: '#FFF5F7' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  deleteText: { color: '#FF6B6B', fontSize: 14, fontWeight: '600' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#222' },
  saveText: { color: '#FF8C69', fontSize: 16, fontWeight: '700' },
  detailContent: { padding: 24 },
  detailEmoji: { fontSize: 80, textAlign: 'center', marginBottom: 12 },
  detailName: { fontSize: 28, fontWeight: '800', color: '#222', textAlign: 'center', marginBottom: 14 },
  detailMetaRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 28, flexWrap: 'wrap' },
  metaTag: { backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  metaTagText: { fontSize: 13, color: '#666', fontWeight: '600' },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#222', marginBottom: 12, marginTop: 8 },
  ingredientRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  bullet: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#FF8C69', marginTop: 7, marginRight: 10 },
  ingredientText: { fontSize: 15, color: '#444', flex: 1, lineHeight: 22 },
  instructions: { fontSize: 15, color: '#444', lineHeight: 26, marginBottom: 32 },
  formContent: { padding: 20, gap: 6 },
  emojiRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  emojiField: { width: 80 },
  emojiInput: { textAlign: 'center', fontSize: 28 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 4, marginTop: 10 },
  input: { backgroundColor: '#fff', borderRadius: 14, padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#EEE', color: '#222' },
  textArea: { height: 110, textAlignVertical: 'top' },
  textAreaLarge: { height: 150, textAlignVertical: 'top' },
});
