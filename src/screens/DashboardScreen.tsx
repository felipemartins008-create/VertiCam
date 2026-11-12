import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { WorkoutHomeScreen } from './WorkoutHomeScreen';
import { EvaluationScreen } from './EvaluationScreen';
import { ProfileScreen } from './ProfileScreen';
import { BottomNavBar } from '../components/BottomNavBar';
import { OnboardingTutorialScreen } from './OnboardingTutorialScreen';
import { BaselineEvaluationScreen } from './BaselineEvaluationScreen';

export const DashboardScreen: React.FC = () => {
  const { dashboardTab, userProfile, jumpHistory } = useApp();

  const isCalibrated = Boolean(userProfile.hasCompletedInitialEvaluation || jumpHistory.length > 0);
  const hasWorkoutDays = Boolean(userProfile.workoutDays && userProfile.workoutDays.length > 0);

  if (!isCalibrated) {
    return hasWorkoutDays ? <BaselineEvaluationScreen /> : <OnboardingTutorialScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabContent}>
        {dashboardTab === 'workouts' && <WorkoutHomeScreen />}
        {dashboardTab === 'evaluations' && <EvaluationScreen />}
        {dashboardTab === 'profile' && <ProfileScreen />}
      </View>
      <BottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabContent: {
    flex: 1,
  },
});
