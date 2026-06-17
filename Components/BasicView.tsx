import React from 'react';
import { Platform, StyleProp, View, ViewStyle } from 'react-native';
import { useStyles } from './Styles';

// fontStyles.ts
export const fontFamily = {
  bold: 'SFRounded-Bold',
  semiBold: 'SFRounded-SemiBold',
  medium: 'SFRounded-Medium',
  regular: 'SFRounded-Regular',
  heavy: 'SFRounded-Heavy',
};

export const lightShadow = Platform.select({
  ios: {
    boxShadow: '0px 0px 30px rgba(0, 0, 0,0.08)',
  },
  android: {
    elevation: 5,
    shadowColor: 'rgba(0,0,0,0.08)',
  },
});

type BasicViewProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  Width?: number;
};

const BasicView = ({ children, style, Width }: BasicViewProps) => {
  const styles1 = useStyles();
  return (
    <View
      style={[
        lightShadow,
        {
          backgroundColor: styles1.White50.color,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: 'white',
          overflow: 'hidden',
          ...(Width !== undefined ? { width: Width } : { alignSelf: 'stretch' }),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export default BasicView;
