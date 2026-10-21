import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Zap,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Star,
  Award,
  Sparkles,
  Flame,
  CheckCircle2,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Button } from '../components/Button';
import { VertiCamLogo } from '../components/VertiCamLogo';
import { useApp } from '../context/AppContext';

export const WelcomeScreen: React.FC = () => {
  const { navigate } = useApp();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Atmospheric Ambient Glows */}
      <View style={styles.ambientTopGlow} />
      <View style={styles.ambientBottomGlow} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── TOP BAR: LOGO & TRUST BADGE (ESTILO BETTERME) ── */}
          <View style={styles.topBar}>
            <VertiCamLogo size="medium" variant="badge" />

            <View style={styles.ratingBadge}>
              <View style={styles.starsMini}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={11} color="#FBBF24" fill="#FBBF24" />
                ))}
              </View>
              <Text style={styles.ratingText}>4.9 • 18.4k atleti</Text>
            </View>
          </View>

          {/* ── HERO HEADLINE: PROMESSA DIRETA ── */}
          <View style={styles.headlineBox}>
            <View style={styles.heroPill}>
              <Sparkles size={13} color={Colors.primary} />
              <Text style={styles.heroPillText}>AUTOREGOLAZIONE NEUROMUSCOLARE</Text>
            </View>

            <Text style={styles.mainHeadline}>
              Rispondi al test per iniziare il tuo{'\n'}
              <Text style={styles.mainHeadlineHighlight}>allenamento personalizzato</Text>
            </Text>

            <Text style={styles.subHeadline}>
              Valuta il tuo potenziale genetico in 60 secondi e sblocca da <Text style={{ color: Colors.primary, fontWeight: '800' }}>+6 a +10 cm</Text> di salto verticale senza sovraccaricare i tendini rotulei.
            </Text>
          </View>

          {/* ── CARD HERO DE TRANSFORMAÇÃO & PROVA (ESTILO BETTERME) ── */}
          <View style={styles.heroCard}>
            <View style={styles.heroCardHeader}>
              <Award size={18} color={Colors.primary} />
              <Text style={styles.heroCardHeaderText}>METRICHE VERIFICATE IN ITALIA</Text>
            </View>

            {/* Badges de Destaque Flutuantes */}
            <View style={styles.metricsPillsRow}>
              <View style={styles.metricPill}>
                <Flame size={14} color={Colors.primary} />
                <View>
                  <Text style={styles.metricPillNumber}>+8.4 cm</Text>
                  <Text style={styles.metricPillLabel}>Aumento medio</Text>
                </View>
              </View>

              <View style={styles.metricPill}>
                <TrendingUp size={14} color={Colors.accentGreen} />
                <View>
                  <Text style={styles.metricPillNumber}>94.2%</Text>
                  <Text style={styles.metricPillLabel}>Nuovo record</Text>
                </View>
              </View>

              <View style={styles.metricPill}>
                <ShieldCheck size={14} color="#38BDF8" />
                <View>
                  <Text style={styles.metricPillNumber}>0 Infortuni</Text>
                  <Text style={styles.metricPillLabel}>Tendine protetto</Text>
                </View>
              </View>
            </View>

            {/* Visual da Barra de Ganho (Antes vs Depois) */}
            <View style={styles.progressionBarWrap}>
              <View style={styles.progressionLabelRow}>
                <Text style={styles.progressionLabelLeft}>Salto iniziale: 54 cm</Text>
                <Text style={styles.progressionLabelRight}>Con VertiCam: 62.5 cm 🔥</Text>
              </View>
              <View style={styles.progressionTrack}>
                <View style={styles.progressionFill} />
                <View style={styles.progressionPulsePoint} />
              </View>
            </View>
          </View>

          {/* ── PROVA SOCIAL: AVALIAÇÃO DE ATLETA REAL ── */}
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>F</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewAuthor}>Filippo R.</Text>
                <Text style={styles.reviewSub}>Schiacciatore Serie B • Valutazione verificata</Text>
              </View>
              <View style={styles.reviewGainTag}>
                <Text style={styles.reviewGainText}>+9.2 cm</Text>
              </View>
            </View>
            <Text style={styles.reviewBody}>
              "Ero bloccato a 56 cm da un anno intero. Il test giornaliero della fotocamera mi ha fatto capire che mi allenavo troppo stanco. Con le zone di prontezza sono volato a 65.2 cm senza mai più dolore alle ginocchia."
            </Text>
          </View>

          {/* ── BOTÕES DE AÇÃO (ESTILO BETTERME PILL) ── */}
          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={styles.betterMeButton}
              activeOpacity={0.85}
              onPress={() => navigate('Quiz')}
            >
              <Text style={styles.betterMeButtonText}>INIZIA IL TEST GRATUITO</Text>
              <ArrowRight size={20} color="#080C14" strokeWidth={3} />
            </TouchableOpacity>

            <Text style={styles.ctaFootnote}>
              ⏱️ Richiede solo 1 minuto • 100% scientifico via fotocamera
            </Text>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigate('Dashboard')}
              activeOpacity={0.7}
            >
              <Text style={styles.loginLinkText}>Ho già un account →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080C14',
    position: 'relative',
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
  },
  ambientTopGlow: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
  },
  ambientBottomGlow: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 16,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  starsMini: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },

  // Headline
  headlineBox: {
    marginBottom: 20,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginBottom: 12,
  },
  heroPillText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  mainHeadline: {
    fontSize: 27,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 33,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  mainHeadlineHighlight: {
    color: Colors.primary,
  },
  subHeadline: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
  },

  // Hero Card de Transformação
  heroCard: {
    backgroundColor: '#0F1726',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  heroCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  heroCardHeaderText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  metricsPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 18,
  },
  metricPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#080C14',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  metricPillNumber: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  metricPillLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
  },

  // Barra de progressão
  progressionBarWrap: {
    backgroundColor: '#080C14',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  progressionLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressionLabelLeft: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  progressionLabelRight: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  progressionTrack: {
    height: 8,
    backgroundColor: '#1E293B',
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  progressionFill: {
    width: '82%',
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressionPulsePoint: {
    position: 'absolute',
    right: '18%',
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },

  // Review
  reviewCard: {
    backgroundColor: '#0F1726',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#080C14',
    fontSize: 14,
    fontWeight: '900',
  },
  reviewAuthor: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  reviewSub: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  reviewGainTag: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  reviewGainText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  reviewBody: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },

  // CTA Section (Estilo BetterMe)
  ctaSection: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 4,
  },
  betterMeButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  betterMeButtonText: {
    color: '#080C14',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  ctaFootnote: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  loginLink: {
    paddingVertical: 6,
  },
  loginLinkText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});
