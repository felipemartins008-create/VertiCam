import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Linking,
  Dimensions,
  ScrollView,
} from 'react-native';
import {
  ShieldCheck,
  Lock,
  X,
  ExternalLink,
  AlertCircle,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { createEmbeddedCheckoutSession, getStripeCheckoutUrl, STRIPE_PUBLISHABLE_KEY } from '../config/stripe';

interface StripeEmbeddedCheckoutModalProps {
  visible: boolean;
  onClose: () => void;
  planId: '1_month' | '3_months' | '6_months';
  planName: string;
  planPrice: string;
  userEmail?: string;
}

export const StripeEmbeddedCheckoutModal: React.FC<StripeEmbeddedCheckoutModalProps> = ({
  visible,
  onClose,
  planId,
  planName,
  planPrice,
  userEmail,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const checkoutInstanceRef = useRef<any>(null);

  // Helper per caricare Stripe.js v3 su Web
  const loadStripeScript = (): Promise<any> => {
    if (typeof window === 'undefined') return Promise.reject(new Error('Non in ambiente Web'));
    if ((window as any).Stripe) {
      return Promise.resolve((window as any).Stripe);
    }
    return new Promise((resolve, reject) => {
      const existing = document.getElementById('stripe-js-script');
      if (existing) {
        existing.addEventListener('load', () => resolve((window as any).Stripe));
        existing.addEventListener('error', reject);
        return;
      }
      const script = document.createElement('script');
      script.id = 'stripe-js-script';
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.onload = () => resolve((window as any).Stripe);
      script.onerror = () => reject(new Error('Impossibile caricare Stripe.js'));
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    let isMounted = true;

    if (!visible) {
      if (checkoutInstanceRef.current) {
        try {
          checkoutInstanceRef.current.destroy();
        } catch (e) {
          // ignore
        }
        checkoutInstanceRef.current = null;
      }
      return;
    }

    if (Platform.OS !== 'web') {
      setLoading(false);
      return;
    }

    const initCheckout = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        // 1. Chiamiamo l'endpoint serverless per generare la sessione
        const session = await createEmbeddedCheckoutSession(planId, userEmail);
        if (!session || !session.clientSecret) {
          throw new Error('Impossibile avviare la sessione di pagamento.');
        }

        let pubKey = session.publishableKey || STRIPE_PUBLISHABLE_KEY;
        if (!pubKey || pubKey.startsWith('sk_')) {
          setErrorMessage('Per completare il pagamento, procedi sulla pagina sicura Stripe.');
          setLoading(false);
          return;
        }

        // 2. Carichiamo Stripe.js
        const StripeFactory = await loadStripeScript();
        const stripe = StripeFactory(pubKey);

        // 3. Inizializziamo l'embedded checkout
        const embeddedCheckout = await stripe.initEmbeddedCheckout({
          clientSecret: session.clientSecret,
        });

        if (!isMounted) {
          embeddedCheckout.destroy();
          return;
        }

        checkoutInstanceRef.current = embeddedCheckout;
        setLoading(false);

        // 4. Montiamo nell'elemento DOM
        setTimeout(() => {
          const mountEl = document.getElementById('stripe-checkout-mount');
          if (mountEl && checkoutInstanceRef.current) {
            mountEl.innerHTML = '';
            checkoutInstanceRef.current.mount('#stripe-checkout-mount');
          }
        }, 80);
      } catch (err: any) {
        if (!isMounted) return;
        setLoading(false);
        setErrorMessage(err?.message || 'Si è verificato un errore nel caricamento del checkout.');
      }
    };

    initCheckout();

    return () => {
      isMounted = false;
      if (checkoutInstanceRef.current) {
        try {
          checkoutInstanceRef.current.destroy();
        } catch (e) {
          // ignore
        }
        checkoutInstanceRef.current = null;
      }
    };
  }, [visible, planId, userEmail]);

  const handleFallbackDirectCheckout = () => {
    const url = getStripeCheckoutUrl(planId, userEmail);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.href = url;
    } else {
      Linking.openURL(url);
    }
  };

  const windowWidth = Dimensions.get('window').width;
  const isDesktop = windowWidth >= 860;

  const planInfo = {
    '1_month': {
      title: 'Piano Mensile',
      duration: '1 Mese',
      priceTotal: '€ 19,99',
      cadence: 'Fatturato mensilmente • Disdici quando vuoi',
      savings: null,
      highlight: false,
    },
    '3_months': {
      title: 'Piano Trimestrale',
      duration: '3 Mesi',
      priceTotal: '€ 37,99',
      cadence: 'Fatturato ogni 3 mesi (€ 12,66/mese)',
      savings: 'Risparmia il 37%',
      highlight: true,
    },
    '6_months': {
      title: 'Piano Semestrale',
      duration: '6 Mesi',
      priceTotal: '€ 59,99',
      cadence: 'Fatturato ogni 6 mesi (€ 9,99/mese)',
      savings: '50% di sconto',
      highlight: false,
    },
  }[planId] || {
    title: planName,
    duration: '3 Mesi',
    priceTotal: planPrice,
    cadence: 'Fatturato periodicamente',
    savings: null,
    highlight: false,
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, isDesktop && styles.modalCardDesktop]}>
          {/* Close button float */}
          <TouchableOpacity
            onPress={onClose}
            style={styles.floatingCloseBtn}
            activeOpacity={0.75}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={18} color="#64748B" strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={[styles.mainLayout, isDesktop && styles.mainLayoutDesktop]}>
            {/* ── COLONNA SINISTRA: RIEPILOGO ORDINE & GARANZIE (DARK FINTECH AUTHORITY) ── */}
            <View style={[styles.leftSummaryColumn, isDesktop && styles.leftSummaryColumnDesktop]}>
              {/* Brand & Security Header */}
              <View style={styles.brandRow}>
                <View style={styles.brandBadge}>
                  <Text style={styles.brandTitle}>
                    Verti<Text style={{ color: Colors.primary }}>Cam</Text>
                  </Text>
                  <View style={styles.proPill}>
                    <Text style={styles.proPillText}>PRO</Text>
                  </View>
                </View>

                <View style={styles.securityLiveBadge}>
                  <Lock size={12} color="#10B981" strokeWidth={2.5} />
                  <Text style={styles.securityLiveText}>256-Bit SSL</Text>
                </View>
              </View>

              {/* Box Piano Selezionato */}
              <View style={styles.planOverviewCard}>
                <View style={styles.planHeaderRow}>
                  <View>
                    <Text style={styles.planCategoryLabel}>PROGRAMMA SELEZIONATO</Text>
                    <Text style={styles.planMainTitle}>{planInfo.title}</Text>
                  </View>
                  {planInfo.savings && (
                    <View style={styles.savingsBadge}>
                      <Sparkles size={11} color="#00E5FF" strokeWidth={2.5} />
                      <Text style={styles.savingsBadgeText}>{planInfo.savings}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.priceHighlightRow}>
                  <Text style={styles.priceHighlightValue}>{planInfo.priceTotal}</Text>
                  <Text style={styles.priceHighlightCadence}>/ {planInfo.duration.toLowerCase()}</Text>
                </View>

                <Text style={styles.cadenceExplainer}>{planInfo.cadence}</Text>
              </View>

              {/* Cosa include il programma */}
              <View style={styles.featuresSection}>
                <Text style={styles.featuresSectionTitle}>COSA INCLUDE IL TUO ACCESSO:</Text>
                
                <View style={styles.featureItemRow}>
                  <View style={styles.featureCheckCircle}>
                    <Check size={11} color="#00E5FF" strokeWidth={3} />
                  </View>
                  <Text style={styles.featureItemText}>
                    <Text style={styles.featureItemBold}>Misurazione IA del salto:</Text> precisione millimetrica via fotocamera
                  </Text>
                </View>

                <View style={styles.featureItemRow}>
                  <View style={styles.featureCheckCircle}>
                    <Check size={11} color="#00E5FF" strokeWidth={3} />
                  </View>
                  <Text style={styles.featureItemText}>
                    <Text style={styles.featureItemBold}>Algoritmo neurale SNC:</Text> autoregolazione del carico su affaticamento
                  </Text>
                </View>

                <View style={styles.featureItemRow}>
                  <View style={styles.featureCheckCircle}>
                    <Check size={11} color="#00E5FF" strokeWidth={3} />
                  </View>
                  <Text style={styles.featureItemText}>
                    <Text style={styles.featureItemBold}>Protocollo tendineo:</Text> prevenzione infortuni e tendinopatia rotulea
                  </Text>
                </View>

                <View style={styles.featureItemRow}>
                  <View style={styles.featureCheckCircle}>
                    <Check size={11} color="#00E5FF" strokeWidth={3} />
                  </View>
                  <Text style={styles.featureItemText}>
                    <Text style={styles.featureItemBold}>Attivazione istantanea:</Text> accesso immediato all'app post-checkout
                  </Text>
                </View>
              </View>

              {/* Garanzia Rimborso 30 Giorni */}
              <View style={styles.guaranteeBox}>
                <View style={styles.guaranteeHeader}>
                  <RotateCcw size={15} color="#FBBF24" strokeWidth={2.5} />
                  <Text style={styles.guaranteeTitle}>Garanzia 100% Soddisfatti o Rimborsati</Text>
                </View>
                <Text style={styles.guaranteeText}>
                  Testa VertiCam Pro per 30 giorni. Se non registri un aumento concreto della tua elevazione, ti rimborsiamo l'intero importo senza domande.
                </Text>
              </View>

              {/* Verified by Stripe Banner */}
              <View style={styles.stripeAuditRow}>
                <ShieldCheck size={14} color="#94A3B8" strokeWidth={2} />
                <Text style={styles.stripeAuditText}>
                  Elaborazione certificata PCI-DSS Livello 1 via <Text style={styles.stripeAuditBrand}>stripe</Text>
                </Text>
              </View>
            </View>

            {/* ── COLONNA DESTRA: PAGAMENTO STRIPE SEAMLESS (#FFFFFF) ── */}
            <View style={[styles.rightPaymentColumn, isDesktop && styles.rightPaymentColumnDesktop]}>
              {/* Header Pagamento Sicuro */}
              <View style={styles.paymentHeader}>
                <View style={styles.paymentHeaderLeft}>
                  <View style={styles.lockBadgeSolid}>
                    <Lock size={15} color="#0F172A" strokeWidth={2.5} />
                  </View>
                  <View>
                    <Text style={styles.paymentHeaderTitle}>Pagamento Protetto</Text>
                    <Text style={styles.paymentHeaderSubtitle}>Transazione crittografata con standard bancario</Text>
                  </View>
                </View>
              </View>

              {/* Circuiti Accettati Logos / Badges */}
              <View style={styles.cardBadgesRow}>
                <View style={styles.cardBadgePill}>
                  <Text style={styles.cardBadgeText}>VISA</Text>
                </View>
                <View style={styles.cardBadgePill}>
                  <Text style={styles.cardBadgeText}>Mastercard</Text>
                </View>
                <View style={styles.cardBadgePill}>
                  <Text style={styles.cardBadgeText}>Apple Pay</Text>
                </View>
                <View style={styles.cardBadgePill}>
                  <Text style={styles.cardBadgeText}>Google Pay</Text>
                </View>
                <View style={[styles.cardBadgePill, { borderColor: '#E2E8F0' }]}>
                  <Text style={[styles.cardBadgeText, { color: '#6366F1' }]}>Klarna</Text>
                </View>
              </View>

              {/* Content / Stripe Iframe Container */}
              <ScrollView
                style={styles.paymentScroll}
                contentContainerStyle={styles.paymentScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {loading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0F172A" />
                    <Text style={styles.loadingMainText}>Connessione sicura a Stripe...</Text>
                    <Text style={styles.loadingSubText}>Inizializzazione del gateway bancario crittografato</Text>
                  </View>
                )}

                {errorMessage && (
                  <View style={styles.errorBox}>
                    <AlertCircle size={28} color="#D97706" style={{ marginBottom: 10 }} />
                    <Text style={styles.errorBoxTitle}>Completa l'acquisto in sicurezza</Text>
                    <Text style={styles.errorBoxText}>
                      Fai clic sul pulsante qui sotto per aprire il modulo di pagamento protetto ufficiale di Stripe:
                    </Text>
                    <TouchableOpacity
                      style={styles.errorFallbackBtn}
                      onPress={handleFallbackDirectCheckout}
                      activeOpacity={0.88}
                    >
                      <Text style={styles.errorFallbackBtnText}>Vai al Pagamento Sicuro ({planInfo.priceTotal})</Text>
                      <ExternalLink size={15} color="#FFFFFF" strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                )}

                {Platform.OS === 'web' && (
                  <View
                    // @ts-ignore
                    id="stripe-checkout-mount"
                    style={[
                      styles.stripeMountArea,
                      (loading || errorMessage) && { display: 'none' },
                    ]}
                  />
                )}

                {/* Footer di Fiducia */}
                <View style={styles.paymentFooterNote}>
                  <Lock size={12} color="#94A3B8" />
                  <Text style={styles.paymentFooterText}>
                    I tuoi dati finanziari sono inviati direttamente a Stripe tramite crittografia TLS 1.3 e non vengono mai memorizzati sui nostri server.
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  modalCard: {
    width: '100%',
    maxWidth: 960,
    maxHeight: '94%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.35,
    shadowRadius: 40,
    elevation: 25,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  modalCardDesktop: {
    minHeight: 640,
  },
  floatingCloseBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  mainLayout: {
    flex: 1,
    flexDirection: 'column',
  },
  mainLayoutDesktop: {
    flexDirection: 'row',
  },

  // ── COLONNA SINISTRA (Dark Luxury Authority) ──
  leftSummaryColumn: {
    backgroundColor: '#090D1A',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  leftSummaryColumnDesktop: {
    width: 380,
    borderBottomWidth: 0,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.08)',
    padding: 32,
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  proPill: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    borderWidth: 1,
    borderColor: '#00E5FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  proPillText: {
    color: '#00E5FF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  securityLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  securityLiveText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },

  planOverviewCard: {
    backgroundColor: '#12172A',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
  },
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  planCategoryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  planMainTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  savingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 229, 255, 0.14)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  savingsBadgeText: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '700',
  },
  priceHighlightRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  priceHighlightValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  priceHighlightCadence: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  cadenceExplainer: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },

  featuresSection: {
    marginBottom: 20,
    gap: 10,
  },
  featuresSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  featureItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureCheckCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  featureItemText: {
    flex: 1,
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 17,
  },
  featureItemBold: {
    fontWeight: '700',
    color: '#FFFFFF',
  },

  guaranteeBox: {
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.25)',
    marginBottom: 16,
  },
  guaranteeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  guaranteeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FBBF24',
    letterSpacing: 0.2,
  },
  guaranteeText: {
    fontSize: 11,
    color: '#D1D5DB',
    lineHeight: 16,
  },

  stripeAuditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingTop: 8,
  },
  stripeAuditText: {
    fontSize: 11,
    color: '#64748B',
  },
  stripeAuditBrand: {
    fontWeight: '800',
    color: '#94A3B8',
  },

  // ── COLONNA DESTRA (Clean White Payment Canvas) ──
  rightPaymentColumn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 520,
  },
  rightPaymentColumnDesktop: {
    minHeight: 640,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 12,
  },
  paymentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lockBadgeSolid: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  paymentHeaderSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  cardBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 28,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexWrap: 'wrap',
  },
  cardBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.3,
  },

  paymentScroll: {
    flex: 1,
  },
  paymentScrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 460,
  },
  stripeMountArea: {
    width: '100%',
    minHeight: 460,
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  loadingMainText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 8,
  },
  loadingSubText: {
    fontSize: 12,
    color: '#64748B',
  },

  errorBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginVertical: 20,
  },
  errorBoxTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 6,
    textAlign: 'center',
  },
  errorBoxText: {
    fontSize: 12,
    color: '#B45309',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  errorFallbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  errorFallbackBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },

  paymentFooterNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 12,
  },
  paymentFooterText: {
    flex: 1,
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
  },
});
