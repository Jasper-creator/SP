import { BlurView } from '@react-native-community/blur';
import MaskedView from '@react-native-masked-view/masked-view';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { AnimatedStyle } from 'react-native-reanimated';

type Prop = {
  startFadeValue?: number;
  HEIGHT?: number;
  style?: AnimatedStyle<ViewStyle>; // allows animated styles
  type?: string;
};

export const BottomBlurFade = ({
  startFadeValue = 0.7,
  HEIGHT = 92,
  style,
  type,
}: Prop) => {
  let height = HEIGHT;
  return (
    <Animated.View
      pointerEvents={'none'}
      style={[
        {
          width: '100%',
          height: height,
          position: 'absolute',
          zIndex: 10,
          bottom: 0,
        },
        style, // 👈 animated style (e.g. { opacity }) will be applied here
      ]}
    >
      <MaskedView
        maskElement={
          <LinearGradient
            colors={['white', 'transparent']}
            start={{ x: 0, y: startFadeValue }}
            end={{ x: 0, y: 0 }}
            style={{ flex: 1 }}
          />
        }
        style={{ height: height }}
      >
        <BlurView
          blurType={'light'}
          blurAmount={3}
          style={StyleSheet.absoluteFill}
          reducedTransparencyFallbackColor={'white'}
        />
      </MaskedView>
    </Animated.View>
  );
};

const TopBlurFade = ({
  startFadeValue = 0.5,
  HEIGHT = 122,
  style,
  type,
}: Prop) => {
  let height = HEIGHT;
  return (
    <Animated.View
      pointerEvents={'none'}
      style={[
        {
          width: '100%',
          height: height,
          position: 'absolute',
          zIndex: 10,
        },
        style,
      ]}
    >
      <MaskedView
        maskElement={
          <LinearGradient
            colors={['white', 'transparent']}
            start={{ x: 0, y: startFadeValue }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1 }}
          />
        }
        style={{ height: height }}
      >
        <BlurView
          blurType={'light'}
          blurAmount={3}
          style={StyleSheet.absoluteFill}
          reducedTransparencyFallbackColor={'white'}
        />
      </MaskedView>
    </Animated.View>
  );
};

export default TopBlurFade;
