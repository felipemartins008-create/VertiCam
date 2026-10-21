import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { Home, Dumbbell, TrendingUp, User } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

export const BottomNavBar: React.FC = () => {
  const { width } = useWindowDimensions();
  // Se for desktop (largura >= 768px), a sidebar assume o controle
  if (width >= 768) return null;

  const { dashboardTab, setDashboardTab, navigate } = useApp();

  const tabs = [
    {
      id: 'workouts' as const,
      label: 'Home',
      Icon: Home,
    },
    {
      id: 'programs' as const,
      label: 'Programmi',
      Icon: Dumbbell,
    },
    {
      id: 'evaluations' as const,
      label: 'Valutazioni',
      Icon: TrendingUp,
    },
    {
      id: 'profile' as const,
      label: 'Profilo',
      Icon: User,
    },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab, i) => {
        const active =
          (i === 0 && dashboardTab === 'workouts') ||
          (i === 1 && dashboardTab === 'workouts' && false) ||
          (i === 2 && dashboardTab === 'evaluations') ||
          (i === 3 && dashboardTab === 'profile');

        return (
          <TouchableOpacity
            key={i}
            activeOpacity={0.7}
            style={styles.tabItem}
            onPress={() => {
              if (i === 0 || i === 1) {
                setDashboardTab('workouts');
                navigate('Dashboard');
              } else if (i === 2) {
                setDashboardTab('evaluations');
                navigate('Dashboard');
              } else {
                setDashboardTab('profile');
                navigate('Dashboard');
              }
            }}
          >
            <View style={[styles.iconWrapper, active && styles.iconWrapperActive]}>
              <tab.Icon
                size={22}
                color={active ? Colors.primary : Colors.textMuted}
                strokeWidth={active ? 2.4 : 1.8}
              />
            </View>
            <Text style={[styles.label, active && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 68,
    backgroundColor: Colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconWrapper: {
    width: 36,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
  },
  label: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  labelActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
});
