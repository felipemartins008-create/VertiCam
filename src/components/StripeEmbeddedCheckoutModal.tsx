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
import { ShieldCheck, X, ExternalLink, AlertCircle } from 'lucide-react-native';
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

  // Helper per caricare lo script Stripe.js v3 su Web
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
      // In ambiente nativo reindirizziamo al Payment Link
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

        const pubKey = session.publishableKey || STRIPE_PUBLISHABLE_KEY;
        if (!pubKey) {
          // Fallback al checkout ospitato
          setErrorMessage('Chiave Stripe pubblica non configurata.');
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

        // 4. Montiamo nell'elemento DOM dedicato
        setTimeout(() => {
          const mountEl = document.getElementById('stripe-checkout-mount');
          if (mountEl && checkoutInstanceRef.current) {
            mountEl.innerHTML = '';
            checkoutInstanceRef.current.mount('#stripe-checkout-mount');
          }
        }, 100);
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
  const isDesktop = windowWidth >= 768;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, isDesktop && styles.modalCardDesktop]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.shieldBadge}>
                <ShieldCheck size={16} color={Colors.primary} strokeWidth={2.5} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Checkout Sicuro Stripe</Text>
                <Text style={styles.headerSubtitle}>
                  {planName} • <Text style={styles.headerPrice}>{planPrice}</Text>
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X size={20} color="#8A8D9B" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Subheader Badge */}
          <View style={styles.securityBanner}>
            <Text style={styles.securityBannerText}>
              🔒 Crittografia bancaria end-to-end a 256-bit • Garanzia di rimborso 30 giorni
            </Text>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {loading && (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Inizializzazione checkout sicuro...</Text>
                <Text style={styles.loadingSubtext}>Connessione diretta con i server Stripe</Text>
              </View>
            )}

            {errorMessage && (
              <View style={styles.errorContainer}>
                <AlertCircle size={32} color="#FBBF24" style={{ marginBottom: 12 }} />
                <Text style={styles.errorTitle}>Completa l'ordine in tutta sicurezza</Text>
                <Text style={styles.errorSubtext}>
                  Clicca sul pulsante qui sotto per aprire la schermata di pagamento protetta:
                </Text>
                <TouchableOpacity
                  style={styles.fallbackBtn}
                  onPress={handleFallbackDirectCheckout}
                  activeOpacity={0.88}
                >
                  <Text style={styles.fallbackBtnText}>Procedi al Pagamento ({planPrice})</Text>
                  <ExternalLink size={16} color="#000000" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            )}

            {Platform.OS === 'web' && (
              <View
                // @ts-ignore
                id="stripe-checkout-mount"
                style={[
                  styles.mountContainer,
                  (loading || errorMessage) && { display: 'none' },
                ]}
              />
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 15, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 580,
    maxHeight: '92%',
    backgroundColor: '#0F121E',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    overflow: 'hidden',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 20,
    display: 'flex',
    flexDirection: 'column',
  },
  modalCardDesktop: {
    maxWidth: 620,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#121626',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shieldBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#8A8D9B',
    marginTop: 2,
  },
  headerPrice: {
    color: Colors.primary,
    fontWeight: '700',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityBanner: {
    backgroundColor: 'rgba(0, 229, 255, 0.06)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 229, 255, 0.12)',
    alignItems: 'center',
  },
  securityBannerText: {
    fontSize: 11,
    color: '#8A8D9B',
    fontWeight: '500',
    textAlign: 'center',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    minHeight: 480,
    padding: 16,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
  },
  loadingSubtext: {
    fontSize: 13,
    color: '#8A8D9B',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  errorSubtext: {
    fontSize: 13,
    color: '#8A8D9B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  fallbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  fallbackBtnText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  mountContainer: {
    width: '100%',
    minHeight: 520,
  },
});
