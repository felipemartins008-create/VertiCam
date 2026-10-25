import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { Dumbbell, TrendingUp, User } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

export const BottomNavBar: React.FC = () => {
  const { width } = useWindowDimensions();
  // Mostra em todas as resoluções no mobile e desktop compacto
  if (width >= 1024) return null;

  const { dashboardTab, setDashboardTab, navigate } = useApp();

  const tabs = [
    {
      id: 'workouts' as const,
      label: 'Treinos',
      Icon: Dumbbell,
    },
    {
      id: 'evaluations' as const,
      label: 'Avaliações',
      Icon: TrendingUp,
    },
    {
      id: 'profile' as const,
      label: 'Perfil',
      Icon: User,
    },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const active = dashboardTab === tab.id;

        return (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.75}
            style={styles.tabItem}
            onPress={() => {
              setDashboardTab(tab.id);
              navigate('Dashboard');
            }}
          >
            <View style={[styles.iconWrapper, active && styles.iconWrapperActive]}>
              <tab.Icon
                size={22}
                color={active ? '#000000' : '#8A8D9B'}
                strokeWidth={active ? 2.6 : 2.0}
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
    height: 72,
    backgroundColor: '#090D1A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: Platform.OS === 'ios' ? 16 : 8,
    paddingTop: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconWrapper: {
    width: 44,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconWrapperActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A8D9B',
    letterSpacing: 0.2,
  },
  labelActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
