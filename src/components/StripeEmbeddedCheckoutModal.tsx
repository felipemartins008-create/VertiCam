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
  ScrollView,
  useWindowDimensions,
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
  CreditCard,
  ChevronRight,
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
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [paypalLoading, setPaypalLoading] = useState<boolean>(false);
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

  const installmentAmount = {
    '1_month': '€ 6,66',
    '3_months': '€ 12,66',
    '6_months': '€ 19,99',
  }[planId] || '€ 12,66';

  const handlePayPalCheckout = async () => {
    try {
      setPaypalLoading(true);
      // Cria a sessão com uiMode 'hosted' para redirecionar ao checkout oficial com PayPal
      const session = await createEmbeddedCheckoutSession(planId, userEmail, 'hosted');
      if (session?.url) {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.location.href = session.url;
        } else {
          Linking.openURL(session.url);
        }
      } else {
        const fallbackUrl = getStripeCheckoutUrl(planId, userEmail);
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.location.href = fallbackUrl;
        } else {
          Linking.openURL(fallbackUrl);
        }
      }
    } catch (e) {
      setPaypalLoading(false);
      handleFallbackDirectCheckout();
    }
  };

  const { width: windowWidth } = useWindowDimensions();
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

  const renderSummaryContentDesktop = () => (
    <>
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

      {/* Garanzia Rimborso 7 Giorni */}
      <View style={styles.guaranteeBox}>
        <View style={styles.guaranteeHeader}>
          <RotateCcw size={15} color="#FBBF24" strokeWidth={2.5} />
          <Text style={styles.guaranteeTitle}>Garanzia 100% Soddisfatti o Rimborsati</Text>
        </View>
        <Text style={styles.guaranteeText}>
          Testa VertiCam Pro per 7 giorni. Se non registri un aumento concreto della tua elevazione, ti rimborsiamo l'intero importo senza domande.
        </Text>
      </View>

      {/* Verified by Stripe Banner */}
      <View style={styles.stripeAuditRow}>
        <ShieldCheck size={14} color="#94A3B8" strokeWidth={2} />
        <Text style={styles.stripeAuditText}>
          Elaborazione certificata PCI-DSS Livello 1 via <Text style={styles.stripeAuditBrand}>stripe</Text>
        </Text>
      </View>
    </>
  );

  const renderSummaryContentMobile = () => (
    <View style={styles.mobileSummaryContainer}>
      {/* 1. Header Bar: Brand on Left, Sleek Integrated Close Button on Right */}
      <View style={styles.mobileTopBar}>
        <View style={styles.mobileBrandWrap}>
          <Text style={styles.mobileBrandTitle}>
            Verti<Text style={{ color: Colors.primary }}>Cam</Text>
          </Text>
          <View style={styles.mobileProBadge}>
            <Text style={styles.mobileProText}>PRO</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onClose}
          style={styles.mobileCloseBtn}
          activeOpacity={0.75}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={15} color="#94A3B8" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* 2. Sleek Plan Card with clean typography & breathing room */}
      <View style={styles.mobilePlanHeroCard}>
        <View style={styles.mobilePlanHeroLeft}>
          <View style={styles.mobilePlanTitleRow}>
            <Text style={styles.mobilePlanTitle}>{planInfo.title}</Text>
            {planInfo.savings && (
              <View style={styles.mobileSavingsPill}>
                <Sparkles size={9} color="#00E5FF" strokeWidth={2.5} />
                <Text style={styles.mobileSavingsPillText}>{planInfo.savings}</Text>
              </View>
            )}
          </View>
          <Text style={styles.mobilePlanCadence}>{planInfo.cadence}</Text>
        </View>

        <View style={styles.mobilePriceColumn}>
          <Text style={styles.mobilePriceValue}>{planInfo.priceTotal}</Text>
          <Text style={styles.mobilePriceCadence}>/ {planInfo.duration.toLowerCase()}</Text>
        </View>
      </View>

      {/* 3. Subtle unified trust strip (cyan & soft slate) */}
      <View style={styles.mobileTrustLine}>
        <View style={styles.mobileTrustItem}>
          <Lock size={10} color="#00E5FF" strokeWidth={2.5} />
          <Text style={styles.mobileTrustText}>SSL 256-Bit</Text>
        </View>
        <Text style={styles.mobileTrustDot}>•</Text>
        <View style={styles.mobileTrustItem}>
          <RotateCcw size={10} color="#00E5FF" strokeWidth={2.5} />
          <Text style={styles.mobileTrustText}>7gg Garanzia</Text>
        </View>
        <Text style={styles.mobileTrustDot}>•</Text>
        <View style={styles.mobileTrustItem}>
          <ShieldCheck size={10} color="#00E5FF" strokeWidth={2.5} />
          <Text style={styles.mobileTrustText}>Stripe Sicuro</Text>
        </View>
      </View>
    </View>
  );

  const renderPaymentHeader = () => (
    <View style={[styles.paymentHeader, !isDesktop && styles.paymentHeaderMobile]}>
      <View style={styles.paymentHeaderLeft}>
        <View style={[styles.lockBadgeSolid, !isDesktop && styles.lockBadgeSolidMobile]}>
          <Lock size={isDesktop ? 15 : 12} color="#0F172A" strokeWidth={2.5} />
        </View>
        <View>
          <Text style={[styles.paymentHeaderTitle, !isDesktop && styles.paymentHeaderTitleMobile]}>
            {isDesktop ? 'Pagamento Protetto' : 'Metodo di Pagamento'}
          </Text>
          <Text style={styles.paymentHeaderSubtitle}>
            {isDesktop
              ? 'Transazione crittografata con standard bancario'
              : 'Transazione protetta con crittografia bancaria'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderPaymentTabs = () => (
    <View style={[styles.paymentMethodTabsRow, !isDesktop && styles.paymentMethodTabsRowMobile]}>
      <TouchableOpacity
        style={[
          styles.paymentMethodTab,
          !isDesktop && styles.paymentMethodTabMobile,
          paymentMethod === 'card' && styles.paymentMethodTabActive,
        ]}
        onPress={() => setPaymentMethod('card')}
        activeOpacity={0.85}
      >
        <CreditCard size={isDesktop ? 15 : 14} color={paymentMethod === 'card' ? '#0F172A' : '#64748B'} strokeWidth={2.2} />
        <Text
          style={[
            styles.paymentMethodTabText,
            !isDesktop && styles.paymentMethodTabTextMobile,
            paymentMethod === 'card' && styles.paymentMethodTabTextActive,
          ]}
        >
          {isDesktop ? 'Carta / Apple & Google Pay' : 'Carta / Apple Pay'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.paymentMethodTab,
          !isDesktop && styles.paymentMethodTabMobile,
          paymentMethod === 'paypal' && styles.paymentMethodTabActivePaypal,
        ]}
        onPress={() => setPaymentMethod('paypal')}
        activeOpacity={0.85}
      >
        <View style={styles.paypalTabLogoIcon}>
          <Text style={styles.paypalTabLogoP1}>P</Text>
          <Text style={styles.paypalTabLogoP2}>P</Text>
        </View>
        <Text
          style={[
            styles.paymentMethodTabText,
            !isDesktop && styles.paymentMethodTabTextMobile,
            paymentMethod === 'paypal' && styles.paymentMethodTabTextActivePaypal,
          ]}
        >
          PayPal
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderCardBadges = () => (
    <View style={[styles.cardBadgesRow, !isDesktop && styles.cardBadgesRowMobile]}>
      <View style={[styles.cardBadgePill, !isDesktop && styles.cardBadgePillMobile]}>
        <Text style={[styles.cardBadgeText, !isDesktop && styles.cardBadgeTextMobile]}>VISA</Text>
      </View>
      <View style={[styles.cardBadgePill, !isDesktop && styles.cardBadgePillMobile]}>
        <Text style={[styles.cardBadgeText, !isDesktop && styles.cardBadgeTextMobile]}>Mastercard</Text>
      </View>
      <View style={[styles.cardBadgePill, !isDesktop && styles.cardBadgePillMobile]}>
        <Text style={[styles.cardBadgeText, !isDesktop && styles.cardBadgeTextMobile]}>Apple Pay</Text>
      </View>
      <View style={[styles.cardBadgePill, !isDesktop && styles.cardBadgePillMobile]}>
        <Text style={[styles.cardBadgeText, !isDesktop && styles.cardBadgeTextMobile]}>Google Pay</Text>
      </View>
      <View style={[styles.cardBadgePill, styles.cardBadgePillPaypal, !isDesktop && styles.cardBadgePillMobile]}>
        <Text style={[styles.cardBadgePaypalText, !isDesktop && styles.cardBadgeTextMobile]}>PayPal</Text>
      </View>
      <View style={[styles.cardBadgePill, { borderColor: '#E2E8F0' }, !isDesktop && styles.cardBadgePillMobile]}>
        <Text style={[styles.cardBadgeText, !isDesktop && styles.cardBadgeTextMobile, { color: '#6366F1' }]}>Klarna</Text>
      </View>
    </View>
  );

  const renderPaymentBody = () => (
    <>
      {paymentMethod === 'paypal' ? (
        <View style={styles.paypalContainer}>
          {/* Banner Informativo PayPal */}
          <View style={styles.paypalInfoCard}>
            <View style={styles.paypalHeaderBadge}>
              <View style={styles.paypalLogoIconBig}>
                <Text style={styles.paypalBigP1}>P</Text>
                <Text style={styles.paypalBigP2}>P</Text>
              </View>
              <Text style={styles.paypalBrandTitle}>PayPal Checkout</Text>
            </View>
            <Text style={styles.paypalExplainerText}>
              Paga in modo rapido e sicuro tramite il tuo conto PayPal, oppure dividi l'importo in 3 rate a tasso zero.
            </Text>
          </View>

          {/* Prezzo e Riepilogo per PayPal */}
          <View style={styles.paypalOrderSummaryRow}>
            <View>
              <Text style={styles.paypalOrderLabel}>TOTALE DA CORRISPONDERE</Text>
              <Text style={styles.paypalOrderPlanName}>{planInfo.title}</Text>
            </View>
            <Text style={styles.paypalOrderTotal}>{planInfo.priceTotal}</Text>
          </View>

          {/* Botão Oficial PayPal Amarelo */}
          <TouchableOpacity
            style={styles.paypalMainBtn}
            onPress={handlePayPalCheckout}
            disabled={paypalLoading}
            activeOpacity={0.88}
          >
            {paypalLoading ? (
              <ActivityIndicator size="small" color="#003087" />
            ) : (
              <View style={styles.paypalBtnContent}>
                <View style={styles.paypalLogoBtnIcon}>
                  <Text style={styles.paypalBtnP1}>P</Text>
                  <Text style={styles.paypalBtnP2}>P</Text>
                </View>
                <Text style={styles.paypalBtnLabel}>
                  Paga con <Text style={styles.paypalBtnBrand}>PayPal</Text>
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Botão Secundário Paga in 3 Rate */}
          <TouchableOpacity
            style={styles.paypalInstallmentBtn}
            onPress={handlePayPalCheckout}
            disabled={paypalLoading}
            activeOpacity={0.88}
          >
            <View style={styles.installmentBtnContent}>
              <Text style={styles.installmentBtnTitle}>
                Paga in 3 rate da {installmentAmount}
              </Text>
              <Text style={styles.installmentBtnSub}>
                Senza interessi né costi aggiuntivi con PayPal
              </Text>
            </View>
            <ChevronRight size={18} color="#003087" strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Vantaggi Sicurezza PayPal */}
          <View style={styles.paypalSecurityList}>
            <View style={styles.paypalSecurityItem}>
              <ShieldCheck size={16} color="#0079C1" strokeWidth={2.2} />
              <Text style={styles.paypalSecurityItemText}>
                <Text style={styles.boldDark}>Protezione Acquisti PayPal:</Text> rimborso completo garantito su ordini idonei
              </Text>
            </View>
            <View style={styles.paypalSecurityItem}>
              <Lock size={16} color="#0079C1" strokeWidth={2.2} />
              <Text style={styles.paypalSecurityItemText}>
                <Text style={styles.boldDark}>Zero condivisione dati:</Text> i dettagli della tua carta non vengono comunicati al venditore
              </Text>
            </View>
            <View style={styles.paypalSecurityItem}>
              <Sparkles size={16} color="#0079C1" strokeWidth={2.2} />
              <Text style={styles.paypalSecurityItemText}>
                <Text style={styles.boldDark}>Sblocco Immediato:</Text> accesso immediato all'app e ai test del salto post-acquisto
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <>
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
        </>
      )}

      {/* Footer di Fiducia */}
      <View style={styles.paymentFooterNote}>
        <Lock size={12} color="#94A3B8" />
        <Text style={styles.paymentFooterText}>
          I tuoi dati finanziari sono inviati direttamente a Stripe tramite crittografia TLS 1.3 e non vengono mai memorizzati sui nostri server.
        </Text>
      </View>
    </>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, isDesktop ? styles.modalCardDesktop : styles.modalCardMobile]}>
          {/* Close button float (Desktop only - mobile has integrated button) */}
          {isDesktop && (
            <TouchableOpacity
              onPress={onClose}
              style={styles.floatingCloseBtn}
              activeOpacity={0.75}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X size={18} color="#64748B" strokeWidth={2.5} />
            </TouchableOpacity>
          )}

          {isDesktop ? (
            <View style={styles.mainLayoutDesktop}>
              {/* ── COLONNA SINISTRA: RIEPILOGO ORDINE & GARANZIE (DARK FINTECH AUTHORITY) ── */}
              <View style={styles.leftSummaryColumnDesktop}>
                {renderSummaryContentDesktop()}
              </View>

              {/* ── COLONNA DESTRA: PAGAMENTO STRIPE SEAMLESS (#FFFFFF) ── */}
              <View style={styles.rightPaymentColumnDesktop}>
                {renderPaymentHeader()}
                {renderPaymentTabs()}
                {renderCardBadges()}

                <ScrollView
                  style={styles.paymentScroll}
                  contentContainerStyle={styles.paymentScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {renderPaymentBody()}
                </ScrollView>
              </View>
            </View>
          ) : (
            <ScrollView
              style={styles.mobileMainScroll}
              contentContainerStyle={styles.mobileMainScrollContent}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              bounces={true}
            >
              {/* ── TOP: RIEPILOGO ORDINE COMPATTO & MINIMALISTA (DARK) ── */}
              {renderSummaryContentMobile()}

              {/* ── BOTTOM: PAGAMENTO SICURO & METODI (WHITE) ── */}
              <View style={styles.rightPaymentColumnMobile}>
                {renderPaymentHeader()}
                {renderPaymentTabs()}
                {renderCardBadges()}
                <View style={styles.paymentBodyMobile}>
                  {renderPaymentBody()}
                </View>
              </View>
            </ScrollView>
          )}
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
  modalCardMobile: {
    maxHeight: '92%',
    width: '100%',
    maxWidth: 440,
    borderRadius: 18,
  },
  modalCardDesktop: {
    minHeight: 640,
    height: 'auto',
  },
  mobileMainScroll: {
    width: '100%',
    flex: 1,
  },
  mobileMainScrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
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
  floatingCloseBtnMobile: {
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  mainLayout: {
    flex: 1,
    flexDirection: 'column',
  },
  mainLayoutDesktop: {
    flexDirection: 'row',
  },

  // ── COLONNA SINISTRA MOBILE MINIMAL (Fintech Clean & Luxury) ──
  mobileSummaryContainer: {
    backgroundColor: '#090D1A',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  mobileTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  mobileBrandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mobileBrandTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  mobileProBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.35)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
  },
  mobileProText: {
    color: '#00E5FF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  mobileCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobilePlanHeroCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  mobilePlanHeroLeft: {
    flex: 1,
  },
  mobilePlanTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  mobilePlanTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  mobileSavingsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 229, 255, 0.14)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  mobileSavingsPillText: {
    color: '#00E5FF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  mobilePlanCadence: {
    fontSize: 11,
    color: '#94A3B8',
  },
  mobilePriceColumn: {
    alignItems: 'flex-end',
  },
  mobilePriceValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  mobilePriceCadence: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  mobileTrustLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 2,
  },
  mobileTrustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mobileTrustText: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '600',
  },
  mobileTrustDot: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.2)',
  },

  // ── COLONNA SINISTRA DESKTOP (Dark Luxury Authority) ──
  leftSummaryColumn: {
    backgroundColor: '#090D1A',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  leftSummaryColumnMobile: {
    backgroundColor: '#090D1A',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
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
  brandRowMobile: {
    paddingRight: 40,
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
  rightPaymentColumnMobile: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
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
  paymentHeaderMobile: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  paymentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  lockBadgeSolid: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBadgeSolidMobile: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  paymentHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  paymentHeaderTitleMobile: {
    fontSize: 13.5,
  },
  paymentHeaderSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
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
  cardBadgesRowMobile: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 4,
  },
  cardBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardBadgePillMobile: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cardBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.3,
  },
  cardBadgeTextMobile: {
    fontSize: 9,
  },
  cardBadgePillPaypal: {
    borderColor: '#0079C1',
    backgroundColor: '#F0F9FF',
  },
  cardBadgePaypalText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#003087',
    letterSpacing: 0.3,
  },

  // Tabs di selezione Metodo di Pagamento
  paymentMethodTabsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 28,
    paddingBottom: 14,
  },
  paymentMethodTabsRowMobile: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 6,
  },
  paymentMethodTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  paymentMethodTabMobile: {
    height: 38,
    borderRadius: 10,
    gap: 6,
  },
  paymentMethodTabActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#0F172A',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  paymentMethodTabActivePaypal: {
    backgroundColor: '#FFFFFF',
    borderColor: '#0079C1',
    shadowColor: '#0079C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  paymentMethodTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  paymentMethodTabTextMobile: {
    fontSize: 11.5,
  },
  paymentMethodTabTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  paymentMethodTabTextActivePaypal: {
    color: '#003087',
    fontWeight: '800',
  },
  paypalTabLogoIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: -2,
  },
  paypalTabLogoP1: {
    fontSize: 14,
    fontWeight: '900',
    color: '#003087',
  },
  paypalTabLogoP2: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0079C1',
    marginLeft: -4,
  },

  // Sezione PayPal Checkout
  paypalContainer: {
    paddingVertical: 12,
    gap: 16,
  },
  paypalInfoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  paypalHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paypalLogoIconBig: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paypalBigP1: {
    fontSize: 20,
    fontWeight: '900',
    color: '#003087',
  },
  paypalBigP2: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0079C1',
    marginLeft: -6,
  },
  paypalBrandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#003087',
    letterSpacing: -0.3,
  },
  paypalExplainerText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },

  paypalOrderSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    padding: 14,
    borderRadius: 12,
  },
  paypalOrderLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  paypalOrderPlanName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  paypalOrderTotal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },

  paypalMainBtn: {
    backgroundColor: '#FFC439',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFC439',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  paypalBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paypalLogoBtnIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paypalBtnP1: {
    fontSize: 18,
    fontWeight: '900',
    color: '#003087',
  },
  paypalBtnP2: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0079C1',
    marginLeft: -5,
  },
  paypalBtnLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#003087',
  },
  paypalBtnBrand: {
    fontSize: 17,
    fontWeight: '900',
    color: '#003087',
    letterSpacing: -0.4,
  },

  paypalInstallmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
  },
  installmentBtnContent: {
    gap: 2,
  },
  installmentBtnTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#003087',
  },
  installmentBtnSub: {
    fontSize: 11,
    color: '#0369A1',
  },

  paypalSecurityList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 14,
    gap: 10,
  },
  paypalSecurityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  paypalSecurityItemText: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  boldDark: {
    fontWeight: '700',
    color: '#0F172A',
  },

  paymentScroll: {
    flex: 1,
  },
  paymentScrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 460,
  },
  paymentBodyMobile: {
    paddingHorizontal: 16,
    paddingVertical: 10,
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
