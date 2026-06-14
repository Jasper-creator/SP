import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,

  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FoodType {
  id: string;
  emoji: string;
  label: string;
  color: string;
  bg: string;
}

const foodTypes: FoodType[] = [
  { id: 'pizza', emoji: '🍕', label: 'Pizza', color: '#E8612C', bg: '#FDEEE7' },
  { id: 'sushi', emoji: '🍣', label: 'Sushi', color: '#C0392B', bg: '#FAE5E3' },
  { id: 'kiinalainen', emoji: '🥡', label: 'Kiinalainen', color: '#D4821A', bg: '#FDF0DC' },
  { id: 'burgeri', emoji: '🍔', label: 'Burgeri', color: '#B7690A', bg: '#FDF1D9' },
  { id: 'kebab', emoji: '🥙', label: 'Kebab', color: '#3D9970', bg: '#DDEEE7' },
  { id: 'thaimaalainen', emoji: '🍜', label: 'Thaimaalainen', color: '#1A8C8C', bg: '#D5EEEE' },
  { id: 'intialainen', emoji: '🫕', label: 'Intialainen', color: '#8A3DC8', bg: '#EFE0F8' },
  { id: 'meksiko', emoji: '🌮', label: 'Meksiko', color: '#27AE60', bg: '#D6F0E2' },
  { id: 'salaatti', emoji: '🥗', label: 'Salaatti', color: '#2ECC71', bg: '#D9F7E8' },
  { id: 'kana', emoji: '🍗', label: 'Kanaruoka', color: '#E67E22', bg: '#FCE8D2' },
];

interface Dish {
  name: string;
  price: string;
  description: string;
}

interface Restaurant {
  name: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: string;
  minOrder: string;
  dishes: Dish[];
}

const restaurants: Record<string, Restaurant[]> = {
  pizza: [
    {
      name: 'Pizza Roma',
      rating: 4.7,
      deliveryTime: '25–35 min',
      deliveryFee: '2.90 €',
      minOrder: '15 €',
      dishes: [
        { name: 'Margherita', price: '12.90 €', description: 'Tomaatti, mozzarella, basilika' },
        { name: 'Pepperoni', price: '14.90 €', description: 'Tomaatti, mozzarella, pepperoni' },
        { name: 'Quattro Formaggi', price: '15.90 €', description: 'Neljä juustoa, tomaatti' },
        { name: 'Prosciutto & Funghi', price: '16.90 €', description: 'Kinkku, sieni, paprika' },
        { name: 'Diavola', price: '15.90 €', description: 'Salami, chili, tomaatti' },
      ],
    },
    {
      name: 'Pizzeria Napoli',
      rating: 4.5,
      deliveryTime: '30–40 min',
      deliveryFee: '1.90 €',
      minOrder: '12 €',
      dishes: [
        { name: 'Marinara', price: '11.90 €', description: 'Tomaatti, valkosipuli, oregano' },
        { name: 'Calzone', price: '13.90 €', description: 'Täytetty pizza, kinkku, juusto' },
        { name: 'Capricciosa', price: '14.90 €', description: 'Kinkku, sieni, artisokka, oliivi' },
      ],
    },
  ],
  sushi: [
    {
      name: 'Sushi House',
      rating: 4.8,
      deliveryTime: '30–45 min',
      deliveryFee: '3.90 €',
      minOrder: '20 €',
      dishes: [
        { name: 'California Roll (8 kpl)', price: '12.90 €', description: 'Rapu, avokado, kurkku' },
        { name: 'Salmon Nigiri (6 kpl)', price: '14.90 €', description: 'Tuore lohi, sushi-riisi' },
        { name: 'Rainbow Roll (8 kpl)', price: '17.90 €', description: 'Sekoitettu sashimi päällä' },
        { name: 'Dragon Roll (8 kpl)', price: '18.90 €', description: 'Rapukakku, avokado' },
        { name: 'Miso-keitto', price: '4.50 €', description: 'Perinteinen japanilainen keitto' },
      ],
    },
    {
      name: 'Tokyo Express',
      rating: 4.6,
      deliveryTime: '25–35 min',
      deliveryFee: '2.90 €',
      minOrder: '18 €',
      dishes: [
        { name: 'Salmon Roll (8 kpl)', price: '11.90 €', description: 'Tuore lohi, riisi, nori' },
        { name: 'Spicy Tuna (8 kpl)', price: '13.90 €', description: 'Tonnikala, sriracha, kurkku' },
        { name: 'Edamame', price: '5.90 €', description: 'Höyrytetty soijapapu, merisuola' },
        { name: 'Gyoza (6 kpl)', price: '8.90 €', description: 'Paistettu dumpling, kastike' },
      ],
    },
  ],
  kiinalainen: [
    {
      name: 'China Garden',
      rating: 4.4,
      deliveryTime: '35–45 min',
      deliveryFee: '2.50 €',
      minOrder: '15 €',
      dishes: [
        { name: 'Kung Pao Kana', price: '13.90 €', description: 'Kana, cashew-pähkinä, chili, paprika' },
        { name: 'Kevätrullat (4 kpl)', price: '8.90 €', description: 'Vihanneksia ja lihaa, hapankastike' },
        { name: 'Wonton-keitto', price: '9.90 €', description: 'Perinteinen kiinalainen keitto' },
        { name: 'Peking-ankka', price: '24.90 €', description: 'Klassinen pekingankka, pannukakku' },
        { name: 'Sweet & Sour Pork', price: '13.90 €', description: 'Hapanimeläkastike, paprika, ananas' },
      ],
    },
  ],
  kebab: [
    {
      name: 'Istanbul Grill',
      rating: 4.3,
      deliveryTime: '20–30 min',
      deliveryFee: '1.90 €',
      minOrder: '12 €',
      dishes: [
        { name: 'Kebab-lautanen', price: '13.90 €', description: 'Kebabliha, ranskikset, salaatti, kastike' },
        { name: 'Döner-pitaleipä', price: '11.90 €', description: 'Pitaleipä, liha, salaatti, joghurt' },
        { name: 'Adana Kebab', price: '15.90 €', description: 'Mausteinen jauhelihakebab, riisi' },
        { name: 'Falafel Wrap', price: '10.90 €', description: 'Kasvis, tahini, vihannekset' },
        { name: 'Lahmacun (2 kpl)', price: '12.90 €', description: 'Ohut liha-pizza' },
      ],
    },
  ],
  burgeri: [
    {
      name: 'Burger Brothers',
      rating: 4.6,
      deliveryTime: '20–30 min',
      deliveryFee: '2.90 €',
      minOrder: '14 €',
      dishes: [
        { name: 'Classic Burger', price: '13.90 €', description: 'Nauta, salaatti, tomaatti, cheddar, kastike' },
        { name: 'BBQ Bacon Burger', price: '16.90 €', description: 'Pekoni, BBQ-soossi, sipulirenkaat' },
        { name: 'Spicy Chicken', price: '13.90 €', description: 'Mausteinen kanaleike, jalapeño, mayo' },
        { name: 'Veggie Burger', price: '12.90 €', description: 'Kasvispatty, avokado, sinappi' },
        { name: 'Ranskalaiset + kastike', price: '5.90 €', description: 'Crispy fries, valitse kastike' },
      ],
    },
  ],
  thaimaalainen: [
    {
      name: 'Thai Palace',
      rating: 4.7,
      deliveryTime: '35–50 min',
      deliveryFee: '3.50 €',
      minOrder: '18 €',
      dishes: [
        { name: 'Pad Thai', price: '14.90 €', description: 'Nuudeli, katkarapu tai kana, maapähkinä' },
        { name: 'Green Curry', price: '15.90 €', description: 'Kana, kookoskerma, basilika, lime' },
        { name: 'Tom Yum -keitto', price: '12.90 €', description: 'Hapan-mausteinen keitto, sienet' },
        { name: 'Pad See Ew', price: '14.90 €', description: 'Leveä nuudeli, parsa, kananmuna' },
        { name: 'Mango Sticky Rice', price: '7.90 €', description: 'Perinteinen jälkiruoka' },
      ],
    },
  ],
  intialainen: [
    {
      name: 'Spice of India',
      rating: 4.5,
      deliveryTime: '35–50 min',
      deliveryFee: '3.90 €',
      minOrder: '18 €',
      dishes: [
        { name: 'Butter Chicken', price: '15.90 €', description: 'Kermainen tomaatti-kanacurry' },
        { name: 'Palak Paneer', price: '14.90 €', description: 'Pinaatti-juustocurry (vegaani)' },
        { name: 'Lamb Rogan Josh', price: '17.90 €', description: 'Kashmirilainen karitsa-curry' },
        { name: 'Garlic Naan (2 kpl)', price: '5.90 €', description: 'Valkosipulinaan uunista' },
        { name: 'Basmati Biryani', price: '16.90 €', description: 'Mausteinen riisipata, raita' },
      ],
    },
  ],
  meksiko: [
    {
      name: 'Cancun Kitchen',
      rating: 4.4,
      deliveryTime: '25–35 min',
      deliveryFee: '2.90 €',
      minOrder: '15 €',
      dishes: [
        { name: 'Carne Asada Burrito', price: '13.90 €', description: 'Naudanliha, riisi, guacamole, salsa' },
        { name: 'Tacos (3 kpl)', price: '14.90 €', description: 'Pehmeä taco, valitse täyte' },
        { name: 'Quesadilla', price: '11.90 €', description: 'Tortilla, cheddar, kana, smetana' },
        { name: 'Loaded Nachos', price: '9.90 €', description: 'Nachos, salsa, guacamole, smetana' },
        { name: 'Churros', price: '6.90 €', description: 'Suklaakastikkeella' },
      ],
    },
  ],
  salaatti: [
    {
      name: 'Fresh & Green',
      rating: 4.6,
      deliveryTime: '15–25 min',
      deliveryFee: '2.50 €',
      minOrder: '12 €',
      dishes: [
        { name: 'Caesar-salaatti', price: '12.90 €', description: 'Kana, parmesan, krutonki, Caesar-kastike' },
        { name: 'Greek Salaatti', price: '11.90 €', description: 'Feta, oliivi, tomaatti, kurkku, oregano' },
        { name: 'Quinoa Power Bowl', price: '13.90 €', description: 'Quinoa, avokado, kirsikkatomaatti, hummus' },
        { name: 'Wraps (2 kpl)', price: '12.90 €', description: 'Tortilla, tunatat tai kana, salaatti' },
        { name: 'Marjasmoothie', price: '6.90 €', description: 'Tuoreet marjat, banaani, kauramaito' },
      ],
    },
  ],
  kana: [
    {
      name: 'Chicken King',
      rating: 4.5,
      deliveryTime: '20–30 min',
      deliveryFee: '2.90 €',
      minOrder: '14 €',
      dishes: [
        { name: 'Fried Chicken (4 kpl)', price: '13.90 €', description: 'Rapea paistettua kanaa, dippi' },
        { name: 'Chicken & Waffles', price: '15.90 €', description: 'Amerikkalainen klassikko, vaahteraSiruppi' },
        { name: 'Nashville Hot Chicken', price: '14.90 €', description: 'Tulinen kana, pickles, brioche' },
        { name: 'Popcorn Chicken', price: '9.90 €', description: 'Pienet pala, chipotle-dippi' },
        { name: 'Coleslaw', price: '4.90 €', description: 'Kermainen kaaliSalaatti' },
      ],
    },
  ],
};

interface Props {
  onBack: () => void;
}

export default function TilaaRuokaaScreen({ onBack }: Props) {
  const [selectedType, setSelectedType] = useState<FoodType | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const availableRestaurants = selectedType ? restaurants[selectedType.id] ?? [] : [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={selectedType ? () => setSelectedType(null) : onBack}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>← Takaisin</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🍜 Tilaa Ruokaa</Text>
        <Text style={styles.subtitle}>
          {selectedType
            ? `${selectedType.emoji} ${selectedType.label} – valitse ravintola`
            : 'Minkälaista ruokaa haluaisit?'}
        </Text>
      </View>

      {!selectedType ? (
        <ScrollView contentContainerStyle={styles.typeGrid} showsVerticalScrollIndicator={false}>
          {foodTypes.map(ft => (
            <TouchableOpacity
              key={ft.id}
              style={[styles.typeCard, { backgroundColor: ft.bg }]}
              onPress={() => setSelectedType(ft)}
              activeOpacity={0.8}
            >
              <Text style={styles.typeEmoji}>{ft.emoji}</Text>
              <Text style={[styles.typeLabel, { color: ft.color }]}>{ft.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.restaurantList} showsVerticalScrollIndicator={false}>
          {availableRestaurants.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>😕</Text>
              <Text style={styles.emptyText}>Ei ravintoloita alueellasi</Text>
              <Text style={styles.emptyHint}>Kokeile toista ruokatyyppiä</Text>
            </View>
          ) : (
            availableRestaurants.map((r, i) => (
              <TouchableOpacity
                key={i}
                style={styles.restaurantCard}
                onPress={() => setSelectedRestaurant(r)}
                activeOpacity={0.82}
              >
                <View style={styles.restaurantTop}>
                  <Text style={styles.restaurantName}>{r.name}</Text>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>⭐ {r.rating}</Text>
                  </View>
                </View>
                <View style={styles.restaurantMeta}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaEmoji}>🕐</Text>
                    <Text style={styles.metaText}>{r.deliveryTime}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaEmoji}>🛵</Text>
                    <Text style={styles.metaText}>{r.deliveryFee}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaEmoji}>🛒</Text>
                    <Text style={styles.metaText}>Min. {r.minOrder}</Text>
                  </View>
                </View>
                <Text style={styles.menuPreview}>
                  {r.dishes
                    .slice(0, 3)
                    .map(d => d.name)
                    .join(' · ')}
                  {r.dishes.length > 3 ? '...' : ''}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {selectedRestaurant && (
        <Modal animationType="slide">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedRestaurant(null)}>
                <Text style={styles.backText}>← Takaisin</Text>
              </TouchableOpacity>
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>⭐ {selectedRestaurant.rating}</Text>
              </View>
            </View>

            <ScrollView contentContainerStyle={styles.menuContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.restaurantTitle}>{selectedRestaurant.name}</Text>
              <View style={styles.restaurantMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaEmoji}>🕐</Text>
                  <Text style={styles.metaText}>{selectedRestaurant.deliveryTime}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaEmoji}>🛵</Text>
                  <Text style={styles.metaText}>{selectedRestaurant.deliveryFee}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaEmoji}>🛒</Text>
                  <Text style={styles.metaText}>Min. {selectedRestaurant.minOrder}</Text>
                </View>
              </View>

              <Text style={styles.menuTitle}>Menu</Text>
              {selectedRestaurant.dishes.map((dish, i) => (
                <View key={i} style={styles.dishCard}>
                  <View style={styles.dishLeft}>
                    <Text style={styles.dishName}>{dish.name}</Text>
                    <Text style={styles.dishDesc}>{dish.description}</Text>
                  </View>
                  <Text style={styles.dishPrice}>{dish.price}</Text>
                </View>
              ))}

              <View style={styles.orderNote}>
                <Text style={styles.orderNoteIcon}>📱</Text>
                <Text style={styles.orderNoteText}>
                  Tilaus tehdään ravintolan omasta sovelluksesta tai verkkosivulta. Nauti ateriastasi!
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  backBtn: { marginBottom: 12 },
  backText: { color: '#FF6B9D', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', color: '#222', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#999' },
  typeGrid: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  typeCard: {
    width: '47%',
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  typeEmoji: { fontSize: 48, marginBottom: 10 },
  typeLabel: { fontSize: 16, fontWeight: '700' },
  restaurantList: { paddingHorizontal: 20, paddingBottom: 32, gap: 16 },
  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  restaurantTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  restaurantName: { fontSize: 18, fontWeight: '800', color: '#222' },
  ratingBadge: {
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  ratingText: { fontSize: 13, fontWeight: '700', color: '#E6A817' },
  restaurantMeta: { flexDirection: 'row', gap: 14, marginBottom: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaEmoji: { fontSize: 13 },
  metaText: { fontSize: 12, color: '#777' },
  menuPreview: { fontSize: 13, color: '#BBB', fontStyle: 'italic' },
  empty: { flex: 1, alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyEmoji: { fontSize: 52 },
  emptyText: { fontSize: 17, fontWeight: '700', color: '#444' },
  emptyHint: { fontSize: 13, color: '#AAA' },
  modalContainer: { flex: 1, backgroundColor: '#FFF5F7' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuContent: { padding: 24, paddingBottom: 48 },
  restaurantTitle: { fontSize: 26, fontWeight: '800', color: '#222', marginBottom: 12 },
  menuTitle: { fontSize: 22, fontWeight: '800', color: '#222', marginTop: 24, marginBottom: 14 },
  dishCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  dishLeft: { flex: 1, marginRight: 12 },
  dishName: { fontSize: 15, fontWeight: '700', color: '#222', marginBottom: 4 },
  dishDesc: { fontSize: 12, color: '#AAA', lineHeight: 18 },
  dishPrice: { fontSize: 16, fontWeight: '800', color: '#4BAF9E' },
  orderNote: {
    flexDirection: 'row',
    backgroundColor: '#F0FAF8',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    gap: 10,
    alignItems: 'flex-start',
  },
  orderNoteIcon: { fontSize: 20 },
  orderNoteText: { flex: 1, fontSize: 13, color: '#666', lineHeight: 20 },
});
