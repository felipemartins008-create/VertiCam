import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { VertiCamLogo } from './VertiCamLogo';

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
          <VertiCamLogo size="small" variant="badge" />
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
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
});
