import React from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, TouchableOpacity } from 'react-native';
import { Zap, ShieldCheck, Flame, ChevronRight, TrendingUp, Activity } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Button } from '../components/Button';
import { VertiCamLogo } from '../components/VertiCamLogo';
import { useApp } from '../context/AppContext';

export const WelcomeScreen: React.FC = () => {
  const { navigate } = useApp();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* High-tech ambient gradients */}
      <View style={styles.bgGradient} />
      <View style={styles.bgAccentCyan} />
      <View style={styles.bgAccentMint} />

      <SafeAreaView style={styles.safeArea}>
        {/* Top: Tech Badge */}
        <View style={styles.header}>
          <View style={styles.techBadge}>
            <Activity size={13} color={Colors.primary} />
            <Text style={styles.techBadgeText}>AUTOREGOLAZIONE NEUROMUSCOLARE • AI VISION</Text>
          </View>
        </View>

        {/* Center: Brand Hero & Value Proposition */}
        <View style={styles.content}>
          {/* Official VertiCam Logo */}
          <View style={styles.logoWrapper}>
            <VertiCamLogo size="large" variant="image" />
          </View>

          {/* Headline */}
          <Text style={styles.headline}>ANALISI BIOMECCANICA{'\n'}& SALTO VERTICALE</Text>
          <Text style={styles.headlineSub}>MASSIMIZZA LA TUA ELEVAZIONE</Text>

          <Text style={styles.description}>
            Misura il tempo di volo, RSI e altezza tramite fotocamera. Ricevi ogni giorno un programma di salto autoregolato al 100% sullo stato del tuo SNC.
          </Text>

          {/* Tech & Scientific Pillars */}
          <View style={styles.pillarsContainer}>
            <View style={styles.pillarRow}>
              <View style={[styles.pillarIcon, { backgroundColor: 'rgba(0, 229, 255, 0.12)' }]}>
                <TrendingUp size={16} color={Colors.primary} />
              </View>
              <Text style={styles.pillarText}>+6 a +10 cm di salto in 8 settimane</Text>
            </View>

            <View style={styles.pillarRow}>
              <View style={[styles.pillarIcon, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                <ShieldCheck size={16} color={Colors.accentGreen} />
              </View>
              <Text style={styles.pillarText}>Prevenzione tendinopatia rotulea e carichi ottimali</Text>
            </View>

            <View style={styles.pillarRow}>
              <View style={[styles.pillarIcon, { backgroundColor: 'rgba(0, 229, 255, 0.12)' }]}>
                <Zap size={16} color={Colors.primary} />
              </View>
              <Text style={styles.pillarText}>Test di prontezza giornaliera (CMJ, SJ, RSI)</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <Button
            title="Inizia Valutazione Gratuita"
            variant="primary"
            size="large"
            onPress={() => navigate('Quiz')}
            icon={<ChevronRight size={20} color="#080C14" strokeWidth={3} />}
          />

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigate('Dashboard')}
            activeOpacity={0.7}
          >
            <Text style={styles.loginText}>Ho già un account →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    position: 'relative',
    overflow: 'hidden',
  },
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
  },
  bgAccentCyan: {
    position: 'absolute',
    top: -90,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
  },
  bgAccentMint: {
    position: 'absolute',
    bottom: 80,
    left: -70,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 8,
  },
  techBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  techBadgeText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  logoWrapper: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headline: {
    fontSize: 30,
    fontWeight: '900',
    color: Colors.textPrimary,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  headlineSub: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primary,
    marginTop: 6,
    marginBottom: 14,
    letterSpacing: 0.4,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 22,
  },
  pillarsContainer: {
    gap: 10,
  },
  pillarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(15, 23, 38, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  pillarIcon: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  footer: {
    gap: 12,
    paddingTop: 8,
  },
  loginButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  loginText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});
