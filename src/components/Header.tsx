import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft, Zap } from 'lucide-react-native';
import { Colors } from '../theme/colors';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, showBack, onBack, rightAction }) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ArrowLeft color={Colors.textPrimary} size={22} />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoBadge}>
            <Zap color={Colors.primary} size={18} fill={Colors.primary} />
            <Text style={styles.logoText}>SIATKA<Text style={styles.logoTextHighlight}>JUMP</Text></Text>
          </View>
        )}
      </View>

      {title && (
        <View style={styles.center}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
        </View>
      )}

      <View style={styles.right}>
        {rightAction}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  right: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: Colors.cardBackground,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  logoTextHighlight: {
    color: Colors.primary,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});
