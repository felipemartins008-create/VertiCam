import React from 'react';
import { Platform, StatusBar, StyleSheet, View, useWindowDimensions } from 'react-native';
import { AppProvider, useApp } from './src/context/AppContext';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { QuizScreen } from './src/screens/QuizScreen';
import { CameraIntroScreen } from './src/screens/CameraIntroScreen';
import { JumpInstructionScreen } from './src/screens/JumpInstructionScreen';
import { JumpCameraScreen } from './src/screens/JumpCameraScreen';
import { JumpResultScreen } from './src/screens/JumpResultScreen';
import { PaywallScreen } from './src/screens/PaywallScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { WorkoutPlayerScreen } from './src/screens/WorkoutPlayerScreen';
import { DailyCheckinScreen } from './src/screens/DailyCheckinScreen';
import { WebSidebar } from './src/components/WebSidebar';
import { Colors } from './src/theme/colors';

const isWeb = Platform.OS === 'web';

// Screens that show the sidebar on desktop
const SIDEBAR_SCREENS = [
  'Dashboard', 'WorkoutPlayer', 'DailyCheckin',
  'CameraIntro', 'JumpInstruction', 'JumpCamera', 'JumpResult',
  'Paywall',
];

const RootNavigator: React.FC = () => {
  const { currentScreen } = useApp();
  const { width } = useWindowDimensions();
  const isDesktop = isWeb && width >= 768;

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Welcome':          return <WelcomeScreen />;
      case 'Quiz':             return <QuizScreen />;
      case 'CameraIntro':      return <CameraIntroScreen />;
      case 'JumpInstruction':  return <JumpInstructionScreen />;
      case 'JumpCamera':       return <JumpCameraScreen />;
      case 'JumpResult':       return <JumpResultScreen />;
      case 'Paywall':          return <PaywallScreen />;
      case 'WorkoutPlayer':    return <WorkoutPlayerScreen />;
      case 'DailyCheckin':     return <DailyCheckinScreen />;
      case 'Dashboard':
      default:                 return <DashboardScreen />;
    }
  };

  // 1. Layout Desktop (Largo: largura >= 768px no Web)
  if (isDesktop) {
    const showSidebar = SIDEBAR_SCREENS.includes(currentScreen);

    if (showSidebar) {
      return (
        <View style={webStyles.appShell}>
          {/* Sidebar estilo BTPrime Desktop */}
          <WebSidebar />

          {/* Área principal */}
          <View style={webStyles.mainArea}>
            <View style={webStyles.screenWrapper}>
              {renderScreen()}
            </View>
          </View>
        </View>
      );
    }

    // Onboarding (Welcome / Quiz) centralizado com visual premium
    return (
      <View style={webStyles.centeredLayout}>
        <View style={webStyles.onboardingCard}>
          {renderScreen()}
        </View>
      </View>
    );
  }

  // 2. Layout Mobile (Tela móvel ou navegador em resolução mobile < 768px)
  return (
    <View style={styles.appContainer}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      {renderScreen()}
    </View>
  );
};

export default function App() {
  return (
    <AppProvider>
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <RootNavigator />
      </View>
    </AppProvider>
  );
}

// Mobile / Universal styles
const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});

// Web / Desktop styles
const webStyles = StyleSheet.create({
  appShell: {
    flex: 1,
    flexDirection: 'row',
    minHeight: '100vh' as any,
    backgroundColor: Colors.background,
  } as any,

  mainArea: {
    flex: 1,
    backgroundColor: Colors.background,
    overflow: 'hidden' as any,
    minHeight: '100vh' as any,
  } as any,

  screenWrapper: {
    flex: 1,
    height: '100%' as any,
    overflow: 'auto' as any,
  } as any,

  centeredLayout: {
    flex: 1,
    minHeight: '100vh' as any,
    backgroundColor: '#04070D',
    alignItems: 'center',
    justifyContent: 'center',
  } as any,

  onboardingCard: {
    width: 440,
    maxHeight: '95vh' as any,
    backgroundColor: Colors.background,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 60,
  } as any,
});
