import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import {
  Zap, Home, Dumbbell, BarChart2, User,
  LogOut, ChevronLeft, ChevronRight, Camera,
  CreditCard, Shield, Activity,
} from 'lucide-react-native';
import { useApp, ScreenName } from '../context/AppContext';
import { Colors } from '../theme/colors';

const SIDEBAR_W = 220;
const SIDEBAR_COLLAPSED = 64;

type NavItem = {
  id: string;
  label: string;
  Icon: React.ComponentType<any>;
  onPress: () => void;
  isActive: boolean;
  isDanger?: boolean;
};

export const WebSidebar: React.FC = () => {
  const { currentScreen, dashboardTab, navigate, setDashboardTab, userProfile } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const W = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_W;

  const goTab = (tab: 'workouts' | 'evaluations' | 'profile') => {
    navigate('Dashboard');
    setDashboardTab(tab);
  };

  const inJumpFlow = (['CameraIntro', 'JumpInstruction', 'JumpCamera', 'JumpResult'] as ScreenName[]).includes(currentScreen);
  const isDash = (tab: string) => currentScreen === 'Dashboard' && dashboardTab === tab;

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      Icon: Home,
      onPress: () => goTab('workouts'),
      isActive: isDash('workouts') && !inJumpFlow && currentScreen !== 'DailyCheckin',
    },
    {
      id: 'checkin',
      label: 'Check-in Prontezza',
      Icon: Activity,
      onPress: () => navigate('DailyCheckin'),
      isActive: currentScreen === 'DailyCheckin',
    },
    {
      id: 'treningi',
      label: 'Allenamenti',
      Icon: Dumbbell,
      onPress: () => goTab('workouts'),
      isActive: currentScreen === 'WorkoutPlayer',
    },
    {
      id: 'pomiary',
      label: 'Valutazioni',
      Icon: BarChart2,
      onPress: () => goTab('evaluations'),
      isActive: isDash('evaluations'),
    },
    {
      id: 'wyskok',
      label: 'Misura Salto',
      Icon: Camera,
      onPress: () => navigate('CameraIntro'),
      isActive: inJumpFlow,
    },
  ];

  const accountItems: NavItem[] = [
    {
      id: 'profil',
      label: 'Il Mio Profilo',
      Icon: User,
      onPress: () => goTab('profile'),
      isActive: isDash('profile'),
    },
    {
      id: 'premium',
      label: 'Premium',
      Icon: CreditCard,
      onPress: () => navigate('Paywall'),
      isActive: currentScreen === 'Paywall',
    },
    {
      id: 'logout',
      label: 'Esci',
      Icon: LogOut,
      onPress: () => navigate('Welcome'),
      isActive: false,
      isDanger: true,
    },
  ];

  const renderItem = (item: NavItem) => {
    const color = item.isDanger
      ? Colors.secondary
      : item.isActive
      ? Colors.primary
      : Colors.textSecondary;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.navItem,
          item.isActive && styles.navItemActive,
          collapsed && styles.navItemCollapsed,
        ]}
        onPress={item.onPress}
        activeOpacity={0.75}
      >
        <View style={[styles.iconBox, item.isActive && styles.iconBoxActive, item.isDanger && styles.iconBoxDanger]}>
          <item.Icon size={18} color={color} strokeWidth={item.isActive ? 2.5 : 1.8} />
        </View>
        {!collapsed && (
          <Text
            style={[
              styles.navLabel,
              item.isActive && styles.navLabelActive,
              item.isDanger && styles.navLabelDanger,
            ]}
          >
            {item.label}
          </Text>
        )}
        {item.isActive && !collapsed && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
    );
  };

  const positionLabel: Record<string, string> = {
    outside: 'Schiacciatore',
    opposite: 'Opposto',
    middle: 'Centrale',
    setter: 'Palleggiatore',
    libero: 'Libero',
    beach: 'Beach Volley',
  };

  return (
    <View style={[styles.sidebar, { width: W }]}>
      {/* Logo row */}
      <View style={[styles.logoRow, collapsed && styles.logoRowCollapsed]}>
        <View style={styles.logoIcon}>
          <Zap size={16} color="#0F172A" fill="#0F172A" />
        </View>
        {!collapsed && (
          <Text style={styles.logoText} numberOfLines={1}>
            VOLLEY<Text style={styles.logoHighlight}>JUMP</Text>
          </Text>
        )}
        <TouchableOpacity
          onPress={() => setCollapsed(v => !v)}
          style={styles.collapseBtn}
          activeOpacity={0.7}
        >
          {collapsed
            ? <ChevronRight size={14} color={Colors.textMuted} />
            : <ChevronLeft size={14} color={Colors.textMuted} />
          }
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Nav section */}
      <View style={styles.section}>
        {!collapsed && <Text style={styles.sectionLabel}>NAVIGAZIONE</Text>}
        {navItems.map(renderItem)}
      </View>

      <View style={{ flex: 1 }} />

      {/* Account section */}
      <View style={styles.section}>
        {!collapsed && <Text style={styles.sectionLabel}>ACCOUNT</Text>}
        {accountItems.map(renderItem)}
      </View>

      <View style={styles.divider} />

      {/* User profile row at bottom */}
      <View style={[styles.userRow, collapsed && styles.userRowCollapsed]}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>
            {(userProfile?.fullName || 'S').charAt(0).toUpperCase()}
          </Text>
        </View>
        {!collapsed && (
          <View style={{ flex: 1, overflow: 'hidden' }}>
            <Text style={styles.userName} numberOfLines={1}>
              {userProfile?.fullName || 'Siatkarzu'}
            </Text>
            <Text style={styles.userSub} numberOfLines={1}>
              {userProfile?.isSubscribed
                ? '⭐ Premium'
                : positionLabel[userProfile?.position] || 'Siatkarz'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: '#080E1C',
    height: '100%' as any,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'column',
    paddingVertical: 0,
  },

  // Logo
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 10,
  },
  logoRowCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 1.5,
    flex: 1,
  },
  logoHighlight: {
    color: Colors.primary,
  },
  collapseBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    flexShrink: 0,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 0,
  },

  // Sections
  section: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 2,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1.2,
    paddingHorizontal: 8,
    paddingVertical: 6,
    textTransform: 'uppercase',
  },

  // Nav items
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
    position: 'relative' as any,
  },
  navItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  navItemActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconBoxActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  iconBoxDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  navLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    flex: 1,
  },
  navLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  navLabelDanger: {
    color: Colors.secondary,
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    flexShrink: 0,
  },

  // User
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  userRowCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  userSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
});
