import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BasicView, { fontFamily } from '../Components/BasicView';
import { useStyles } from '../Components/Styles';
import { UserId } from '../src/types';

interface Props {
  onSelect: (userId: UserId) => void;
}

export default function LoginScreen({ onSelect }: Props) {
  const styles1 = useStyles();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../Images/Two_WholeBodies.webp')}
          style={styles.heroImage}
          resizeMode="contain"
        />
        <Text style={styles.title}>Tervetuloa!</Text>
        <Text
          style={{
            ...styles.subtitle,
            color: styles1.Black36.color,
            fontFamily: fontFamily.semiBold,
          }}
        >
          Kuka sinä olet?
        </Text>
        <BasicView>
          <TouchableOpacity
            style={[styles.userBtn]}
            onPress={() => onSelect('senja')}
            activeOpacity={0.85}
          >
            <Image
              source={require('../Images/Girl.webp')}
              style={styles.userImage}
              resizeMode="contain"
            />
            <Text style={styles.userName}>Senja</Text>
          </TouchableOpacity>
        </BasicView>
        <BasicView>
          <TouchableOpacity
            style={[styles.userBtn]}
            onPress={() => onSelect('jasper')}
            activeOpacity={0.85}
          >
            <Image
              source={require('../Images/Boy.webp')}
              style={styles.userImage}
              resizeMode="contain"
            />
            <Text style={styles.userName}>Jasper</Text>
          </TouchableOpacity>
        </BasicView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: {
    flex: 1,

    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  heroImage: {
    width: 300,
    height: 300,
    marginBottom: 8,
    position: 'absolute',
    top: -90,
  },
  title: { fontSize: 34, marginTop: 150, fontFamily: fontFamily.bold },
  subtitle: { fontSize: 17, marginBottom: 16 },
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
  userImage: {
    width: 150,
    height: 150,
    position: 'absolute',
    left: -25,
    top: -35,
  },
  userName: { fontSize: 26, fontWeight: '800', color: '#222' },
  userHint: { fontSize: 13, color: 'rgba(0,0,0,0.36)' },
});
