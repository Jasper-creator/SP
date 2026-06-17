import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BasicView, { fontFamily, lightShadow } from '../Components/BasicView';
import { useUser } from '../src/context/UserContext';
import {
  sendNotification,
  watchKohdelista,
  watchLeffalista,
} from '../src/firebase/db';
import { getPartnerId, getPartnerName } from '../src/firebase/fcm';
import { ListItem } from '../src/types';

type Step = 'datetime' | 'activity' | 'choice';
type ActivityType = 'food' | 'sport' | 'leffa' | 'kohde';

const MONTHS_FI = [
  'Tammikuu',
  'Helmikuu',
  'Maaliskuu',
  'Huhtikuu',
  'Toukokuu',
  'Kesäkuu',
  'Heinäkuu',
  'Elokuu',
  'Syyskuu',
  'Lokakuu',
  'Marraskuu',
  'Joulukuu',
];
const DAYS_SHORT = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'];
const WEEKDAY_SHORT = ['Su', 'Ma', 'Ti', 'Ke', 'To', 'Pe', 'La'];

const FOODS = [
  { emoji: '🍕', label: 'Pizza' },
  { emoji: '🍣', label: 'Sushi' },
  { emoji: '🍔', label: 'Burger' },
  { emoji: '🍝', label: 'Pasta' },
  { emoji: '🌮', label: 'Tacos' },
  { emoji: '🥡', label: 'Kiinalainen' },
];

const SPORTS = [
  { emoji: '🎾', label: 'Tennis' },
  { emoji: '🚴', label: 'Pyöräily' },
  { emoji: '🏊', label: 'Uinti' },
  { emoji: '🏃', label: 'Juoksu' },
  { emoji: '🏋️', label: 'Kuntosali' },
  { emoji: '🎳', label: 'Keilaus' },
  { emoji: '⛷️', label: 'Hiihto' },
  { emoji: '🧘', label: 'Jooga' },
];

function getCalendarGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function formatTime(h: number, m: number): string {
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function getReadyTime(h: number, m: number): string {
  const total = h * 60 + m - 30;
  const rh = Math.floor(((total % 1440) + 1440) / 60) % 24;
  const rm = ((total % 60) + 60) % 60;
  return `${rh.toString().padStart(2, '0')}:${rm.toString().padStart(2, '0')}`;
}

function formatDateShort(year: number, month: number, day: number): string {
  const d = new Date(year, month, day);
  return `${WEEKDAY_SHORT[d.getDay()]} ${day}.${month + 1}.${year}`;
}

interface Props {
  onBack: () => void;
}

export default function TreffitScreen({ onBack }: Props) {
  const { userId } = useUser();

  const now = new Date();
  const [step, setStep] = useState<Step>('datetime');

  // Calendar state
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

  // Time state
  const [selectedHour, setSelectedHour] = useState(18);
  const [selectedMinute, setSelectedMinute] = useState<0 | 15 | 30 | 45>(0);

  // Activity state
  const [activityType, setActivityType] = useState<ActivityType | null>(null);

  // Confirmation state
  const [selectedItem, setSelectedItem] = useState<{
    label: string;
    emoji: string;
  } | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Lists from Firebase
  const [leffaItems, setLeffaItems] = useState<ListItem[]>([]);
  const [kohdeItems, setKohdeItems] = useState<ListItem[]>([]);

  useEffect(() => {
    const u1 = watchLeffalista(setLeffaItems);
    const u2 = watchKohdelista(setKohdeItems);
    return () => {
      u1();
      u2();
    };
  }, []);

  const handleBack = () => {
    if (step === 'datetime') {
      onBack();
      return;
    }
    if (step === 'activity') {
      setStep('datetime');
      return;
    }
    setStep('activity');
    setActivityType(null);
  };

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
    setSelectedYear(calYear);
    setSelectedMonth(calMonth);
    setCalendarVisible(false);
  };

  const handleActivitySelect = (type: ActivityType) => {
    setActivityType(type);
    setStep('choice');
  };

  const handleSend = async () => {
    if (!selectedItem || !userId || selectedDay === null) return;
    setSending(true);
    try {
      const partnerId = getPartnerId(userId);
      const myName = userId === 'jasper' ? 'Jasper' : 'Senja';
      const dateStr = formatDateShort(selectedYear, selectedMonth, selectedDay);
      const timeStr = formatTime(selectedHour, selectedMinute);
      await sendNotification({
        to: partnerId,
        message: `${myName} suunnittelee treffit! ${selectedItem.emoji} ${selectedItem.label} – ${dateStr} klo ${timeStr} 💕`,
        type: 'treffit',
        from: userId,
        createdAt: Date.now(),
        read: {},
      });
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setSelectedItem(null);
        setStep('datetime');
        setSelectedDay(null);
        setActivityType(null);
        onBack();
      }, 2200);
    } finally {
      setSending(false);
    }
  };

  const grid = getCalendarGrid(calYear, calMonth);
  const calRows: (number | null)[][] = [];
  for (let i = 0; i < grid.length; i += 7) calRows.push(grid.slice(i, i + 7));

  const today = new Date();
  const todayD = today.getDate();
  const todayM = today.getMonth();
  const todayY = today.getFullYear();

  const selectedDateStr =
    selectedDay !== null
      ? formatDateShort(selectedYear, selectedMonth, selectedDay)
      : null;

  const canProceed = selectedDay !== null;

  // ─── Step 1: Date + Time ──────────────────────────────────────────────────────

  const renderDateTimeStep = () => (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Takaisin</Text>
        </TouchableOpacity>
        <Text style={styles.title}>💑 Treffit</Text>
        <Text style={styles.stepLabel}>Vaihe 1/2 – Milloin?</Text>
      </View>

      {/* Date picker */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Valitse päivä</Text>
        <TouchableOpacity
          style={[
            lightShadow,
            styles.dateBtn,
            calendarVisible && styles.dateBtnActive,
          ]}
          onPress={() => setCalendarVisible(v => !v)}
        >
          <Text style={styles.dateBtnEmoji}>📅</Text>
          <Text
            style={[
              styles.dateBtnText,
              !selectedDateStr && styles.dateBtnPlaceholder,
            ]}
          >
            {selectedDateStr ?? 'Valitse päivä'}
          </Text>
          <Text style={styles.dateBtnArrow}>{calendarVisible ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {calendarVisible && (
          <BasicView style={styles.calendar}>
            {/* Month navigation */}
            <View style={styles.calHeader}>
              <TouchableOpacity
                style={styles.calNavBtn}
                onPress={() => {
                  if (calMonth === 0) {
                    setCalMonth(11);
                    setCalYear(y => y - 1);
                  } else setCalMonth(m => m - 1);
                }}
              >
                <Text style={styles.calNavText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.calMonthText}>
                {MONTHS_FI[calMonth]} {calYear}
              </Text>
              <TouchableOpacity
                style={styles.calNavBtn}
                onPress={() => {
                  if (calMonth === 11) {
                    setCalMonth(0);
                    setCalYear(y => y + 1);
                  } else setCalMonth(m => m + 1);
                }}
              >
                <Text style={styles.calNavText}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Day headers */}
            <View style={styles.calRow}>
              {DAYS_SHORT.map(d => (
                <View key={d} style={styles.calCell}>
                  <Text style={styles.calHeaderText}>{d}</Text>
                </View>
              ))}
            </View>

            {/* Day grid */}
            {calRows.map((row, ri) => (
              <View key={ri} style={styles.calRow}>
                {row.map((day, di) => {
                  const isPast =
                    day !== null &&
                    new Date(calYear, calMonth, day) <
                      new Date(todayY, todayM, todayD);
                  const isToday =
                    day === todayD && calMonth === todayM && calYear === todayY;
                  const isSelected =
                    day === selectedDay &&
                    calMonth === selectedMonth &&
                    calYear === selectedYear;
                  return (
                    <TouchableOpacity
                      key={di}
                      style={[
                        styles.calCell,
                        isSelected && styles.calCellSelected,
                        isToday && !isSelected && styles.calCellToday,
                      ]}
                      onPress={() =>
                        !isPast && day !== null && handleDaySelect(day)
                      }
                      disabled={!day || isPast}
                    >
                      <Text
                        style={[
                          styles.calDayText,
                          isSelected && styles.calDaySelected,
                          isToday && !isSelected && styles.calDayToday,
                          isPast && styles.calDayPast,
                        ]}
                      >
                        {day ?? ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </BasicView>
        )}
      </View>

      {/* Time picker */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mikä kellon aika?</Text>

        <Text style={styles.timeLabel}>Tunti</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {Array.from({ length: 24 }, (_, i) => i).map(h => (
            <TouchableOpacity
              key={h}
              style={[
                styles.timeChip,
                selectedHour === h && styles.timeChipActive,
              ]}
              onPress={() => setSelectedHour(h)}
            >
              <Text
                style={[
                  styles.timeChipText,
                  selectedHour === h && styles.timeChipTextActive,
                ]}
              >
                {h.toString().padStart(2, '0')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.timeLabel}>Minuutit</Text>
        <View style={styles.minuteRow}>
          {([0, 15, 30, 45] as const).map(m => (
            <TouchableOpacity
              key={m}
              style={[
                styles.minuteChip,
                selectedMinute === m && styles.timeChipActive,
              ]}
              onPress={() => setSelectedMinute(m)}
            >
              <Text
                style={[
                  styles.timeChipText,
                  selectedMinute === m && styles.timeChipTextActive,
                ]}
              >
                :{m.toString().padStart(2, '0')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {canProceed && (
          <View style={styles.timeSummary}>
            <Text style={styles.timeSummaryText}>
              {selectedDateStr} klo {formatTime(selectedHour, selectedMinute)}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[lightShadow, styles.nextBtn]}
        onPress={() => canProceed && setStep('activity')}
        disabled={!canProceed}
      >
        <Text
          style={[
            styles.nextBtnText,
            !canProceed && styles.nextBtnTextDisabled,
          ]}
        >
          Seuraava →
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // ─── Step 2: Activity type ────────────────────────────────────────────────────

  const renderActivityStep = () => (
    <View style={styles.flexFill}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Takaisin</Text>
        </TouchableOpacity>
        <Text style={styles.title}>💑 Treffit</Text>
        <Text style={styles.stepLabel}>Vaihe 2/2 – Mitä tehdään?</Text>
        <View style={styles.summaryPill}>
          <Text style={styles.summaryPillText}>
            📅 {selectedDateStr} klo {formatTime(selectedHour, selectedMinute)}
          </Text>
        </View>
      </View>

      <Text style={styles.bigQuestion}>Mitä me halutaan tehdä?</Text>

      <View style={styles.activityGrid}>
        {[
          {
            type: 'food' as ActivityType,
            emoji: '🍽️',
            label: 'Syödä',
            color: '#FF8C69',
            bg: '#FFE8D6',
          },
          {
            type: 'leffa' as ActivityType,
            emoji: '🎬',
            label: 'Leffa',
            color: '#7B61FF',
            bg: '#EDE8FF',
          },
          {
            type: 'sport' as ActivityType,
            emoji: '💪',
            label: 'Urheilla',
            color: '#4BAF9E',
            bg: '#D4F0EA',
          },
          {
            type: 'kohde' as ActivityType,
            emoji: '📍',
            label: 'Kohde',
            color: 'rgba(0,0,0,0.36)',
            bg: '#FFF0DE',
          },
        ].map(opt => (
          <TouchableOpacity
            key={opt.type}
            style={[styles.activityCard, { backgroundColor: opt.bg }]}
            onPress={() => handleActivitySelect(opt.type)}
            activeOpacity={0.8}
          >
            <Text style={styles.activityEmoji}>{opt.emoji}</Text>
            <Text style={[styles.activityLabel, { color: opt.color }]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // ─── Step 3: Choice ───────────────────────────────────────────────────────────

  const renderChoiceStep = () => {
    const titleMap: Record<ActivityType, string> = {
      food: '🍽️ Mitä syödään?',
      sport: '💪 Mitä urheilua?',
      leffa: '🎬 Valitse leffa',
      kohde: '📍 Valitse kohde',
    };

    const renderGrid = (items: { emoji: string; label: string }[]) => (
      <ScrollView
        contentContainerStyle={styles.choiceGrid}
        showsVerticalScrollIndicator={false}
      >
        {items.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[lightShadow, styles.choiceCard]}
            onPress={() => setSelectedItem(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.choiceEmoji}>{item.emoji}</Text>
            <Text style={styles.choiceLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );

    const renderFirebaseList = (items: ListItem[], emptyMsg: string) => {
      if (items.length === 0) {
        return (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>
              {activityType === 'leffa' ? '🎬' : '📍'}
            </Text>
            <Text style={styles.emptyText}>Lista on tyhjä!</Text>
            <Text style={styles.emptyHint}>{emptyMsg}</Text>
          </View>
        );
      }
      return (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {items.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[lightShadow, styles.listCard]}
              onPress={() =>
                setSelectedItem({ label: item.name, emoji: item.emoji })
              }
              activeOpacity={0.8}
            >
              <Text style={styles.listEmoji}>{item.emoji}</Text>
              <Text style={styles.listLabel}>{item.name}</Text>
              <Text style={styles.listArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      );
    };

    return (
      <View style={styles.flexFill}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backText}>← Takaisin</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {activityType ? titleMap[activityType] : ''}
          </Text>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryPillText}>
              📅 {selectedDateStr} klo{' '}
              {formatTime(selectedHour, selectedMinute)}
            </Text>
          </View>
        </View>

        {activityType === 'food' && renderGrid(FOODS)}
        {activityType === 'sport' && renderGrid(SPORTS)}
        {activityType === 'leffa' &&
          renderFirebaseList(
            leffaItems,
            'Lisää leffoja kotisivun Leffalista-osiosta',
          )}
        {activityType === 'kohde' &&
          renderFirebaseList(
            kohdeItems,
            'Lisää kohteita kotisivun Kohdelista-osiosta',
          )}
      </View>
    );
  };

  // ─── Confirmation modal ───────────────────────────────────────────────────────

  const renderConfirmModal = () => {
    if (!selectedItem || selectedDay === null) return null;
    const readyTime = getReadyTime(selectedHour, selectedMinute);
    const treffitTime = formatTime(selectedHour, selectedMinute);
    const partnerName = getPartnerName(userId ?? 'jasper');

    return (
      <Modal transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => !sent && !sending && setSelectedItem(null)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[lightShadow, styles.confirmCard]}
          >
            {sent ? (
              <>
                <Text style={styles.confirmEmoji}>🎉</Text>
                <Text style={styles.confirmTitle}>Lähetetty!</Text>
                <Text style={styles.confirmDesc}>
                  {partnerName} saa ilmoituksen.
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.confirmEmoji}>{selectedItem.emoji}</Text>
                <Text style={styles.confirmItemLabel}>
                  {selectedItem.label}
                </Text>
                <View style={styles.confirmBadge}>
                  <Text style={styles.confirmBadgeText}>Mahtava idea! 🎉</Text>
                </View>
                <Text style={styles.confirmReadyText}>
                  Ole valmiina klo {readyTime}
                </Text>
                <Text style={styles.confirmNote}>
                  (30 min ennen klo {treffitTime})
                </Text>
                <Text style={styles.confirmJasper}>Jasper hoitaa loput 💕</Text>

                <TouchableOpacity
                  style={styles.sendBtn}
                  onPress={handleSend}
                  disabled={sending}
                >
                  {sending ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.sendBtnText}>
                      Lähetä {partnerName}lle 💌
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSelectedItem(null)}
                  style={styles.closeLink}
                >
                  <Text style={styles.closeLinkText}>Sulje</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {step === 'datetime' && renderDateTimeStep()}
      {step === 'activity' && renderActivityStep()}
      {step === 'choice' && renderChoiceStep()}
      {renderConfirmModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  flexFill: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  backBtn: { marginBottom: 10 },
  backText: {
    color: 'rgba(0,0,0,0.36)',
    fontSize: 16,
    fontFamily: fontFamily.bold,
  },
  title: {
    fontSize: 26,
    fontFamily: fontFamily.bold,
    marginBottom: 2,
  },
  stepLabel: {
    color: 'rgba(0,0,0,0.36)',
    fontSize: 13,
    marginBottom: 8,
    fontFamily: fontFamily.semiBold,
  },

  summaryPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFE4EE',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 4,
  },
  summaryPillText: {
    color: 'rgba(0,0,0,0.36)',
    fontSize: 13,
    fontFamily: fontFamily.bold,
  },

  // Sections
  section: { marginHorizontal: 20, marginTop: 16 },
  sectionTitle: {
    fontSize: 17,
    fontFamily: fontFamily.bold,
    color: 'black',
    marginBottom: 10,
  },

  // Date button
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'white',
    overflow: 'hidden',
    gap: 10,
  },
  dateBtnActive: { bordercolor: 'rgba(0,0,0,0.36' },
  dateBtnEmoji: { fontSize: 20 },
  dateBtnText: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: '#222',
  },
  dateBtnPlaceholder: { color: 'rgba(0,0,0,0.36)' },
  dateBtnArrow: { fontSize: 12, color: 'rgba(0,0,0,0.36)' },

  // Calendar
  calendar: {
    padding: 12,
    marginTop: 8,
  },
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calNavBtn: { padding: 8 },
  calNavText: {
    fontSize: 22,
    color: 'rgba(0,0,0,0.36)',
    fontFamily: fontFamily.bold,
  },
  calMonthText: { fontSize: 15, fontFamily: fontFamily.bold, color: '#333' },
  calRow: { flexDirection: 'row' },
  calCell: {
    flex: 1,
    paddingVertical: 7,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  calCellSelected: { backgroundcolor: 'rgba(0,0,0,0.36)' },
  calCellToday: { backgroundColor: '#FFE4EE' },
  calHeaderText: {
    fontSize: 11,
    fontFamily: fontFamily.bold,
    color: 'rgba(0,0,0,0.36)',
  },
  calDayText: { fontSize: 14, fontFamily: fontFamily.bold, color: '#333' },
  calDaySelected: { color: '#fff', fontFamily: fontFamily.bold },
  calDayToday: { color: 'rgba(0,0,0,0.36)', fontFamily: fontFamily.bold },
  calDayPast: { color: '#DDD' },

  // Time
  timeLabel: {
    fontSize: 13,
    fontFamily: fontFamily.bold,
    color: '#888',
    marginTop: 12,
    marginBottom: 6,
  },
  chipRow: { gap: 6, alignItems: 'center' },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    minWidth: 44,
    alignItems: 'center',
  },
  timeChipActive: { backgroundcolor: 'rgba(0,0,0,0.36)' },
  timeChipText: {
    fontSize: 14,
    fontFamily: fontFamily.bold,
    color: 'rgba(0,0,0,0.36)',
  },
  timeChipTextActive: { color: '#000' },
  minuteRow: { flexDirection: 'row', gap: 10, marginTop: 2 },
  minuteChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  timeSummary: {
    marginTop: 16,
    backgroundColor: '#FFE4EE',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  timeSummaryText: {
    color: 'rgba(0,0,0,0.50)',
    fontSize: 17,
    fontFamily: fontFamily.bold,
  },

  // Next button
  nextBtn: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'white',
    overflow: 'hidden',
    padding: 18,
    alignItems: 'center',
  },
  nextBtnText: { color: '#000', fontSize: 17, fontFamily: fontFamily.bold },
  nextBtnTextDisabled: { color: 'rgba(0,0,0,0.36)' },

  // Activity step
  bigQuestion: {
    fontSize: 20,
    fontFamily: fontFamily.bold,
    color: '#333',
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 20,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    left: 20,
  },
  activityCard: {
    width: 176,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  activityEmoji: { fontSize: 44 },
  activityLabel: { fontSize: 18, fontFamily: fontFamily.bold },

  // Choice step - grid (food/sport)
  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 12,
  },
  choiceCard: {
    width: 176,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
    overflow: 'hidden',
  },
  choiceEmoji: { fontSize: 48 },
  choiceLabel: { fontSize: 15, fontFamily: fontFamily.bold, color: '#333' },

  // Choice step - list (leffa/kohde)
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 10,
  },
  listCard: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
    overflow: 'hidden',
  },
  listEmoji: { fontSize: 32, marginRight: 14 },
  listLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: '#222',
  },
  listArrow: { fontSize: 22, color: '#DDD' },

  // Empty state
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 40,
  },
  emptyEmoji: { fontSize: 56 },
  emptyText: { fontSize: 18, fontFamily: fontFamily.bold, color: '#333' },
  emptyHint: { fontSize: 14, color: 'rgba(0,0,0,0.36)', textAlign: 'center' },

  // Confirmation modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  confirmCard: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'white',
    overflow: 'hidden',
    padding: 32,
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  confirmEmoji: { fontSize: 72, marginBottom: 4 },
  confirmItemLabel: {
    fontSize: 22,
    fontFamily: fontFamily.bold,
    color: '#222',
  },
  confirmBadge: {
    backgroundColor: '#FFE4EE',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginTop: 4,
  },
  confirmBadgeText: {
    color: 'rgba(0,0,0,0.36)',
    fontSize: 16,
    fontFamily: fontFamily.bold,
  },
  confirmReadyText: {
    fontSize: 20,
    fontFamily: fontFamily.bold,
    color: '#222',
    marginTop: 8,
  },
  confirmNote: { fontSize: 13, color: 'rgba(0,0,0,0.36)' },
  confirmJasper: {
    fontSize: 16,
    color: 'rgba(0,0,0,0.36)',
    fontFamily: fontFamily.bold,
    marginTop: 4,
  },
  sendBtn: {
    backgroundColor: 'rgba(255,100,100,1)',
    borderRadius: 16,
    paddingHorizontal: 28,
    paddingVertical: 14,
    marginTop: 12,
    width: '100%',
    alignItems: 'center',
  },
  sendBtnText: { color: '#fff', fontSize: 15, fontFamily: fontFamily.bold },
  closeLink: { marginTop: 6 },
  closeLinkText: { color: 'rgba(0,0,0,0.36)', fontSize: 14 },
  confirmTitle: { fontSize: 24, fontFamily: fontFamily.bold, color: '#222' },
  confirmDesc: { fontSize: 15, color: '#888' },
});
