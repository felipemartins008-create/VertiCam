import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Camera, CheckCircle, Zap, Sparkles, Video } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useApp } from '../context/AppContext';
import { t } from '../services/i18n';

export const CameraIntroScreen: React.FC = () => {
  const { navigate } = useApp();

  return (
    <SafeAreaView style={styles.container}>
      <Header showBack onBack={() => navigate('Quiz')} title="VolleyJump AI Vision" />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Odznaka innowacji */}
        <View style={styles.badgeWrapper}>
          <View style={styles.badge}>
            <Sparkles size={14} color={Colors.primary} />
            <Text style={styles.badgeText}>{t('cameraIntro.badge')}</Text>
          </View>
        </View>

        {/* Tytuł */}
        <Text style={styles.title}>{t('cameraIntro.title')}</Text>
        <Text style={styles.description}>{t('cameraIntro.description')}</Text>

        {/* Karta z Formułą Fizyczną */}
        <Card style={styles.formulaCard} highlighted>
          <View style={styles.formulaHeader}>
            <Zap size={20} color={Colors.primary} />
            <Text style={styles.formulaTitle}>Algoritmo del Tempo di Volo (Flight Time Physics)</Text>
          </View>

          <View style={styles.mathBox}>
            <Text style={styles.mathFormula}>{t('cameraIntro.formula')}</Text>
          </View>

          <Text style={styles.mathExplanation}>{t('cameraIntro.formulaDesc')}</Text>
          <Text style={styles.mathSub}>
            Precisione di misurazione: fino a 0.01 secondi grazie all'analisi dello stacco e del contatto con il suolo.
          </Text>
        </Card>

        {/* Korzyści technologii */}
        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <CheckCircle size={20} color={Colors.accentGreen} />
            <Text style={styles.benefitText}>{t('cameraIntro.benefit1')}</Text>
          </View>

          <View style={styles.benefitItem}>
            <CheckCircle size={20} color={Colors.accentGreen} />
            <Text style={styles.benefitText}>{t('cameraIntro.benefit2')}</Text>
          </View>

          <View style={styles.benefitItem}>
            <Video size={20} color={Colors.accentBlue} />
            <Text style={styles.benefitText}>
              Possibilità di analisi in tempo reale o caricamento video in slow motion (Slo-Mo 60/120 FPS).
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Dolne CTA */}
      <View style={styles.footer}>
        <Button
          title={t('cameraIntro.cta')}
          variant="primary"
          size="large"
          onPress={() => navigate('JumpInstruction')}
          icon={<Camera size={20} color="#0F172A" strokeWidth={2.5} />}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  badgeWrapper: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  badgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.textPrimary,
    lineHeight: 32,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  formulaCard: {
    marginBottom: 24,
    padding: 20,
  },
  formulaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  formulaTitle: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  mathBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 12,
  },
  mathFormula: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 2,
  },
  mathExplanation: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  mathSub: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  benefitsList: {
    gap: 14,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.cardBackground,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  benefitText: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
});
