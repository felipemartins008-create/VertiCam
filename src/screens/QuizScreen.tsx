import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import {
  ChevronRight,
  ArrowLeft,
  Activity,
  ShieldCheck,
  Lock,
  Star,
  Award,
  HelpCircle,
  Menu,
  CheckCircle2,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { VolleyballPosition } from '../types';
import { estimateStandingReach } from '../utils/jumpPhysics';

interface BetterMeCardOption {
  id: string;
  pillTitle: string;
  imageUri?: string;
  imageSource?: any;
}

export const QuizScreen: React.FC = () => {
  const { userProfile, updateProfile, navigate, setSubscribed } = useApp();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  // Current Funnel Step:
  // 0: Prova Social embaixo da Headline + Botão COMEÇAR
  // 1: Scegli la tua età (Fascia d'età BetterMe)
  // 2: Sport & Ruolo
  // 3: Ostacolo principale / frustrazione
  // 4: Obiettivo di salto nei prossimi 60 giorni
  // 5: Parametri fisici (Altezza, Peso)
  // 6: Analisi Algoritmo IA (Loader BetterMe)
  // 7: Offerta / Diagnosi Personalizzata (Sales Pitch)
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Form State
  const [ageRange, setAgeRange] = useState<string>('18-29');
  const [selectedSport, setSelectedSport] = useState<string>('volley_outside');
  const [selectedObstacle, setSelectedObstacle] = useState<string>('plateau');
  const [targetGain, setTargetGain] = useState<string>('gain_8_12');
  const [height, setHeight] = useState<string>(String(userProfile.heightCm || 192));
  const [weight, setWeight] = useState<string>(String(userProfile.weightKg || 84));

  // AI Loading state
  const [analysisProgress, setAnalysisProgress] = useState<number>(10);
  const [analysisTextIndex, setAnalysisTextIndex] = useState<number>(0);

  const analysisSteps = [
    'Analisi della curva di forza elastica e reattività...',
    'Valutazione del deficit EUR (Countermovement vs Squat Jump)...',
    'Calcolo del rischio di sovraccarico del tendine rotuleo...',
    'Configurazione del protocollo balistico autoregolato...',
    'Calcolo del potenziale di elevazione: +8.4 cm stimati!',
  ];

  useEffect(() => {
    if (currentStep === 6) {
      const interval = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setCurrentStep(7), 400);
            return 100;
          }
          const next = prev + 20;
          const nextIdx = Math.min(Math.floor((next / 100) * (analysisSteps.length - 1)), analysisSteps.length - 1);
          setAnalysisTextIndex(nextIdx);
          return next;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [currentStep]);

  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 0 && currentStep !== 6) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('Welcome');
    }
  };

  const handleFinishBiometrics = async () => {
    const heightNum = parseFloat(height) || 192;
    const calculatedStandingReach = estimateStandingReach(heightNum);

    let pos: VolleyballPosition = 'outside';
    if (selectedSport.includes('outside')) pos = 'outside';
    else if (selectedSport.includes('opposite')) pos = 'opposite';
    else if (selectedSport.includes('middle')) pos = 'middle';
    else if (selectedSport.includes('setter')) pos = 'setter';
    else if (selectedSport.includes('beach')) pos = 'beach';

    let ageNum = 22;
    if (ageRange === 'under_18') ageNum = 16;
    else if (ageRange === '18-29') ageNum = 23;
    else if (ageRange === '30-39') ageNum = 34;
    else if (ageRange === '40-49') ageNum = 44;
    else ageNum = 52;

    await updateProfile({
      position: pos,
      age: ageNum,
      heightCm: heightNum,
      weightKg: parseFloat(weight) || 84,
      standingReachCm: calculatedStandingReach,
      goals: ['higher_jump', 'jumper_knee'],
    });

    setCurrentStep(6); // Trigger AI Analysis Loader
  };

  const heightNum = parseFloat(height) || 192;
  const currentJumpEstimated = 54;
  const potentialJumpProjected = 62.5;

  // ── RENDERER DE CARDS NO ESTILO BETTERME (EXATAMENTE COMO NO SCREENSHOT) ──
  const renderBetterMeCards = (
    options: BetterMeCardOption[],
    selectedId: string,
    onSelect: (id: string) => void
  ) => {
    return (
      <View style={[styles.cardsGrid, isDesktop ? styles.cardsGridDesktop : styles.cardsGridMobile]}>
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              activeOpacity={0.88}
              style={[
                styles.betterMeCard,
                isDesktop && styles.betterMeCardDesktop,
                isSelected && styles.betterMeCardSelected,
              ]}
              onPress={() => onSelect(opt.id)}
            >
              {/* Imagem do Atleta com corte suave */}
              <View style={styles.cardImageContainer}>
                <Image
                  source={opt.imageSource || { uri: opt.imageUri }}
                  style={styles.cardImage}
                  resizeMode="cover"
                  fadeDuration={0}
                />
              </View>

              {/* Botão em formato de Pílula Clara com seta preta (IDÊNTICO AO BETTERME) */}
              <View style={[styles.cardBottomPill, isSelected && styles.cardBottomPillSelected]}>
                <Text style={styles.cardPillText} numberOfLines={1}>
                  {opt.pillTitle}
                </Text>
                <View style={styles.cardArrowCircle}>
                  <ChevronRight size={14} color="#FFFFFF" strokeWidth={3} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.screenWrapper}>
      {/* ── TOP HEADER (ESTILO BETTERME: LOGO NA ESQUERDA, MENU CIRCULAR NA DIREITA) ── */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          {currentStep > 0 && currentStep !== 6 && (
            <TouchableOpacity onPress={handleBack} style={styles.headerBackBtn} activeOpacity={0.7}>
              <ArrowLeft size={18} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <Text style={styles.betterMeLogoText}>
            Verti<Text style={{ color: Colors.primary }}>Cam</Text>
          </Text>
        </View>

        <TouchableOpacity style={styles.headerMenuBtn} activeOpacity={0.7}>
          <Menu size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ══════════════════════════════════════════════════════
            STEP 0: HEADLINE + APENAS UMA PROVA SOCIAL + BOTÃO COMEÇAR
           ══════════════════════════════════════════════════════ */}
        {currentStep === 0 && (
          <View style={styles.stepContainer}>
            <Text style={styles.mainTitle}>PIANO DI ALLENAMENTO ELEVAZIONE & SALTO</Text>
            <Text style={styles.mainSubtitle}>
              RISPONDI AL TEST PER INIZIARE IL TUO ALLENAMENTO PERSONALIZZATO
            </Text>

            {/* ── IMMAGINE DI PROVA ELEVAZIONE (PRIMA vs DOPO - WEBP OTTIMIZZATA) ── */}
            <View style={styles.proofImageCard}>
              <Image
                source={require('../../assets/proof-jump.webp')}
                style={styles.proofImage}
                resizeMode="cover"
                fadeDuration={0}
                // @ts-ignore Web performance props
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </View>

            {/* ── BOTÃO ESCRITO INIZIA (COMEÇAR) ── */}
            <TouchableOpacity
              style={styles.startPillButton}
              activeOpacity={0.88}
              onPress={() => setCurrentStep(1)}
            >
              <Text style={styles.startPillButtonText}>INIZIA</Text>
              <View style={styles.startArrowCircle}>
                <ChevronRight size={18} color="#FFFFFF" strokeWidth={3} />
              </View>
            </TouchableOpacity>

            <Text style={styles.startFootnote}>
              ⏱️ Richiede solo 1 minuto • 100% scientifico via fotocamera
            </Text>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 1: FAIXA ETÁRIA (EXATAMENTE COMO NO SCREENSHOT BETTERME!)
           ══════════════════════════════════════════════════════ */}
        {currentStep === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.mainTitle}>PIANO DI ALLENAMENTO ELEVAZIONE & SALTO</Text>
            <Text style={styles.mainSubtitle}>SCEGLI LA TUA FASCIA D'ETÀ</Text>

            {renderBetterMeCards(
              [
                {
                  id: 'under_18',
                  pillTitle: 'Età: <18',
                  imageSource: require('../../assets/age-under18.webp'),
                },
                {
                  id: '18-29',
                  pillTitle: 'Età: 18–29',
                  imageSource: require('../../assets/age-18-29.webp'),
                },
                {
                  id: '30-39',
                  pillTitle: 'Età: 30–39',
                  imageSource: require('../../assets/age-30-39.webp'),
                },
                {
                  id: '40-49',
                  pillTitle: 'Età: 40–49',
                  imageSource: require('../../assets/age-40-49.webp'),
                },
                {
                  id: '50+',
                  pillTitle: 'Età: 50+',
                  imageSource: require('../../assets/age-50plus.webp'),
                },
              ],
              ageRange,
              (id) => {
                setAgeRange(id);
                setTimeout(() => handleNextStep(), 200);
              }
            )}
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 2: SPORT & RUOLO
           ══════════════════════════════════════════════════════ */}
        {currentStep === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.mainTitle}>SPECIFICITÀ DELLO STACCO</Text>
            <Text style={styles.mainSubtitle}>IN QUALE SPORT E RUOLO VUOI DOMINARE?</Text>

            {renderBetterMeCards(
              [
                {
                  id: 'volley_outside',
                  pillTitle: 'Schiacciatore (Banda)',
                  imageUri: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=600&q=80',
                },
                {
                  id: 'volley_opposite',
                  pillTitle: 'Opposto / Centrale',
                  imageUri: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80',
                },
                {
                  id: 'basketball',
                  pillTitle: 'Pallacanestro (Basket)',
                  imageUri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80',
                },
                {
                  id: 'other',
                  pillTitle: 'Altri Sport Dinamici',
                  imageUri: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
                },
              ],
              selectedSport,
              (id) => {
                setSelectedSport(id);
                setTimeout(() => handleNextStep(), 200);
              }
            )}
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 3: OSTACOLO PRINCIPALE / FRUSTRAZIONE
           ══════════════════════════════════════════════════════ */}
        {currentStep === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.mainTitle}>DIAGNOSTICA DEL SALTO</Text>
            <Text style={styles.mainSubtitle}>QUAL È IL TUO OSTACOLO PRINCIPALE?</Text>

            {renderBetterMeCards(
              [
                {
                  id: 'blocked',
                  pillTitle: 'Non supero il muro',
                  imageUri: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80',
                },
                {
                  id: 'plateau',
                  pillTitle: 'Squat senza salto',
                  imageUri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
                },
                {
                  id: 'knee_fear',
                  pillTitle: 'Dolori al tendine',
                  imageUri: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&w=600&q=80',
                },
                {
                  id: 'no_data',
                  pillTitle: 'Nessuna misurazione',
                  imageUri: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
                },
              ],
              selectedObstacle,
              (id) => {
                setSelectedObstacle(id);
                setTimeout(() => handleNextStep(), 200);
              }
            )}
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 4: OBIETTIVO DI SALTO (60 GIORNI)
           ══════════════════════════════════════════════════════ */}
        {currentStep === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.mainTitle}>POTENZIALE DI ELEVAZIONE</Text>
            <Text style={styles.mainSubtitle}>QUANTO VUOI AUMENTARE IL TUO SALTO?</Text>

            {renderBetterMeCards(
              [
                {
                  id: 'gain_5_8',
                  pillTitle: '+5 a +8 cm',
                  imageUri: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80',
                },
                {
                  id: 'gain_8_12',
                  pillTitle: '+9 a +15 cm (Record)',
                  imageUri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80',
                },
                {
                  id: 'pain_free',
                  pillTitle: 'Tendini senza dolore',
                  imageUri: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&w=600&q=80',
                },
              ],
              targetGain,
              (id) => {
                setTargetGain(id);
                setTimeout(() => handleNextStep(), 200);
              }
            )}
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 5: PARAMETRI FISICI (ALTEZZA & PESO)
           ══════════════════════════════════════════════════════ */}
        {currentStep === 5 && (
          <View style={styles.stepContainer}>
            <Text style={styles.mainTitle}>PARAMETRI BIOMETRICI</Text>
            <Text style={styles.mainSubtitle}>INSERISCI I TUOI DATI PER CALCOLARE IL CARICO</Text>

            <View style={styles.inputsWrap}>
              <View style={styles.inputBox}>
                <Text style={styles.inputBoxLabel}>ALTEZZA CORPOREA (CM)</Text>
                <TextInput
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  placeholder="192"
                  placeholderTextColor="#666666"
                  style={styles.betterMeInput}
                />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputBoxLabel}>PESO CORPOREO (KG)</Text>
                <TextInput
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  placeholder="84"
                  placeholderTextColor="#666666"
                  style={styles.betterMeInput}
                />
              </View>

              <View style={styles.reachEstimateBox}>
                <Activity size={18} color={Colors.primary} />
                <Text style={styles.reachEstimateText}>
                  Portata da fermo stimata: <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>{estimateStandingReach(heightNum)} cm</Text> • Potenziale in attacco con VertiCam: <Text style={{ color: Colors.primary, fontWeight: '900' }}>{estimateStandingReach(heightNum) + Math.round(potentialJumpProjected)} cm</Text>
                </Text>
              </View>

              <TouchableOpacity
                style={styles.continuePillBtn}
                activeOpacity={0.88}
                onPress={handleFinishBiometrics}
              >
                <Text style={styles.continuePillText}>CALCOLA IL MIO PIANO PERSONALIZZATO</Text>
                <ChevronRight size={18} color="#000000" strokeWidth={3} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 6: ANALISI ALGORITMO IA (LOADER BETTERME)
           ══════════════════════════════════════════════════════ */}
        {currentStep === 6 && (
          <View style={styles.loadingContainer}>
            <Text style={styles.mainTitle}>ELABORAZIONE PIANO BIOMECCANICO</Text>
            <Text style={styles.mainSubtitle}>ATTENDI LA CALIBRAZIONE DELLA TUA CURVA DI FORZA</Text>

            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingPercentText}>{analysisProgress}%</Text>
              <Text style={styles.loadingStatusText}>
                {analysisSteps[analysisTextIndex]}
              </Text>

              <View style={styles.trackLoading}>
                <View style={[styles.fillLoading, { width: `${analysisProgress}%` }]} />
              </View>
            </View>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 7: OFFERTA & DIAGNOSI (PITCH BETTERME)
           ══════════════════════════════════════════════════════ */}
        {currentStep === 7 && (
          <View style={styles.pitchContainer}>
            <Text style={styles.mainTitle}>IL TUO PIANO DI ELEVAZIONE È PRONTO</Text>
            <Text style={styles.mainSubtitle}>PROIEZIONE BASATA SUI TUOI PARAMETRI FISICI</Text>

            <View style={styles.pitchContentCard}>
              {/* Gráfico Comparativo */}
              <View style={styles.pitchGraphRow}>
                <View style={styles.pitchGraphCol}>
                  <Text style={styles.pitchGraphNumber}>{currentJumpEstimated} cm</Text>
                  <View style={[styles.pitchGraphBar, { height: 110, backgroundColor: '#333846' }]} />
                  <Text style={styles.pitchGraphLabel}>Salto Attuale (Stima)</Text>
                </View>

                <View style={styles.pitchGraphCol}>
                  <View style={styles.gainTagFloating}>
                    <Text style={styles.gainTagFloatingText}>+8.5 cm 🔥</Text>
                  </View>
                  <Text style={[styles.pitchGraphNumber, { color: Colors.primary }]}>
                    {potentialJumpProjected} cm
                  </Text>
                  <View style={[styles.pitchGraphBar, { height: 165, backgroundColor: Colors.primary }]} />
                  <Text style={[styles.pitchGraphLabel, { color: Colors.primary, fontWeight: '800' }]}>
                    Con VertiCam
                  </Text>
                </View>
              </View>

              {/* Box de Preço Ancorado e Garantia */}
              <View style={styles.pitchPricingBox}>
                <View style={styles.pitchBestBadge}>
                  <Text style={styles.pitchBestBadgeText}>RISPARMI IL 40% • PIANO ANNUALE</Text>
                </View>
                <Text style={styles.pitchPriceBig}>349,00 € <Text style={styles.pitchPeriod}>/ anno</Text></Text>
                <Text style={styles.pitchPriceSub}>Equivalente a soli ~29 € al mese</Text>

                <View style={styles.guaranteeRow}>
                  <ShieldCheck size={20} color={Colors.accentGreen} />
                  <Text style={styles.guaranteeText}>
                    Garanzia 100% Soddisfatti o Rimborsati per 14 giorni.
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.pitchCtaBtn}
                  activeOpacity={0.88}
                  onPress={() => {
                    setSubscribed(true);
                    navigate('Dashboard');
                  }}
                >
                  <Text style={styles.pitchCtaText}>SBLOCCA IL MIO PIANO ORA</Text>
                  <Lock size={16} color="#000000" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.testCameraFirstBtn}
                  activeOpacity={0.7}
                  onPress={() => navigate('CameraIntro')}
                >
                  <Text style={styles.testCameraFirstText}>
                    Oppure prova prima il test del salto con fotocamera →
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ── FOOTER BETTERME COM DISCLAIMER & SUPPORTO ── */}
        <View style={styles.betterMeFooter}>
          <Text style={styles.legalDisclaimer}>
            Selezionando la tua opzione e continuando, accetti i nostri{' '}
            <Text style={styles.legalLink}>Termini di Servizio</Text> |{' '}
            <Text style={styles.legalLink}>Informativa sulla Privacy</Text>
          </Text>
          <Text style={styles.readBeforeNotice}>Leggi prima di continuare</Text>
        </View>
      </ScrollView>

      {/* Floating Help Button (Bottom-Right, exactly like BetterMe screenshot) */}
      <TouchableOpacity style={styles.floatingHelpBtn} activeOpacity={0.8}>
        <HelpCircle size={15} color="#000000" />
        <Text style={styles.floatingHelpText}>Aiuto</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
    minHeight: '100%' as any,
  },

  // ── HEADER ESTILO BETTERME ──
  headerBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerBackBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  betterMeLogoText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerMenuBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── SCROLL CONTENT ──
  scrollContainer: {
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  stepContainer: {
    width: '100%',
    maxWidth: 1100,
    alignItems: 'center',
  },

  // ── TÍTULOS CENTRALIZADOS ──
  mainTitle: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: 10,
  },
  mainSubtitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700',
    color: '#9E9E9E',
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 26,
  },

  // ── STEP 0: IMMAGINE DI TRASFORMAZIONE ELEVAZIONE (PRIMA vs DOPO) ──
  proofImageCard: {
    width: '100%',
    maxWidth: 380,
    aspectRatio: 1,
    backgroundColor: '#0F121B',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 22,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 8,
  },
  proofImage: {
    width: '100%',
    height: '100%',
  },

  // ── BOTÃO COMEÇAR (ESTILO BETTERME PILL) ──
  startPillButton: {
    width: '100%',
    maxWidth: 360,
    height: 60,
    backgroundColor: '#F3F4ED', // O tom creme BetterMe
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  startPillButtonText: {
    color: '#000000',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  startArrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startFootnote: {
    color: '#777777',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },

  // ── GRID DE CARDS BETTERME ──
  cardsGrid: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardsGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
  },
  cardsGridMobile: {
    flexDirection: 'column',
    gap: 16,
  },

  // ── O CARD BETTERME COM ATLETA & PÍLULA EMBAIXO ──
  betterMeCard: {
    width: '100%',
    maxWidth: 320,
    height: 340,
    backgroundColor: '#161922',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    justifyContent: 'space-between',
    paddingBottom: 10,
    paddingHorizontal: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  betterMeCardDesktop: {
    width: 245,
    height: 340,
  },
  betterMeCardSelected: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
  },
  cardImageContainer: {
    width: '100%',
    height: 255,
    borderRadius: 14,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },

  // ── PÍLULA CLARA EMBAIXO DO CARD COM SETA PRETA (IDÊNTICA À FOTO) ──
  cardBottomPill: {
    height: 54,
    backgroundColor: '#F3F4ED', // O tom exato off-white / creme do BetterMe
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  cardBottomPillSelected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  cardPillText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
    marginRight: 6,
  },
  cardArrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── STEP 6: PARAMETRI FISICI ──
  inputsWrap: {
    width: '100%',
    maxWidth: 480,
    gap: 16,
  },
  inputBox: {
    gap: 8,
  },
  inputBoxLabel: {
    color: '#9E9E9E',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  betterMeInput: {
    height: 60,
    backgroundColor: '#161922',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 20,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  reachEstimateBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  reachEstimateText: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  continuePillBtn: {
    height: 58,
    backgroundColor: '#F3F4ED',
    borderRadius: 29,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  continuePillText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  // ── STEP 7: LOADER BETTERME ──
  loadingContainer: {
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingCard: {
    width: '100%',
    backgroundColor: '#161922',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 20,
  },
  loadingPercentText: {
    fontSize: 52,
    fontWeight: '900',
    color: Colors.primary,
    marginVertical: 14,
  },
  loadingStatusText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    minHeight: 46,
  },
  trackLoading: {
    width: '100%',
    height: 10,
    backgroundColor: '#0A0C12',
    borderRadius: 5,
    overflow: 'hidden',
  },
  fillLoading: {
    height: '100%',
    backgroundColor: Colors.primary,
  },

  // ── STEP 8: PITCH BETTERME ──
  pitchContainer: {
    width: '100%',
    maxWidth: 780,
    alignItems: 'center',
  },
  pitchContentCard: {
    width: '100%',
    backgroundColor: '#161922',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pitchGraphRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 40,
    height: 200,
    marginBottom: 28,
  },
  pitchGraphCol: {
    alignItems: 'center',
    width: 100,
  },
  gainTagFloating: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  gainTagFloatingText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  pitchGraphNumber: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  pitchGraphBar: {
    width: 64,
    borderRadius: 8,
  },
  pitchGraphLabel: {
    color: '#9E9E9E',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  pitchPricingBox: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 24,
    alignItems: 'center',
  },
  pitchBestBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  pitchBestBadgeText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  pitchPriceBig: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  pitchPeriod: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9E9E9E',
  },
  pitchPriceSub: {
    color: '#9E9E9E',
    fontSize: 15,
    marginTop: 6,
    marginBottom: 18,
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    padding: 12,
    borderRadius: 14,
    marginBottom: 22,
    width: '100%',
    justifyContent: 'center',
  },
  guaranteeText: {
    color: Colors.accentGreen,
    fontSize: 14,
    fontWeight: '700',
  },
  pitchCtaBtn: {
    width: '100%',
    height: 58,
    borderRadius: 29,
    backgroundColor: '#F3F4ED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  pitchCtaText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  testCameraFirstBtn: {
    paddingVertical: 10,
  },
  testCameraFirstText: {
    color: '#9E9E9E',
    fontSize: 15,
    fontWeight: '600',
  },

  // ── FOOTER LEGAL BETTERME ──
  betterMeFooter: {
    marginTop: 48,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  legalDisclaimer: {
    color: '#888888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  legalLink: {
    color: '#BBBBBB',
    textDecorationLine: 'underline',
  },
  readBeforeNotice: {
    color: '#666666',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },

  // ── FLOATING AJUDA BUTTON (BOTÃO DIREITA INFERIOR) ──
  floatingHelpBtn: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 999,
  },
  floatingHelpText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
});
