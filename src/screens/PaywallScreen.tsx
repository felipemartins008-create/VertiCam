import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  CheckCircle2,
  ShieldCheck,
  Zap,
  TrendingUp,
  Video,
  Lock,
  Sparkles,
  CreditCard,
  Check,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useApp } from '../context/AppContext';
import { t } from '../services/i18n';

export const PaywallScreen: React.FC = () => {
  const { navigate, setSubscribed } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const benefits = [
    {
      icon: <Lock size={20} color={Colors.primary} />,
      title: 'Piano personalizzato di 8 settimane',
      desc: 'Targettizzato sul tuo ruolo in campo e sulla tua elevazione attuale.',
    },
    {
      icon: <TrendingUp size={20} color={Colors.accentGreen} />,
      title: 'Test di salto illimitati con telecamera',
      desc: 'Verifica i progressi con un laboratorio di fisica in tasca senza limiti.',
    },
    {
      icon: <ShieldCheck size={20} color={Colors.secondary} />,
      title: 'Protezione ginocchia (Ginocchio del saltatore)',
      desc: 'Isometria e rinforzo del tendine rotuleo e della cuffia dei rotatori.',
    },
    {
      icon: <Video size={20} color={Colors.accentBlue} />,
      title: 'Video HD con spiegazione esercizi',
      desc: 'Indicazioni tecniche in loop HD da preparatori atletici di SuperLega.',
    },
  ];

  const handleSubscribe = () => {
    setIsLoading(true);
    // Simulazione autorizzazione pagamento (Apple Pay / Google Pay / Stripe / RevenueCat)
    setTimeout(() => {
      setIsLoading(false);
      setSubscribed(true);
      navigate('Dashboard');
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        showBack
        onBack={() => navigate('JumpResult')}
        title="VertiCam PRO"
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Nagłówek Oferty */}
        <View style={styles.headerBox}>
          <View style={styles.proBadge}>
            <Sparkles size={14} color="#0F172A" />
            <Text style={styles.proBadgeText}>OFFERTA PER PALLAVOLISTI</Text>
          </View>
          <Text style={styles.mainTitle}>{t('paywall.title')}</Text>
          <Text style={styles.subtitle}>{t('paywall.subtitle')}</Text>
        </View>

        {/* Lista korzyści */}
        <View style={styles.benefitsList}>
          {benefits.map((b, idx) => (
            <View key={idx} style={styles.benefitCard}>
              <View style={styles.iconCircle}>{b.icon}</View>
              <View style={styles.benefitTextWrap}>
                <Text style={styles.benefitTitle}>{b.title}</Text>
                <Text style={styles.benefitDesc}>{b.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Wybór Planów Cenowych */}
        <View style={styles.plansContainer}>
          {/* Plan Roczny */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.planCard, selectedPlan === 'annual' && styles.planCardActive]}
            onPress={() => setSelectedPlan('annual')}
          >
            {/* Etykieta oszczędności */}
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>RISPARMI IL 40%</Text>
            </View>

            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planName}>Piano Annuale</Text>
                <Text style={styles.planPerMonth}>~29,00 € / mese</Text>
              </View>
              <View style={styles.checkCircle}>
                {selectedPlan === 'annual' && <Check size={16} color="#0F172A" strokeWidth={3} />}
              </View>
            </View>

            <View style={styles.planPriceRow}>
              <Text style={styles.planPrice}>349,00 €</Text>
              <Text style={styles.planPeriod}>/ anno</Text>
            </View>
          </TouchableOpacity>

          {/* Plan Miesięczny */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardActive]}
            onPress={() => setSelectedPlan('monthly')}
          >
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planName}>Piano Mensile</Text>
                <Text style={styles.planPerMonth}>Accesso flessibile</Text>
              </View>
              <View style={styles.checkCircle}>
                {selectedPlan === 'monthly' && <Check size={16} color="#0F172A" strokeWidth={3} />}
              </View>
            </View>

            <View style={styles.planPriceRow}>
              <Text style={styles.planPrice}>49,00 €</Text>
              <Text style={styles.planPeriod}>/ mese</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Metody Płatności */}
        <View style={styles.paymentsSection}>
          <Text style={styles.paymentsLabel}>{t('paywall.paymentMethods')}</Text>
          <View style={styles.methodsRow}>
            <View style={styles.methodBadge}>
              <Text style={styles.satispayText}>Satispay</Text>
            </View>
            <View style={styles.methodBadge}>
              <Text style={styles.methodText}> Pay</Text>
            </View>
            <View style={styles.methodBadge}>
              <Text style={styles.methodText}>G Pay</Text>
            </View>
            <View style={styles.methodBadge}>
              <CreditCard size={14} color={Colors.textPrimary} />
              <Text style={styles.methodText}>Carta</Text>
            </View>
          </View>
        </View>

        {/* Gwarancja */}
        <View style={styles.guaranteeBox}>
          <ShieldCheck size={16} color={Colors.accentGreen} />
          <Text style={styles.guaranteeText}>{t('paywall.guarantee')}</Text>
        </View>
      </ScrollView>

      {/* Dolny przycisk subskrypcji */}
      <View style={styles.footer}>
        <Button
          title={t('paywall.cta')}
          variant="primary"
          size="large"
          loading={isLoading}
          onPress={handleSubscribe}
          icon={<Zap size={20} color="#0F172A" fill="#0F172A" />}
        />
        <Text style={styles.termsText}>{t('paywall.terms')}</Text>
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
  headerBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 12,
  },
  proBadgeText: {
    color: '#0F172A',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  benefitsList: {
    gap: 12,
    marginBottom: 24,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.cardBackground,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTextWrap: {
    flex: 1,
  },
  benefitTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  benefitDesc: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  plansContainer: {
    gap: 14,
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    position: 'relative',
  },
  planCardActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
  },
  discountBadge: {
    position: 'absolute',
    top: -10,
    right: 18,
    backgroundColor: Colors.primary,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  discountBadgeText: {
    color: '#0F172A',
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  planPerMonth: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  planPrice: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  planPeriod: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  paymentsSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentsLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  methodsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.cardBackground,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  satispayText: {
    color: '#E11D48',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  methodText: {
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  guaranteeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  guaranteeText: {
    color: Colors.accentGreen,
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    alignItems: 'center',
  },
  termsText: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
  },
});
