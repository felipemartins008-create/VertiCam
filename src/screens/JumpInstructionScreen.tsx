import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Smartphone, UserCheck, Flame, ArrowRight, Camera } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useApp } from '../context/AppContext';
import { t } from '../services/i18n';

export const JumpInstructionScreen: React.FC = () => {
  const { navigate } = useApp();

  const steps = [
    {
      number: '1',
      title: t('instructions.step1Title'),
      desc: t('instructions.step1Desc'),
      icon: <Smartphone size={28} color={Colors.primary} />,
      tip: 'Consiglio: Appoggia il telefono contro una bottiglia o una parete a 90°',
    },
    {
      number: '2',
      title: t('instructions.step2Title'),
      desc: t('instructions.step2Desc'),
      icon: <UserCheck size={28} color={Colors.accentBlue} />,
      tip: 'Consiglio: La sagoma sullo schermo ti aiuterà nel posizionamento ideale',
    },
    {
      number: '3',
      title: t('instructions.step3Title'),
      desc: t('instructions.step3Desc'),
      icon: <Flame size={28} color={Colors.secondary} />,
      tip: 'Consiglio: Atterra nello stesso identico punto da cui hai staccato',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header
        showBack
        onBack={() => navigate('CameraIntro')}
        title={t('instructions.title')}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.headerSubtitle}>{t('instructions.subtitle')}</Text>

        <View style={styles.stepsContainer}>
          {steps.map((s, index) => (
            <View key={index} style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>{s.number}</Text>
                </View>
                <View style={styles.iconContainer}>{s.icon}</View>
              </View>

              <Text style={styles.stepTitle}>{s.title}</Text>
              <Text style={styles.stepDesc}>{s.desc}</Text>

              <View style={styles.tipBox}>
                <Text style={styles.tipText}>{s.tip}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Dolny przycisk otwarcia kamery */}
      <View style={styles.footer}>
        <Button
          title={t('instructions.cta')}
          variant="primary"
          size="large"
          onPress={() => navigate('JumpCamera')}
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
    paddingBottom: 30,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  stepsContainer: {
    gap: 16,
  },
  stepCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stepNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#0F172A',
    fontWeight: '900',
    fontSize: 16,
  },
  iconContainer: {
    padding: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 12,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  stepDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  tipBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  tipText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
});
