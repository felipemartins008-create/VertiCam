import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../theme/colors';

interface VertiCamLogoProps {
  size?: 'small' | 'medium' | 'large' | 'hero';
  showSubtitle?: boolean;
  style?: ViewStyle;
  variant?: 'image' | 'text';
}

export const VertiCamLogo: React.FC<VertiCamLogoProps> = ({
  size = 'medium',
  showSubtitle = true,
  style,
  variant = 'image',
}) => {
  const getDims = () => {
    switch (size) {
      case 'small':
        return { width: 120, height: 36 };
      case 'large':
        return { width: 220, height: 68 };
      case 'hero':
        return { width: 280, height: 86 };
      case 'medium':
      default:
        return { width: 160, height: 48 };
    }
  };

  const dims = getDims();

  if (variant === 'image') {
    return (
      <View style={[styles.container, style]}>
        <Image
          source={require('../../assets/logo.png')}
          style={{ width: dims.width, height: dims.height }}
          resizeMode="contain"
        />
      </View>
    );
  }

  // Text variant with high-tech badge
  return (
    <View style={[styles.container, style]}>
      <View style={styles.textRow}>
        <Text style={[styles.vertiText, size === 'small' && styles.textSmall, size === 'large' && styles.textLarge, size === 'hero' && styles.textHero]}>
          verti<Text style={styles.camText}>cam</Text>
        </Text>
      </View>
      {showSubtitle && (
        <Text style={[styles.subtitle, size === 'small' && styles.subSmall]}>
          VERTICAL JUMP ANALYSIS
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vertiText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textTransform: 'lowercase',
  },
  camText: {
    color: Colors.primary,
  },
  textSmall: {
    fontSize: 18,
  },
  textLarge: {
    fontSize: 32,
  },
  textHero: {
    fontSize: 40,
  },
  subtitle: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2.2,
    color: Colors.textSecondary,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  subSmall: {
    fontSize: 7.5,
    letterSpacing: 1.5,
  },
});
