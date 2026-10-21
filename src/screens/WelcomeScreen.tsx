import React from 'react';
import { View, Text, StyleSheet, StatusBar, SafeAreaView, TouchableOpacity } from 'react-native';
import { Zap, ShieldCheck, Flame, ChevronRight, TrendingUp } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Button } from '../components/Button';
import { useApp } from '../context/AppContext';
import { t } from '../services/i18n';

export const WelcomeScreen: React.FC = () => {
  const { navigate } = useApp();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Gradiente animado de fundo simulado com layers */}
      <View style={styles.bgGradient} />
      <View style={styles.bgAccent} />
      <View style={styles.bgAccent2} />

      <SafeAreaView style={styles.safeArea}>
        {/* Topo: Badge tecnológico */}
        <View style={styles.header}>
          <View style={styles.techBadge}>
            <Zap size={14} color={Colors.primary} fill={Colors.primary} />
            <Text style={styles.techBadgeText}>MISURA CON TEMPO DI VOLO • SENZA SENSORI</Text>
          </View>
        </View>

        {/* Centro: Hero */}
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.brandRow}>
            <View style={styles.logoIcon}>
              <Zap size={22} color="#0F172A" fill="#0F172A" />
            </View>
            <Text style={styles.brandName}>
              VOLLEY<Text style={styles.brandHighlight}>JUMP</Text>
              <Text style={styles.brandAI}> AI</Text>
            </Text>
          </View>

          {/* Headline principal */}
          <Text style={styles.headline}>AUMENTA LA TUA{'\n'}ELEVAZIONE</Text>
          <Text style={styles.headlineSub}>E SCHIACCIA SOPRA IL MURO</Text>

          <Text style={styles.description}>
            Piattaforma professionale di preparazione fisica con misurazione scientifica del salto tramite telecamera dello smartphone — per i pallavolisti in Italia.
          </Text>

          {/* Pillars */}
          <View style={styles.pillarsContainer}>
            <View style={styles.pillarRow}>
              <View style={styles.pillarIcon}>
                <TrendingUp size={16} color={Colors.primary} />
              </View>
              <Text style={styles.pillarText}>+6 a +10 cm di salto in 8 settimane</Text>
            </View>

            <View style={styles.pillarRow}>
              <View style={styles.pillarIcon}>
                <ShieldCheck size={16} color={Colors.accentGreen} />
              </View>
              <Text style={styles.pillarText}>Protezione ginocchia — Ginocchio del saltatore</Text>
            </View>

            <View style={styles.pillarRow}>
              <View style={styles.pillarIcon}>
                <Flame size={16} color={Colors.secondary} />
              </View>
              <Text style={styles.pillarText}>Misurazione con telecamera (tempo di volo)</Text>
            </View>
          </View>
        </View>

        {/* Botões de ação */}
        <View style={styles.footer}>
          <Button
            title="Inizia — Test Gratuito"
            variant="primary"
            size="large"
            onPress={() => navigate('Quiz')}
            icon={<ChevronRight size={20} color="#0F172A" strokeWidth={3} />}
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
    backgroundColor: '#0F172A',
    position: 'relative',
    overflow: 'hidden',
  },
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F172A',
  },
  bgAccent: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  bgAccent2: {
    position: 'absolute',
    bottom: 60,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
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
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
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
    paddingVertical: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 1.5,
  },
  brandHighlight: {
    color: Colors.primary,
  },
  brandAI: {
    color: Colors.secondary,
    fontWeight: '900',
  },
  headline: {
    fontSize: 34,
    fontWeight: '900',
    color: Colors.textPrimary,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  headlineSub: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primary,
    marginTop: 6,
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 24,
  },
  pillarsContainer: {
    gap: 10,
  },
  pillarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  pillarIcon: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
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
