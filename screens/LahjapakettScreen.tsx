import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { fontFamily } from '../Components/BasicView';
import TopBlurFade from '../Components/TopBlurFade';
import { useUser } from '../src/context/UserContext';
import { redeemCoupon, watchCoupons } from '../src/firebase/db';

const STORAGE_KEY = '@kupongit_avatut';

interface Props {
  onBack: () => void;
}

interface CouponDef {
  id: string;
  label: string;
  duration: string;
  fromText: string;
  bg: string;
  flapColor: string;
  accent: string;
  image: ReturnType<typeof require>;
}

const COUPONS: CouponDef[] = [
  {
    id: 'hieronta_15',
    label: 'Hieronta',
    duration: '15 min',
    fromText: 'Jasperilta 💕',
    bg: '#FFF0F5',
    flapColor: '#FFCCE0',
    accent: '#FF6B9D',
    image: require('../Images/Massage.webp'),
  },
  {
    id: 'hieronta_30',
    label: 'Hieronta',
    duration: '30 min',
    fromText: 'Jasperilta 💕',
    bg: '#FFE8F2',
    flapColor: '#FFB8D4',
    accent: '#FF4D8A',
    image: require('../Images/Massage.webp'),
  },
  {
    id: 'hieronta_45',
    label: 'Hieronta',
    duration: '45 min',
    fromText: 'Jasperilta 💕',
    bg: '#FFE0EC',
    flapColor: '#FFA0C0',
    accent: '#E8356A',
    image: require('../Images/Massage.webp'),
  },
  {
    id: 'treffi',
    label: 'Treffi-ilta',
    duration: 'Treffit',
    fromText: 'Jasper maksaa 💳',
    bg: '#FFF2F0',
    flapColor: '#FFBBB8',
    accent: '#C93B3B',
    image: require('../Images/Treffi.webp'),
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HALF_CARD = (SCREEN_WIDTH - 48) / 2;

// ─── EnvelopeCard ─────────────────────────────────────────────────────────────

interface CardProps {
  coupon: CouponDef;
  redeemed: boolean;
  initiallyOpen: boolean;
  onOpened: () => void;
  onRedeem: () => void;
}

function EnvelopeCard({
  coupon,
  redeemed,
  initiallyOpen,
  onOpened,
  onRedeem,
}: CardProps) {
  const startOpen = initiallyOpen || redeemed;
  const [isOpen, setIsOpen] = useState(startOpen);
  const envelopeOpacity = useRef(new Animated.Value(startOpen ? 0 : 1)).current;
  const envelopeScale = useRef(new Animated.Value(startOpen ? 0 : 1)).current;
  const shakeX = useRef(new Animated.Value(0)).current;
  const couponOpacity = useRef(new Animated.Value(startOpen ? 1 : 0)).current;
  const couponScale = useRef(new Animated.Value(startOpen ? 1 : 0.82)).current;
  const couponTranslateY = useRef(
    new Animated.Value(startOpen ? 0 : 28),
  ).current;

  useEffect(() => {
    if (redeemed && !isOpen) {
      setIsOpen(true);
      Animated.parallel([
        Animated.timing(envelopeOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(couponOpacity, {
          toValue: 1,
          speed: 14,
          bounciness: 8,
          useNativeDriver: true,
        }),
        Animated.spring(couponScale, {
          toValue: 1,
          speed: 14,
          bounciness: 8,
          useNativeDriver: true,
        }),
        Animated.spring(couponTranslateY, {
          toValue: 0,
          speed: 14,
          bounciness: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [redeemed]);

  const openEnvelope = () => {
    if (isOpen) return;

    Animated.sequence([
      Animated.timing(shakeX, {
        toValue: 7,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeX, {
        toValue: -7,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeX, {
        toValue: 4,
        duration: 45,
        useNativeDriver: true,
      }),
      Animated.timing(shakeX, {
        toValue: 0,
        duration: 45,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsOpen(true);
      onOpened();
      Animated.parallel([
        Animated.timing(envelopeOpacity, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(envelopeScale, {
          toValue: 0.88,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        Animated.parallel([
          Animated.spring(couponOpacity, {
            toValue: 1,
            speed: 10,
            bounciness: 12,
            useNativeDriver: true,
          }),
          Animated.spring(couponScale, {
            toValue: 1,
            speed: 10,
            bounciness: 12,
            useNativeDriver: true,
          }),
          Animated.spring(couponTranslateY, {
            toValue: 0,
            speed: 10,
            bounciness: 12,
            useNativeDriver: true,
          }),
        ]).start();
      }, 180);
    });
  };

  return (
    <View style={styles.cardWrapper}>
      {isOpen && (
        <Animated.View
          style={{
            opacity: couponOpacity,
            transform: [
              { scale: couponScale },
              { translateY: couponTranslateY },
            ],
          }}
        >
          <View style={[styles.coupon, { borderColor: coupon.accent }]}>
            {/* Top scissors line */}
            <View
              style={[styles.couponTopLine, { borderColor: coupon.accent }]}
            />

            <Image
              source={coupon.image}
              style={{
                height: 100,
                width: 100,
                borderWidth: 1,
                borderRadius: 20,
                borderColor: 'rgba(255,255,255,0.5)',
              }}
            />
            <Text style={styles.couponLabel}>{coupon.label}</Text>
            <Text style={[styles.couponDuration, { color: coupon.accent }]}>
              {coupon.duration}
            </Text>
            <Text style={styles.couponFrom}>{coupon.fromText}</Text>

            {/* Bottom scissors line */}
            <View
              style={[styles.couponBottomLine, { borderColor: coupon.accent }]}
            />

            {redeemed ? (
              <View style={[styles.usedBadge, { borderColor: coupon.accent }]}>
                <Text style={[styles.usedText, { color: coupon.accent }]}>
                  ✓ Käytetty
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.redeemBtn, { backgroundColor: coupon.accent }]}
                onPress={onRedeem}
                activeOpacity={0.8}
              >
                <Text style={styles.redeemText}>Lunasta</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      )}
      {!isOpen && (
        <Animated.View
          style={{
            opacity: envelopeOpacity,
            transform: [{ translateX: shakeX }, { scale: envelopeScale }],
          }}
        >
          <TouchableOpacity
            onPress={openEnvelope}
            activeOpacity={0.92}
            style={[styles.envelope, { backgroundColor: coupon.bg }]}
          >
            {/* Flap */}
            <View
              style={[styles.flapRect, { backgroundColor: coupon.flapColor }]}
            />
            <View
              style={[
                styles.flapTriangle,
                { borderTopColor: coupon.flapColor },
              ]}
            />
            {/* Heart seal */}
            <View style={styles.sealCircle}>
              <Text style={styles.sealHeart}>❤️</Text>
            </View>
            {/* Body */}
            <View style={styles.envelopeBody}>
              <Text style={styles.envelopeHint}>Napauta avataksesi ✨</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LahjapakettScreen({ onBack }: Props) {
  const { userId } = useUser();
  const [redeemed, setRedeemed] = useState<Record<string, boolean>>({});
  const [opened, setOpened] = useState<Record<string, boolean>>({});
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [firebaseLoaded, setFirebaseLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(val => {
      if (val) setOpened(JSON.parse(val));
      setStorageLoaded(true);
    });
    return watchCoupons(data => {
      setRedeemed(data);
      setFirebaseLoaded(true);
    });
  }, []);

  const handleOpened = async (couponId: string) => {
    const next = { ...opened, [couponId]: true };
    setOpened(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const handleRedeem = async (couponId: string) => {
    if (!userId) return;
    await redeemCoupon(couponId, userId);
  };

  return (
    <View style={{ flex: 1 }}>
      <TopBlurFade HEIGHT={160} />

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Lahjapaketti 🎁</Text>
          <Text style={styles.subtitle}>Sinulle Senja 💕</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {storageLoaded && firebaseLoaded &&
          COUPONS.map(coupon => (
            <EnvelopeCard
              key={coupon.id}
              coupon={coupon}
              redeemed={!!redeemed[coupon.id]}
              initiallyOpen={!!opened[coupon.id]}
              onOpened={() => handleOpened(coupon.id)}
              onRedeem={() => handleRedeem(coupon.id)}
            />
          ))}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 12,
    position: 'absolute',
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  backBtn: {
    marginBottom: 2,
    paddingRight: 4,
  },
  backText: {
    fontSize: 38,
    color: 'black',
    fontFamily: fontFamily.semiBold,
    lineHeight: 42,
  },
  title: {
    fontSize: 30,
    fontFamily: fontFamily.bold,
    color: 'black',
  },
  subtitle: {
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
    color: 'rgba(0,0,0,0.4)',
    marginTop: 1,
  },
  grid: {
    paddingHorizontal: 24,
    paddingTop: 170,
    paddingBottom: 60,
    gap: 14,
  },

  // Card wrapper — sets layout height from coupon
  cardWrapper: {
    position: 'relative',
  },

  // ── Envelope ─────────────────────────────────────
  envelope: {
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  flapRect: {
    height: 80,
  },
  flapTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: HALF_CARD,
    borderRightWidth: HALF_CARD,
    borderTopWidth: 44,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  sealCircle: {
    alignSelf: 'center',
    marginTop: 10,
    top: -30,
    backgroundColor: 'white',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sealHeart: { fontSize: 26 },
  envelopeBody: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
    gap: 4,
  },
  envelopeDuration: {
    fontSize: 36,
    fontFamily: fontFamily.bold,
  },
  envelopeTitle: {
    fontSize: 18,
    fontFamily: fontFamily.semiBold,
    color: 'rgba(0,0,0,0.55)',
  },
  envelopeHint: {
    fontSize: 13,
    fontFamily: fontFamily.medium,
    color: 'rgba(0,0,0,0.35)',
    marginTop: 8,
  },

  // ── Coupon ───────────────────────────────────────
  coupon: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 22,
    paddingHorizontal: 28,
    paddingTop: 18,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  couponTopLine: {
    width: '85%',
    borderTopWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 4,
    opacity: 0.4,
  },
  couponBottomLine: {
    width: '85%',
    borderTopWidth: 1,
    borderStyle: 'dashed',
    marginTop: 6,
    marginBottom: 10,
    opacity: 0.4,
  },
  couponEmoji: { fontSize: 52 },
  couponLabel: {
    fontSize: 22,
    fontFamily: fontFamily.bold,
    color: '#222',
    marginTop: 4,
  },
  couponDuration: {
    fontSize: 42,
    fontFamily: fontFamily.bold,
    lineHeight: 50,
  },
  couponFrom: {
    fontSize: 15,
    fontFamily: fontFamily.medium,
    color: 'rgba(0,0,0,0.45)',
  },
  redeemBtn: {
    borderRadius: 16,
    paddingHorizontal: 48,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  redeemText: {
    fontSize: 17,
    fontFamily: fontFamily.bold,
    color: 'white',
    letterSpacing: 0.3,
  },
  usedBadge: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  usedText: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    opacity: 0.7,
  },
});
