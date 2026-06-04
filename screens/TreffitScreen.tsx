import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useUser } from '../src/context/UserContext';
import {
  watchTreffitProposals,
  proposeTreffit,
  updateTreffitStatus,
  sendNotification,
} from '../src/firebase/db';
import { getPartnerId, getPartnerName } from '../src/firebase/fcm';
import { TreffitProposal } from '../src/types';

interface Activity {
  emoji: string;
  label: string;
  description: string;
  category: string;
}

const activities: Activity[] = [
  { emoji: '🎬', label: 'Elokuva-ilta', description: 'Laitetaan pop-cornia ja valitaan lempielo yhdessä!', category: 'Kotona' },
  { emoji: '🧁', label: 'Leivotaan yhdessä', description: 'Tehdään jotain herkullista – keksit, kakku tai pulla!', category: 'Kotona' },
  { emoji: '🎮', label: 'Pelataan', description: 'Hauska pelihetki – co-op tai kilpasettuna!', category: 'Kotona' },
  { emoji: '🎨', label: 'Taiteen tekeminen', description: 'Luovaa yhdessäoloa – vesivärit tai askartelu.', category: 'Kotona' },
  { emoji: '🎲', label: 'Lautapelit', description: 'Strategiaa ja naurua lautapelien äärellä.', category: 'Kotona' },
  { emoji: '🧘', label: 'Jooga yhdessä', description: 'Rentoutumista ja venyttelyä yhteiseen tahtiin.', category: 'Kotona' },
  { emoji: '📺', label: 'Binge-watch sarja', description: 'Valitaan yksi uusi sarja ja katsotaan yöhön!', category: 'Kotona' },
  { emoji: '🌙', label: 'Tähtiä katsomaan', description: 'Makuupussit mukaan ja tähtitaivas kattona.', category: 'Ulkona' },
  { emoji: '🚶', label: 'Kävelylenkki', description: 'Rauhallinen kävelylenkki luonnossa tai kaupungilla.', category: 'Ulkona' },
  { emoji: '🌅', label: 'Auringonlasku', description: 'Etsitään kaunis paikka ja katsotaan auringonlasku.', category: 'Ulkona' },
  { emoji: '🌳', label: 'Piknikkipäivä', description: 'Pakataan eväät ja mennään puistoon tai luontoon!', category: 'Ulkona' },
  { emoji: '📸', label: 'Valokuvausretki', description: 'Otetaan kauniita kuvia kaupungilla tai luonnossa.', category: 'Ulkona' },
  { emoji: '🚴', label: 'Pyöräretki', description: 'Pyörillä uusia maisemia ja reittejä löytämään.', category: 'Ulkona' },
  { emoji: '🌊', label: 'Rantapäivä', description: 'Aurinko, hiekka ja vesi – täydellinen yhdistelmä!', category: 'Ulkona' },
  { emoji: '🎳', label: 'Keilaamaan', description: 'Hauska kilpailu – häviäjä maksaa jäätelön!', category: 'Aktiviteetti' },
  { emoji: '🏊', label: 'Uimaan', description: 'Uimahallille tai järvelle – kumpikin käy!', category: 'Aktiviteetti' },
  { emoji: '🎡', label: 'Huvipuistoon', description: 'Seikkailua, laitteita ja hauskuutta huvipuistossa.', category: 'Aktiviteetti' },
  { emoji: '🏋️', label: 'Salille yhdessä', description: 'Treenataan samaan tahtiin ja motivoidaan toisiaan.', category: 'Aktiviteetti' },
  { emoji: '🧗', label: 'Kiipeilyhalliin', description: 'Sisäkiipeily on hauskaa ja jännittävää yhdessä!', category: 'Aktiviteetti' },
  { emoji: '🎭', label: 'Teatteriin', description: 'Kulttuuria ja elämyksiä!', category: 'Kulttuuri' },
  { emoji: '🖼', label: 'Museoon / Näyttelyyn', description: 'Taidenäyttely tai mielenkiintoinen museo yhdessä.', category: 'Kulttuuri' },
  { emoji: '🎸', label: 'Konserttiin', description: 'Livemusiikin tunnelmaa – löydetään sopiva keikka!', category: 'Kulttuuri' },
  { emoji: '📚', label: 'Kirjakauppaan', description: 'Etsitään kumpikin uusi kirja ja juodaan kahvi.', category: 'Kulttuuri' },
  { emoji: '🛍', label: 'Shoppailu', description: 'Kauppareissu ja pysähdys suosikkikahvilaan.', category: 'Kaupungilla' },
  { emoji: '☕', label: 'Kahvilassa', description: 'Herkullinen kahvi, leivos ja hyvä juttu.', category: 'Kaupungilla' },
  { emoji: '🍦', label: 'Jäätelölle', description: 'Herkutellaan parhaalla jäätelöllä!', category: 'Kaupungilla' },
  { emoji: '🍕', label: 'Pizzaravintolaan', description: 'Mennään yhdessä parhaaseen paikalliseen pizzeriaan!', category: 'Kaupungilla' },
];

const filterCategories = ['Kaikki', 'Kotona', 'Ulkona', 'Aktiviteetti', 'Kulttuuri', 'Kaupungilla'];

interface Props {
  onBack: () => void;
}

export default function TreffitScreen({ onBack }: Props) {
  const { userId } = useUser();
  const [selected, setSelected] = useState<Activity | null>(null);
  const [filter, setFilter] = useState('Kaikki');
  const [proposals, setProposals] = useState<TreffitProposal[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    return watchTreffitProposals(setProposals);
  }, []);

  const filtered =
    filter === 'Kaikki' ? activities : activities.filter(a => a.category === filter);

  const pendingFromPartner = proposals.filter(
    p => p.status === 'pending' && p.proposedBy !== userId,
  );

  const handlePropose = async () => {
    if (!selected || !userId) return;
    setSending(true);
    try {
      const partnerId = getPartnerId(userId);
      const partnerName = getPartnerName(userId);
      const myName = userId === 'jasper' ? 'Jasper' : 'Senja';

      await proposeTreffit({
        label: selected.label,
        emoji: selected.emoji,
        proposedBy: userId,
        proposedAt: Date.now(),
        status: 'pending',
      });

      await sendNotification({
        to: partnerId,
        message: `${myName} ehdottaa: ${selected.emoji} ${selected.label}`,
        type: 'treffit',
        from: userId,
        createdAt: Date.now(),
        read: {},
      });

      setSent(true);
      setTimeout(() => {
        setSent(false);
        setSelected(null);
      }, 1800);
    } finally {
      setSending(false);
    }
  };

  const handleRespond = async (proposal: TreffitProposal, status: 'confirmed' | 'declined') => {
    if (!userId) return;
    await updateTreffitStatus(proposal.id, status);
    const myName = userId === 'jasper' ? 'Jasper' : 'Senja';
    if (status === 'confirmed') {
      await sendNotification({
        to: proposal.proposedBy,
        message: `${myName} hyväksyi: ${proposal.emoji} ${proposal.label} – Sovittu! 🎉`,
        type: 'treffit',
        from: userId,
        createdAt: Date.now(),
        read: {},
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Takaisin</Text>
        </TouchableOpacity>
        <Text style={styles.title}>💑 Treffit</Text>
        <Text style={styles.subtitle}>Mitä haluaisit tehdä?</Text>
      </View>

      {/* Pending proposals from partner */}
      {pendingFromPartner.length > 0 && (
        <View style={styles.proposalsSection}>
          <Text style={styles.proposalsTitle}>
            {getPartnerName(userId ?? 'jasper')} ehdottaa 👇
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.proposalCards}>
            {pendingFromPartner.map(p => (
              <View key={p.id} style={styles.proposalCard}>
                <Text style={styles.proposalEmoji}>{p.emoji}</Text>
                <Text style={styles.proposalLabel}>{p.label}</Text>
                <View style={styles.proposalBtns}>
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleRespond(p, 'confirmed')}
                  >
                    <Text style={styles.acceptText}>✓ Sovittu!</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.declineBtn}
                    onPress={() => handleRespond(p, 'declined')}
                  >
                    <Text style={styles.declineText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {filterCategories.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, filter === cat && styles.chipActive]}
            onPress={() => setFilter(cat)}
          >
            <Text style={[styles.chipText, filter === cat && styles.chipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.map((act, i) => (
          <TouchableOpacity
            key={i}
            style={styles.activityCard}
            onPress={() => setSelected(act)}
            activeOpacity={0.8}
          >
            <Text style={styles.activityEmoji}>{act.emoji}</Text>
            <View style={styles.activityInfo}>
              <Text style={styles.activityLabel}>{act.label}</Text>
              <Text style={styles.activityCategory}>{act.category}</Text>
            </View>
            <Text style={styles.activityArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selected && (
        <Modal transparent animationType="fade">
          <TouchableOpacity
            style={styles.overlay}
            onPress={() => { setSelected(null); setSent(false); }}
            activeOpacity={1}
          >
            <TouchableOpacity activeOpacity={1} style={styles.modal}>
              {sent ? (
                <>
                  <Text style={styles.modalEmoji}>🎉</Text>
                  <Text style={styles.modalTitle}>Ehdotus lähetetty!</Text>
                  <Text style={styles.modalDesc}>
                    {getPartnerName(userId ?? 'jasper')} saa ilmoituksen.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.modalEmoji}>{selected.emoji}</Text>
                  <Text style={styles.modalTitle}>{selected.label}</Text>
                  <Text style={styles.modalDesc}>{selected.description}</Text>
                  <TouchableOpacity
                    style={styles.proposeBtn}
                    onPress={handlePropose}
                    disabled={sending}
                  >
                    {sending ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.proposeBtnText}>
                        Ehdota {getPartnerName(userId ?? 'jasper')}lle 💌
                      </Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setSelected(null)} style={styles.closeBtn}>
                    <Text style={styles.closeBtnText}>Sulje</Text>
                  </TouchableOpacity>
                </>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F7' },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  backBtn: { marginBottom: 12 },
  backText: { color: '#FF6B9D', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', color: '#222', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#999' },
  proposalsSection: { paddingHorizontal: 20, marginBottom: 8 },
  proposalsTitle: { fontSize: 14, fontWeight: '700', color: '#FF6B9D', marginBottom: 10 },
  proposalCards: { gap: 10 },
  proposalCard: {
    backgroundColor: '#FFE4EE',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    width: 150,
    gap: 6,
  },
  proposalEmoji: { fontSize: 36 },
  proposalLabel: { fontSize: 14, fontWeight: '700', color: '#333', textAlign: 'center' },
  proposalBtns: { flexDirection: 'row', gap: 8, marginTop: 4 },
  acceptBtn: { backgroundColor: '#FF6B9D', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  acceptText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  declineBtn: { backgroundColor: '#F0F0F0', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  declineText: { color: '#AAA', fontSize: 12, fontWeight: '700' },
  filterRow: { maxHeight: 52, marginBottom: 4 },
  filterContent: { paddingHorizontal: 20, gap: 8, alignItems: 'center' },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F0F0' },
  chipActive: { backgroundColor: '#FF6B9D' },
  chipText: { color: '#666', fontWeight: '600', fontSize: 14 },
  chipTextActive: { color: '#fff' },
  list: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, gap: 10 },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  activityEmoji: { fontSize: 36, marginRight: 14 },
  activityInfo: { flex: 1 },
  activityLabel: { fontSize: 16, fontWeight: '600', color: '#222' },
  activityCategory: { fontSize: 12, color: '#AAAAAA', marginTop: 2 },
  activityArrow: { fontSize: 24, color: '#DDD', marginLeft: 4 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  modalEmoji: { fontSize: 72, marginBottom: 4 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#222', textAlign: 'center' },
  modalDesc: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22 },
  proposeBtn: {
    backgroundColor: '#FF6B9D',
    borderRadius: 16,
    paddingHorizontal: 28,
    paddingVertical: 14,
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  proposeBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  closeBtn: { marginTop: 4 },
  closeBtnText: { color: '#CCC', fontSize: 14 },
});
