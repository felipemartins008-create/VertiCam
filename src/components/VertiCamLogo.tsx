import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { Zap } from 'lucide-react-native';
import { Colors } from '../theme/colors';

interface VertiCamLogoProps {
  size?: 'small' | 'medium' | 'large' | 'hero';
  showSubtitle?: boolean;
  style?: ViewStyle;
  variant?: 'image' | 'text' | 'badge';
}

export const VertiCamLogo: React.FC<VertiCamLogoProps> = ({
  size = 'medium',
  showSubtitle = true,
  style,
  variant = 'badge',
}) => {
  if (variant === 'image') {
    const getDims = () => {
      switch (size) {
        case 'small':
          return { width: 110, height: 32 };
        case 'large':
          return { width: 180, height: 54 };
        case 'hero':
          return { width: 220, height: 66 };
        case 'medium':
        default:
          return { width: 140, height: 42 };
      }
    };
    const dims = getDims();

    return (
      <View style={[styles.imageWrapper, style]}>
        <Image
          source={require('../../assets/logo.png')}
          style={{ width: dims.width, height: dims.height, borderRadius: 8 }}
          resizeMode="contain"
        />
      </View>
    );
  }

  // Ultra-clean BetterMe style Vector/Typography Brand Mark
  const iconSize = size === 'small' ? 14 : size === 'large' ? 20 : size === 'hero' ? 24 : 17;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.brandRow}>
        <View style={[styles.iconPill, size === 'small' && styles.iconPillSmall, size === 'large' && styles.iconPillLarge]}>
          <Zap size={iconSize} color="#080C14" fill="#080C14" />
        </View>

        <View style={styles.textColumn}>
          <View style={styles.titleRow}>
            <Text style={[styles.vertiText, size === 'small' && styles.textSmall, size === 'large' && styles.textLarge, size === 'hero' && styles.textHero]}>
              verti<Text style={styles.camText}>cam</Text>
            </Text>
          </View>
          {showSubtitle && size !== 'small' && (
            <Text style={[styles.subtitle, size === 'large' && styles.subLarge]}>
              VERTICAL JUMP ANALYSIS
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconPill: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  iconPillSmall: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  iconPillLarge: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  textColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vertiText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textTransform: 'lowercase',
  },
  camText: {
    color: Colors.primary,
    fontWeight: '900',
  },
  textSmall: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 28,
  },
  textHero: {
    fontSize: 34,
  },
  subtitle: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 2,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  subLarge: {
    fontSize: 9.5,
    letterSpacing: 2.4,
  },
});
