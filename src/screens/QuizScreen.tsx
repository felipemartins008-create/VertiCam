import React, { useState, useEffect, useRef } from 'react';
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
  PanResponder,
  Platform,
  Linking,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { getStripeCheckoutUrl } from '../config/stripe';
import { StripeEmbeddedCheckoutModal } from '../components/StripeEmbeddedCheckoutModal';
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
  Zap,
  TrendingUp,
  Target,
  Clock,
  Flame,
  Check,
  Sparkles,
  Plus,
  Minus,
  Calendar,
  Cpu,
  X,
  Gift,
  Tag,
  Camera,
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

const RULER_TICK_WIDTH = 14;
const RULER_MIN_CM = 0;
const RULER_MAX_CM = 60;

export const QuizScreen: React.FC = () => {
  const { userProfile, updateProfile, navigate, setSubscribed } = useApp();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  // ═════════════════════════════════════════════════════════════════════
  // FUNNEL STEPS:
  // 0: Landing iniziale (Headline + Badge IA + Immagine Prima/Dopo + Inizia)
  // 1: Genere (Donna vs Uomo)
  // 2: Fascia d'età (Fasce segmentate per genere)
  // 3: Posizione / Ruolo (6 posizioni in griglia 3x2)
  // 4: Meta di elevazione (Quanto vuoi aumentare il salto)
  // 5: Proiezione Temporale con Grafico (In quanto tempo raggiungi l'obiettivo)
  // 6: Cosa cambierebbe se raggiungessi questo salto (Benefici personas)
  // 7: Consapevolezza Soluzione (Come funziona VertiCam IA + Fotocamera)
  // 8: Transizione verso parametri biometrici
  // 9: Quanti giorni alla settimana vuoi allenarti
  // 10: Peso corporeo (kg)
  // 11: Altezza corporea (cm)
  // 12: Caricamento e analisi IA (Loader 0-100%)
  // 13: Offerta e Diagnostica Finale (Landing Page di conversione)
  // ═════════════════════════════════════════════════════════════════════
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Form State
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [ageRange, setAgeRange] = useState<string>('under_25');
  const [selectedSport, setSelectedSport] = useState<string>('outside');
  const [targetGain, setTargetGain] = useState<string>('gain_8_12');
  const [targetGainCm, setTargetGainCm] = useState<number>(12);
  const [selectedImpacts, setSelectedImpacts] = useState<string[]>(['power_spike']);

  const toggleImpact = (id: string) => {
    setSelectedImpacts((prev) =>
      prev.includes(id)
        ? (prev.length > 1 ? prev.filter((item) => item !== id) : prev)
        : [...prev, id]
    );
  };
  const [trainingDays, setTrainingDays] = useState<string>('3-4');
  const [weight, setWeight] = useState<string>(String(userProfile.weightKg || 84));
  const [height, setHeight] = useState<string>(String(userProfile.heightCm || 192));

  const stepWeight = (delta: number) => {
    const current = parseInt(weight, 10) || 84;
    const next = Math.max(40, Math.min(160, current + delta));
    setWeight(String(next));
  };

  const stepHeight = (delta: number) => {
    const current = parseInt(height, 10) || 190;
    const next = Math.max(130, Math.min(235, current + delta));
    setHeight(String(next));
  };

  // Referência do ScrollView principal para reposicionar ao topo em cada transição de etapa
  const mainScrollRef = useRef<ScrollView>(null);

  // Régua interativa Step 4 (0-60 cm com arraste e centralização suave)
  const rulerScrollRef = React.useRef<ScrollView>(null);
  const [rulerContainerWidth, setRulerContainerWidth] = useState<number>(320);
  const targetGainCmRef = React.useRef<number>(targetGainCm);
  targetGainCmRef.current = targetGainCm;

  const panResponder = React.useMemo(() => {
    let startOffset = 0;
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 2,
      onPanResponderGrant: () => {
        startOffset = targetGainCmRef.current * RULER_TICK_WIDTH;
      },
      onPanResponderMove: (_, gestureState) => {
        const newOffset = startOffset - gestureState.dx;
        const clampedOffset = Math.max(0, Math.min(RULER_MAX_CM * RULER_TICK_WIDTH, newOffset));
        const newCm = Math.round(clampedOffset / RULER_TICK_WIDTH);
        if (newCm !== targetGainCmRef.current) {
          targetGainCmRef.current = newCm;
          setTargetGainCm(newCm);
        }
        rulerScrollRef.current?.scrollTo({ x: clampedOffset, animated: false });
      },
      onPanResponderRelease: () => {
        const finalX = targetGainCmRef.current * RULER_TICK_WIDTH;
        rulerScrollRef.current?.scrollTo({ x: finalX, animated: true });
      },
      onPanResponderTerminate: () => {
        const finalX = targetGainCmRef.current * RULER_TICK_WIDTH;
        rulerScrollRef.current?.scrollTo({ x: finalX, animated: true });
      },
    });
  }, []);

  // Sincronizza a posição da régua para o centro sempre que abrir o Step 4
  useEffect(() => {
    if (currentStep === 4) {
      const timer = setTimeout(() => {
        rulerScrollRef.current?.scrollTo({
          x: targetGainCmRef.current * RULER_TICK_WIDTH,
          animated: false,
        });
      }, 70);
      return () => clearTimeout(timer);
    }
  }, [currentStep, rulerContainerWidth]);

  // AI Loading state (Step 12)
  const [analysisProgress, setAnalysisProgress] = useState<number>(10);
  const [analysisTextIndex, setAnalysisTextIndex] = useState<number>(0);

  // Offerta Plan selection (Step 13: Mensile, Trimestrale [Più Popolare], Semestrale)
  const [selectedPlan, setSelectedPlan] = useState<'1_month' | '3_months' | '6_months'>('3_months');
  const [isCheckoutModalVisible, setIsCheckoutModalVisible] = useState<boolean>(false);

  // Countdown timer per offerta (Step 13 - 09:41 stile BetterMe)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(581);

  const analysisSteps = [
    'Creazione del tuo piano di salto personalizzato...',
    'Analisi dei parametri biometrici e rapporto peso-potenza...',
    'Calibrazione della curva di forza elastica e reattività...',
    'Calcolo del volume balistico per la protezione tendinea...',
    'Finalizzazione del programma e della stima di salto...',
  ];

  // Loader automatico per Step 12 (Progresso fluido stile BetterMe)
  useEffect(() => {
    if (currentStep === 12) {
      setAnalysisProgress(3);
      setAnalysisTextIndex(0);
      const interval = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setCurrentStep(13), 600);
            return 100;
          }
          const increment = prev < 30 ? 2 : prev < 75 ? 1 : prev < 90 ? 2 : 1;
          const next = Math.min(100, prev + increment);
          const nextIdx = Math.min(
            Math.floor((next / 100) * analysisSteps.length),
            analysisSteps.length - 1
          );
          setAnalysisTextIndex(nextIdx);
          return next;
        });
      }, 70);
      return () => clearInterval(interval);
    }
  }, [currentStep]);

  // Sempre que mudar de etapa no quiz, rola imediatamente para o topo da tela
  useEffect(() => {
    mainScrollRef.current?.scrollTo({ y: 0, animated: false });
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }, [currentStep]);

  // Timer per Step 13
  useEffect(() => {
    if (currentStep === 13) {
      const timer = setInterval(() => {
        setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentStep]);

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const countdownMins = Math.floor(secondsRemaining / 60).toString().padStart(2, '0');
  const countdownSecs = (secondsRemaining % 60).toString().padStart(2, '0');

  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 0 && currentStep !== 12) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('Welcome');
    }
  };

  const handleFinishBiometrics = async () => {
    const heightNum = parseFloat(height) || 192;
    const calculatedStandingReach = estimateStandingReach(heightNum);

    let pos: VolleyballPosition = 'outside';
    if (selectedSport === 'opposite') pos = 'opposite';
    else if (selectedSport === 'middle') pos = 'middle';
    else if (selectedSport === 'setter') pos = 'setter';
    else if (selectedSport === 'libero') pos = 'libero';
    else if (selectedSport === 'beach') pos = 'beach';
    else pos = 'outside';

    let ageNum = 24;
    if (ageRange === 'under_25') ageNum = 20;
    else if (ageRange === '25-35') ageNum = 30;
    else if (ageRange === '35-45') ageNum = 40;
    else ageNum = 49;

    await updateProfile({
      position: pos,
      age: ageNum,
      heightCm: heightNum,
      weightKg: parseFloat(weight) || 84,
      standingReachCm: calculatedStandingReach,
      gender: gender,
      goals: ['higher_jump', 'jumper_knee'],
    });

    setCurrentStep(12); // Trigger AI Analysis Loader
  };

  const handleProceedFromGain = () => {
    setTargetGain(targetGainCm <= 8 ? 'gain_5_8' : targetGainCm <= 15 ? 'gain_8_12' : 'pain_free');
    handleNextStep();
  };

  const heightNum = parseFloat(height) || 192;
  const currentJumpEstimated = 54;
  const potentialGain = targetGainCm;
  const potentialJumpProjected = currentJumpEstimated + potentialGain;
  const standingReach = estimateStandingReach(heightNum);
  const totalAttackReach = standingReach + Math.round(potentialJumpProjected);
  const netHeight = gender === 'female' ? 224 : 243;
  const clearanceOverNet = totalAttackReach - netHeight;

  // ── CALCOLO DINAMICO DEL TEMPO PER STEP 5 IN BASE AL TARGET GAIN (MAX 4 MESI A 60 CM) ──
  const getTimelineData = (gainCm: number) => {
    let weeksCount = 7;
    let weeksRange = '6–8 settimane';
    let monthsHighlight = '2 MESI';
    let daysToAdd = 49;
    let phaseBadge = 'Trasformazione Balistica';

    if (gainCm <= 0) {
      weeksCount = 3;
      weeksRange = '2–3 settimane';
      monthsHighlight = '3 SETTIMANE';
      daysToAdd = 20;
      phaseBadge = 'Consolidamento Reattività';
    } else if (gainCm <= 9) {
      weeksCount = 4;
      weeksRange = '3–4 settimane';
      monthsHighlight = '1 MESE';
      daysToAdd = 28;
      phaseBadge = 'Adattamento Neurale Rapido';
    } else if (gainCm <= 19) {
      weeksCount = 7;
      weeksRange = '6–8 settimane';
      monthsHighlight = '2 MESI';
      daysToAdd = 49;
      phaseBadge = 'Trasformazione Balistica';
    } else if (gainCm <= 29) {
      weeksCount = 10;
      weeksRange = '9–10 settimane';
      monthsHighlight = '2,5 MESI';
      daysToAdd = 68;
      phaseBadge = 'Forza Reattiva (EUR)';
    } else if (gainCm <= 39) {
      weeksCount = 12;
      weeksRange = '11–12 settimane';
      monthsHighlight = '3 MESI';
      daysToAdd = 82;
      phaseBadge = 'Forza Esplosiva & Stacco';
    } else if (gainCm <= 49) {
      weeksCount = 14;
      weeksRange = '13–14 settimane';
      monthsHighlight = '3,5 MESI';
      daysToAdd = 96;
      phaseBadge = 'Sviluppo Balistico Avanzato';
    } else {
      // 50 a 60 cm: MASSIMO 4 MESI!
      weeksCount = 16;
      weeksRange = '16 settimane';
      monthsHighlight = '4 MESI';
      daysToAdd = 118;
      phaseBadge = 'Protocollo d\'Élite (4 Mesi)';
    }

    const targetDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);
    const monthsIt = [
      'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
      'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'
    ];
    const dateFormatted = `${targetDate.getDate()} ${monthsIt[targetDate.getMonth()]} ${targetDate.getFullYear()}`;

    return {
      weeksCount,
      weeksRange,
      monthsHighlight,
      daysToAdd,
      phaseBadge,
      dateFormatted,
    };
  };

  const timelineData = getTimelineData(targetGainCm);

  const proofAthlete = gender === 'female'
    ? {
        name: 'Martina Riva',
        role: 'Schiacciatrice • 24 anni',
        beforeJump: 32,
        gain: targetGainCm > 0 ? targetGainCm : 15,
        afterJump: 32 + (targetGainCm > 0 ? targetGainCm : 15),
        image: require('../../assets/proof-jump-female.png'),
        quote: `Ho aggiunto esattamente +${targetGainCm > 0 ? targetGainCm : 15} cm al mio stacco in ${timelineData.weeksCount} settimane. Ora supero il muro avversario con totale sicurezza!`,
      }
    : {
        name: 'Marco Ferri',
        role: 'Schiacciatore • 26 anni',
        beforeJump: 31,
        gain: targetGainCm > 0 ? targetGainCm : 15,
        afterJump: 31 + (targetGainCm > 0 ? targetGainCm : 15),
        image: require('../../assets/proof-jump-male.png'),
        quote: `Con VertiCam ho aggiunto esattamente +${targetGainCm > 0 ? targetGainCm : 15} cm al mio salto in ${timelineData.weeksCount} settimane. Lo stacco in rincorsa è decollato!`,
      };

  // Data obiettivo calcolata dinamicamente
  const projectedTargetDate = timelineData.dateFormatted;

  // 5 Telefoni Mockup Showcase (Cosa include il tuo piano - Stile VertiCam)
  const showcaseFeatures = [
    {
      image: require('../../assets/feature-phone-1.png'),
      title: 'Tracciamento Ottico IA & Impulso',
      subtitle: 'Visione Artificiale',
      isHighlight: false,
    },
    {
      image: require('../../assets/feature-phone-2.png'),
      title: 'Risposta Neurale in Tempo Reale',
      subtitle: 'Tecnologia Neurale',
      isHighlight: true,
    },
    {
      image: require('../../assets/feature-phone-3.png'),
      title: 'Ottimizzazione e Allenamento',
      subtitle: 'Pliometria e Forza',
      isHighlight: false,
    },
    {
      image: require('../../assets/feature-phone-4.png'),
      title: 'Video Guidati & Feedback Istantaneo',
      subtitle: 'Interattivo',
      isHighlight: false,
    },
    {
      image: require('../../assets/feature-phone-5.png'),
      title: 'Recupero & Salute Tendinea',
      subtitle: 'Prevenzione Infortuni',
      isHighlight: false,
    },
  ];

  const handleCheckout = () => {
    setIsCheckoutModalVisible(true);
  };

  const handleSelectPlanAndCheckout = (plan: '1_month' | '3_months' | '6_months') => {
    setSelectedPlan(plan);
    setIsCheckoutModalVisible(true);
  };

  const femaleAgeCards: BetterMeCardOption[] = [
    {
      id: 'under_25',
      pillTitle: 'Età: <25',
      imageSource: require('../../assets/age-18-29.webp'),
    },
    {
      id: '25-35',
      pillTitle: 'Età: 25–35',
      imageSource: require('../../assets/age-30-39.webp'),
    },
    {
      id: '35-45',
      pillTitle: 'Età: 35–45',
      imageSource: require('../../assets/age-40-49.webp'),
    },
    {
      id: '45+',
      pillTitle: 'Età: 45+',
      imageSource: require('../../assets/age-50plus.webp'),
    },
  ];

  const maleAgeCards: BetterMeCardOption[] = [
    {
      id: 'under_25',
      pillTitle: 'Età: <25',
      imageSource: require('../../assets/male-18-29.webp'),
    },
    {
      id: '25-35',
      pillTitle: 'Età: 25–35',
      imageSource: require('../../assets/male-30-39.webp'),
    },
    {
      id: '35-45',
      pillTitle: 'Età: 35–45',
      imageSource: require('../../assets/male-40-49.webp'),
    },
    {
      id: '45+',
      pillTitle: 'Età: 45+',
      imageSource: require('../../assets/male-50plus.webp'),
    },
  ];

  // ── RENDERER DE CARDS NO ESTILO BETTERME ──
  const renderBetterMeCards = (
    options: BetterMeCardOption[],
    selectedId: string,
    onSelect: (id: string) => void
  ) => {
    const isSix = options.length >= 6;
    const isFive = options.length === 5;

    return (
      <View
        style={[
          styles.cardsGrid,
          isDesktop
            ? (isSix ? styles.cardsGrid6Desktop : isFive ? styles.cardsGrid5Desktop : styles.cardsGridDesktop)
            : (isSix ? styles.cardsGrid6Mobile : styles.cardsGridMobile),
        ]}
      >
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;
          const isLongWord = opt.pillTitle.length >= 12;

          return (
            <TouchableOpacity
              key={opt.id}
              activeOpacity={0.88}
              style={[
                styles.betterMeCard,
                isDesktop
                  ? (isSix ? styles.betterMeCard6Desktop : isFive ? styles.betterMeCard5Desktop : styles.betterMeCardDesktop)
                  : (isSix ? styles.betterMeCard6Mobile : styles.betterMeCardMobile),
                isSelected && styles.betterMeCardSelected,
              ]}
              onPress={() => onSelect(opt.id)}
            >
              {/* Imagem do Atleta com corte suave */}
              <View
                style={[
                  styles.cardImageContainer,
                  isDesktop
                    ? (isSix ? styles.cardImageContainer6Desktop : isFive ? styles.cardImageContainer5 : undefined)
                    : (isSix ? styles.cardImageContainer6Mobile : styles.cardImageContainerMobile),
                ]}
              >
                <Image
                  source={opt.imageSource || { uri: opt.imageUri }}
                  style={styles.cardImage}
                  resizeMode="cover"
                  fadeDuration={0}
                />
              </View>

              {/* Botão em formato de Pílula Clara com seta preta */}
              <View
                style={[
                  styles.cardBottomPill,
                  isDesktop
                    ? (isSix ? styles.cardBottomPill6Desktop : isFive ? styles.cardBottomPill5 : undefined)
                    : (isSix ? styles.cardBottomPill6Mobile : styles.cardBottomPillMobile),
                  isSelected && styles.cardBottomPillSelected,
                ]}
              >
                <Text
                  style={[
                    styles.cardPillText,
                    isDesktop && isFive && styles.cardPillText5,
                    isDesktop && isSix && styles.cardPillText6Desktop,
                    !isDesktop && !isSix && styles.cardPillTextMobile,
                    !isDesktop && isSix && (isLongWord ? styles.cardPillText6MobileLong : styles.cardPillText6Mobile),
                  ]}
                  numberOfLines={1}
                >
                  {opt.pillTitle}
                </Text>
                <View
                  style={[
                    styles.cardArrowCircle,
                    isDesktop && isFive && styles.cardArrowCircle5,
                    isDesktop && isSix && styles.cardArrowCircle6Desktop,
                    !isDesktop && !isSix && styles.cardArrowCircleMobile,
                    !isDesktop && isSix && styles.cardArrowCircle6Mobile,
                  ]}
                >
                  <ChevronRight
                    size={isDesktop ? (isSix ? 13 : isFive ? 12 : 14) : (isSix ? 9 : 12)}
                    color="#FFFFFF"
                    strokeWidth={isDesktop ? 3 : (isSix ? 2.5 : 3)}
                  />
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
      {/* ── TOP HEADER & BARRA DE PROGRESSO (ESTILO BETTERME) ── */}
      <View style={styles.headerContainer}>
        <View
          style={[
            styles.headerBar,
            currentStep === 12 && { justifyContent: 'center' },
            currentStep === 13 && styles.headerBarOffer,
          ]}
        >
          <View style={[styles.headerLeft, currentStep === 12 && { justifyContent: 'center', gap: 0 }]}>
            {currentStep > 0 && currentStep !== 12 && currentStep !== 13 && (
              <TouchableOpacity onPress={handleBack} style={styles.headerBackBtn} activeOpacity={0.7}>
                <ArrowLeft size={18} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            <Text style={styles.betterMeLogoText}>
              Verti<Text style={{ color: Colors.primary }}>Cam</Text>
            </Text>
          </View>

          {/* Nome da categoria no centro (Estilo BetterMe Steps 1 a 11) */}
          {currentStep > 0 && currentStep < 12 && (
            <Text style={styles.headerCategoryText}>
              {currentStep <= 3
                ? 'Profilo & Ruolo'
                : currentStep <= 6
                ? 'Obiettivo di Salto'
                : currentStep <= 8
                ? 'Metodo & Analisi IA'
                : 'Parametri Biometrici'}
            </Text>
          )}

          {/* Timer di Urgenza Header (Step 13 - Offerta BetterMe) */}
          {currentStep === 13 && (
            <View style={styles.headerOfferTimerBox}>
              <Text style={styles.headerOfferTimerLabel}>
                {isDesktop ? 'Lo sconto è riservato per:' : 'Sconto riservato:'}
              </Text>
              <View style={styles.betterMeTimerWidget}>
                <View style={styles.timerDigitUnitCol}>
                  <Text style={styles.betterMeTimerDigits}>{countdownMins}</Text>
                  <Text style={styles.betterMeTimerUnitText}>minuti</Text>
                </View>

                <Text style={styles.betterMeTimerColon}>:</Text>

                <View style={styles.timerDigitUnitCol}>
                  <Text style={styles.betterMeTimerDigits}>{countdownSecs}</Text>
                  <Text style={styles.betterMeTimerUnitText}>secondi</Text>
                </View>
              </View>
            </View>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {currentStep === 13 && (
              <TouchableOpacity
                style={styles.headerOfferCtaBtn}
                activeOpacity={0.85}
                onPress={handleCheckout}
              >
                <Text style={styles.headerOfferCtaText}>OTTIENI IL MIO PIANO</Text>
              </TouchableOpacity>
            )}

            {currentStep !== 12 && (
              <TouchableOpacity style={styles.headerMenuBtn} activeOpacity={0.7}>
                <Menu size={16} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── BARRA DE PROGRESSO SEGMENTADA EM 4 ETAPAS (ESTILO BETTERME) ── */}
        {currentStep > 0 && currentStep < 12 && (
          <View style={styles.segmentedProgressBarContainer}>
            {/* Segmento 1: Profilo & Ruolo (Steps 1-3) */}
            <View style={styles.segmentTrack}>
              <View
                style={[
                  styles.segmentFill,
                  {
                    width:
                      currentStep >= 3
                        ? '100%'
                        : currentStep === 2
                        ? '66%'
                        : currentStep === 1
                        ? '33%'
                        : '0%',
                  },
                ]}
              />
            </View>

            {/* Segmento 2: Obiettivo di Salto (Steps 4-6) */}
            <View style={styles.segmentTrack}>
              <View
                style={[
                  styles.segmentFill,
                  {
                    width:
                      currentStep >= 6
                        ? '100%'
                        : currentStep === 5
                        ? '66%'
                        : currentStep === 4
                        ? '33%'
                        : '0%',
                  },
                ]}
              />
            </View>

            {/* Segmento 3: Metodo & IA (Steps 7-8) */}
            <View style={styles.segmentTrack}>
              <View
                style={[
                  styles.segmentFill,
                  {
                    width:
                      currentStep >= 8
                        ? '100%'
                        : currentStep === 7
                        ? '50%'
                        : '0%',
                  },
                ]}
              />
            </View>

            {/* Segmento 4: Parametri Biometrici (Steps 9-11) */}
            <View style={styles.segmentTrack}>
              <View
                style={[
                  styles.segmentFill,
                  {
                    width:
                      currentStep >= 11
                        ? '100%'
                        : currentStep === 10
                        ? '66%'
                        : currentStep === 9
                        ? '33%'
                        : '0%',
                  },
                ]}
              />
            </View>
          </View>
        )}
      </View>

      <ScrollView
        ref={mainScrollRef}
        contentContainerStyle={[
          styles.scrollContainer,
          (currentStep === 6 || currentStep === 7) && { paddingBottom: 130 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ══════════════════════════════════════════════════════
            STEP 0: HEADLINE + BADGE IA + PROVA SOCIAL + BOTÃO INIZIA
           ══════════════════════════════════════════════════════ */}
        {currentStep === 0 && (
          <View style={styles.stepContainer}>
            <View style={styles.aiBadge}>
              <Zap size={13} color={Colors.primary} fill={Colors.primary} />
              <Text style={styles.aiBadgeText}>POTENZIATO DA TECNOLOGIA & IA</Text>
            </View>

            <Text style={styles.mainTitle}>PIANO DI ALLENAMENTO ELEVAZIONE & SALTO</Text>
            <Text style={styles.mainSubtitle}>
              RISPONDI AL TEST PER INIZIARE IL TUO ALLENAMENTO PERSONALIZZATO
            </Text>

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
              ⏱ Richiede solo 2 minuti • Basato su biomeccanica applicata
            </Text>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 1: GENERE (DONNA O UOMO)
           ══════════════════════════════════════════════════════ */}
        {currentStep === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.mainTitle}>SCEGLI IL TUO GENERE</Text>
            <Text style={styles.mainSubtitle}>PER CHI È QUESTO PIANO DI ALLENAMENTO?</Text>

            {renderBetterMeCards(
              [
                {
                  id: 'female',
                  pillTitle: 'Donna',
                  imageSource: require('../../assets/age-18-29.webp'),
                },
                {
                  id: 'male',
                  pillTitle: 'Uomo',
                  imageSource: require('../../assets/male-18-29.webp'),
                },
              ],
              gender,
              (id) => {
                setGender(id as 'female' | 'male');
                setTimeout(() => handleNextStep(), 200);
              }
            )}
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 2: FAIXA ETÁRIA (DIRECIONADA POR GÊNERO)
           ══════════════════════════════════════════════════════ */}
        {currentStep === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.mainTitle}>QUAL È LA TUA ETÀ?</Text>
            <Text style={styles.mainSubtitle}>PER CALIBRARE IL VOLUME E IL RECUPERO ARTICOLARE</Text>

            {renderBetterMeCards(
              gender === 'male' ? maleAgeCards : femaleAgeCards,
              ageRange,
              (id) => {
                setAgeRange(id);
                setTimeout(() => handleNextStep(), 200);
              }
            )}
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 3: IL TUO RUOLO (PALLAVOLO / BEACH VOLLEY)
           ══════════════════════════════════════════════════════ */}
        {currentStep === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.mainTitle}>IL TUO RUOLO</Text>
            <Text style={styles.mainSubtitle}>IN CHE RUOLO GIOCHI?</Text>

            {renderBetterMeCards(
              [
                {
                  id: 'middle',
                  pillTitle: 'Centrale',
                  imageSource: require('../../assets/pos-centrale.webp'),
                },
                {
                  id: 'opposite',
                  pillTitle: 'Opposto',
                  imageSource: require('../../assets/pos-opposto.webp'),
                },
                {
                  id: 'outside',
                  pillTitle: 'Schiacciatore',
                  imageSource: require('../../assets/pos-schiacciatore.webp'),
                },
                {
                  id: 'setter',
                  pillTitle: 'Palleggiatore',
                  imageSource: require('../../assets/pos-palleggiatore.webp'),
                },
                {
                  id: 'libero',
                  pillTitle: 'Libero',
                  imageSource: require('../../assets/pos-libero.webp'),
                },
                {
                  id: 'beach',
                  pillTitle: 'Beach Volley',
                  imageSource: require('../../assets/pos-beach.webp'),
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
            STEP 4: OBIETTIVO DI ELEVAZIONE (REGUA 0-60 CM + ATLETA VIVO)
           ══════════════════════════════════════════════════════ */}
        {currentStep === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.mainTitle}>OBIETTIVO DI ELEVAZIONE</Text>
            <Text style={styles.mainSubtitle}>QUANTO VUOI AUMENTARE IL TUO SALTO?</Text>

            <View style={[styles.rulerScreenLayout, isDesktop && styles.rulerScreenLayoutDesktop]}>
              {/* ── PAINEL DA REGUA E CONTROLE (ESQUERDA NO DESKTOP) ── */}
              <View style={[styles.rulerControlsCard, isDesktop && styles.rulerControlsCardDesktop]}>
                <Text style={styles.rulerCardSubtitle}>IL TUO OBIETTIVO DI AUMENTO</Text>

                {/* Hero Number com botões de ajuste fino (-) e (+) */}
                <View style={styles.rulerHeroNumberRow}>
                  <TouchableOpacity
                    style={styles.rulerStepBtn}
                    activeOpacity={0.7}
                    onPress={() => {
                      const next = Math.max(RULER_MIN_CM, targetGainCm - 1);
                      setTargetGainCm(next);
                      targetGainCmRef.current = next;
                      rulerScrollRef.current?.scrollTo({ x: next * RULER_TICK_WIDTH, animated: true });
                    }}
                  >
                    <Minus size={20} color="#FFFFFF" />
                  </TouchableOpacity>

                  <View style={styles.rulerHeroValueBox}>
                    <Text style={styles.rulerHeroPlus}>+</Text>
                    <Text style={styles.rulerHeroDigits}>{targetGainCm}</Text>
                    <Text style={styles.rulerHeroUnit}>cm</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.rulerStepBtn}
                    activeOpacity={0.7}
                    onPress={() => {
                      const next = Math.min(RULER_MAX_CM, targetGainCm + 1);
                      setTargetGainCm(next);
                      targetGainCmRef.current = next;
                      rulerScrollRef.current?.scrollTo({ x: next * RULER_TICK_WIDTH, animated: true });
                    }}
                  >
                    <Plus size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                {/* Dica de Nível do Salto */}
                <View style={styles.rulerLevelBadge}>
                  <Flame size={14} color={Colors.primary} />
                  <Text style={styles.rulerLevelText}>
                    {targetGainCm === 0
                      ? 'Livello Attuale di Base'
                      : targetGainCm <= 8
                      ? 'Adattamento Base Rapido'
                      : targetGainCm <= 15
                      ? 'Trasformazione Balistica (Consigliato)'
                      : targetGainCm <= 25
                      ? 'Livello Competitivo / Serie A'
                      : 'Record di Elevazione Mondiale'}
                  </Text>
                </View>

                {/* Régua Interativa Arrastável (0 a 60 cm) */}
                {(() => {
                  const spacerWidth = Math.max(0, Math.round(rulerContainerWidth / 2 - RULER_TICK_WIDTH / 2));
                  return (
                    <View
                      style={[styles.rulerBoxContainer, { cursor: 'ew-resize' as any }]}
                      onLayout={(e) => {
                        const w = e.nativeEvent.layout.width;
                        if (w > 0 && Math.abs(w - rulerContainerWidth) > 2) {
                          setRulerContainerWidth(w);
                        }
                      }}
                      {...panResponder.panHandlers}
                    >
                      <View style={styles.rulerPointerMarker} pointerEvents="none" />
                      <ScrollView
                        ref={rulerScrollRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        scrollEventThrottle={16}
                        snapToInterval={RULER_TICK_WIDTH}
                        decelerationRate="fast"
                        contentContainerStyle={styles.rulerScrollContent}
                        onScroll={(e) => {
                          const offsetX = e.nativeEvent.contentOffset.x;
                          const cm = Math.round(offsetX / RULER_TICK_WIDTH);
                          const clampedCm = Math.max(RULER_MIN_CM, Math.min(RULER_MAX_CM, cm));
                          if (clampedCm !== targetGainCmRef.current) {
                            targetGainCmRef.current = clampedCm;
                            setTargetGainCm(clampedCm);
                          }
                        }}
                        onMomentumScrollEnd={(e) => {
                          const offsetX = e.nativeEvent.contentOffset.x;
                          const cm = Math.round(offsetX / RULER_TICK_WIDTH);
                          const clampedCm = Math.max(RULER_MIN_CM, Math.min(RULER_MAX_CM, cm));
                          targetGainCmRef.current = clampedCm;
                          setTargetGainCm(clampedCm);
                          rulerScrollRef.current?.scrollTo({ x: clampedCm * RULER_TICK_WIDTH, animated: true });
                        }}
                      >
                        <View style={{ width: spacerWidth }} />
                        {Array.from({ length: 61 }, (_, i) => i).map((cm) => {
                          const isMajor = cm % 5 === 0;
                          const isSelected = cm === targetGainCm;
                          return (
                            <TouchableOpacity
                              key={cm}
                              activeOpacity={0.7}
                              onPress={() => {
                                setTargetGainCm(cm);
                                targetGainCmRef.current = cm;
                                rulerScrollRef.current?.scrollTo({ x: cm * RULER_TICK_WIDTH, animated: true });
                              }}
                              style={styles.rulerTickCol}
                            >
                              <View
                                style={[
                                  styles.rulerTickLine,
                                  isMajor ? styles.rulerTickMajor : styles.rulerTickMinor,
                                  isSelected && styles.rulerTickActive,
                                ]}
                              />
                              {isMajor && (
                                <Text style={[styles.rulerTickText, isSelected && styles.rulerTickTextActive]}>
                                  {cm}
                                </Text>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                        <View style={{ width: spacerWidth }} />
                      </ScrollView>
                    </View>
                  );
                })()}
              </View>

              {/* ── PALCO DO ATLETA DE VÔLEI COM CHÃO & SALTO DINÂMICO (DIREITA NO DESKTOP) ── */}
              <View style={[styles.athleteStageCard, isDesktop && styles.athleteStageCardDesktop]}>
                {/* Linhas de fundo do ginásio / rede */}
                <View style={styles.stageCourtBackground}>
                  <View style={styles.stageVolleyNetLine} />
                  <View style={styles.stageVolleyAntenna} />
                </View>

                {/* Atleta de Vôlei Dinâmico (Mãos na cintura, pernas estendidas) */}
                <View
                  style={[
                    styles.athleteFigureWrapper,
                    {
                      bottom: 42 + Math.round((targetGainCm / 60) * (isDesktop ? 130 : 95)),
                    },
                  ]}
                >
                  <Image
                    source={require('../../assets/athlete-jump-transparent.png')}
                    style={styles.athleteFigureImage}
                    resizeMode="contain"
                  />
                </View>

                {/* Linha Neon no Nível dos Pés do Atleta */}
                <View
                  style={[
                    styles.feetElevationMarker,
                    {
                      bottom: 42 + Math.round((targetGainCm / 60) * (isDesktop ? 130 : 95)) - 10,
                    },
                  ]}
                >
                  <View style={styles.feetElevationLine} />
                  <View style={styles.feetElevationBadge}>
                    <Text style={styles.feetElevationBadgeText}>
                      {targetGainCm > 0 ? `+${targetGainCm} cm` : '0 cm'}
                    </Text>
                  </View>
                </View>

                {/* Seta Vertical de Medição (Do Chão aos Pés) */}
                <View
                  style={[
                    styles.measurementArrowTrack,
                    {
                      bottom: 42,
                      height: Math.max(0, Math.round((targetGainCm / 60) * (isDesktop ? 130 : 95))),
                      opacity: targetGainCm > 0 ? 1 : 0,
                    },
                  ]}
                >
                  <View style={styles.arrowTopHead} />
                  <View style={styles.arrowShaft} />
                  <View style={styles.arrowBottomHead} />
                </View>

                {/* O Chão (Linha Vermelha de Base + Piso de Quadra de Vôlei) */}
                <View style={styles.groundBaseContainer}>
                  <View style={styles.groundRedLine} />
                  <View style={styles.groundFloorBar}>
                    <Text style={styles.groundFloorText}>0 cm • LIVELLO DEL SUOLO</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Botão de Avanço (Estilo BetterMe Prossimo Passo) */}
            <TouchableOpacity
              style={styles.continuePillBtn}
              activeOpacity={0.88}
              onPress={handleProceedFromGain}
            >
              <Text style={styles.continuePillText}>PROSSIMO PASSO</Text>
              <View style={styles.startArrowCircle}>
                <ChevronRight size={18} color="#FFFFFF" strokeWidth={3} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 5 (4/1): TEMPO STIMATO & CASO STUDIO (LAYOUT CLEAN)
           ══════════════════════════════════════════════════════ */}
        {currentStep === 5 && (
          <View style={styles.stepContainer}>
            <View style={[styles.projectionScreenLayout, isDesktop && styles.projectionScreenLayoutDesktop]}>
              {/* ── COLONNA SINISTRA: OBIETTIVO E TEMPO STIMATO IN PRIMO PIANO ── */}
              <View style={[styles.projectionTextCol, isDesktop && styles.projectionTextColDesktop]}>
                <Text style={styles.cleanHeaderGoalLabel}>IL TUO OBIETTIVO</Text>

                <Text style={styles.cleanHeroTitle}>
                  Raggiungi{' '}
                  <Text style={{ color: Colors.primary }}>
                    +{targetGainCm > 0 ? targetGainCm : 12} cm
                  </Text>
                </Text>

                {/* Bloco de Destaque Máximo: O TEMPO */}
                <View style={styles.heroTimeCard}>
                  <Text style={styles.heroTimeCardLabel}>TEMPO STIMATO PER RAGGIUNGERLO</Text>

                  <View style={styles.heroTimeDigitsRow}>
                    <Clock size={36} color={Colors.primary} />
                    <Text style={styles.heroTimeDigitsText}>{timelineData.monthsHighlight}</Text>
                  </View>

                  <Text style={styles.heroTimeWeeksSub}>({timelineData.weeksRange})</Text>

                  <View style={styles.heroTimeDivider} />

                  <View style={styles.heroTimeDateRow}>
                    <Calendar size={16} color="#FF9100" />
                    <Text style={styles.heroTimeDateText}>
                      Data prevista:{' '}
                      <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>
                        {timelineData.dateFormatted}
                      </Text>
                    </Text>
                  </View>
                </View>

                <Text style={styles.cleanFooterInsight}>
                  ⚡ Progressione biomeccanica calibrata per la tua frequenza di allenamento.
                </Text>
              </View>

              {/* ── COLONNA DESTRA: PROVA SOCIALE CLEAN (APENAS FOTO E DADOS DE EVOLUÇÃO) ── */}
              <View style={[styles.proofCardWrapper, isDesktop && styles.proofCardWrapperDesktop]}>
                {/* Header Atleta com Resultado */}
                <View style={styles.cleanProofHeader}>
                  <View style={styles.proofAthleteInfo}>
                    <View style={styles.proofAvatarCircle}>
                      <Award size={18} color={Colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.proofAthleteName}>{proofAthlete.name}</Text>
                      <Text style={styles.proofAthleteRole}>{proofAthlete.role}</Text>
                    </View>
                  </View>

                  <View style={styles.proofResultBadge}>
                    <Text style={styles.proofResultBadgeText}>
                      +{proofAthlete.gain} CM
                    </Text>
                    <Text style={styles.proofResultBadgeSub}>in {timelineData.weeksCount} sett.</Text>
                  </View>
                </View>

                {/* Immagine Prima e Dopo com Badges de Evolução */}
                <View style={styles.cleanProofImageWrapper}>
                  <Image
                    source={proofAthlete.image}
                    style={styles.proofCardImage}
                    resizeMode="cover"
                  />
                  <View style={styles.proofOverlayBadgeLeft}>
                    <Text style={styles.proofOverlayText}>PRIMA: {proofAthlete.beforeJump} cm</Text>
                  </View>
                  <View style={styles.proofOverlayBadgeRight}>
                    <Text style={styles.proofOverlayTextGreen}>
                      DOPO: {proofAthlete.afterJump} cm (+{proofAthlete.gain}cm)
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.continuePillBtn}
              activeOpacity={0.88}
              onPress={handleNextStep}
            >
              <Text style={styles.continuePillText}>CONTINUA</Text>
              <View style={styles.startArrowCircle}>
                <ChevronRight size={18} color="#FFFFFF" strokeWidth={3} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 6 (5): BENEFICI PERSONAS (COSA CAMBIEREBBE)
           ══════════════════════════════════════════════════════ */}
        {currentStep === 6 && (
          <View style={styles.stepContainer}>
            <Text style={styles.mainTitle}>IL TUO VANTAGGIO IN CAMPO</Text>
            <Text style={styles.mainSubtitle}>
              COSA CAMBIEREBBE DI PIÙ SE RAGGIUNGESSI QUESTA ELEVAZIONE?
            </Text>
            <Text style={styles.multiSelectInstruction}>
              Seleziona tutte le opzioni che desideri
            </Text>

            <View style={styles.optionsListWrap}>
              {[
                {
                  id: 'power_spike',
                  title: 'Attaccare con molta più potenza a rete',
                  desc: 'Colpire la palla nel punto più alto e scaricare tutta la forza del braccio senza subire muri.',
                  tag: 'ATTACCO & POTENZA',
                },
                {
                  id: 'dominant_block',
                  title: 'Dominare a rete con un muro invalicabile',
                  desc: 'Invadere lo spazio sopra il nastro, chiudere ogni traiettoria e stampare muri punto decisivi.',
                  tag: 'DOMINIO A MURO',
                },
                {
                  id: 'competitive_team',
                  title: 'Entrare in una squadra per giocare i campionati',
                  desc: 'Superare i provini, conquistare un posto fisso da titolare e competere ad alto livello agonistico.',
                  tag: 'LIVELLO AGONISTICO',
                },
                {
                  id: 'team_standout',
                  title: 'Distinguermi ed essere il giocatore decisivo della squadra',
                  desc: 'Fare la differenza nei momenti caldi del match ed essere il punto di riferimento assoluto in campo.',
                  tag: 'LEADERSHIP & TALENTO',
                },
              ].map((opt) => {
                const isSelected = selectedImpacts.includes(opt.id);
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.personaChoiceCard,
                      isSelected && styles.personaChoiceCardSelected,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => toggleImpact(opt.id)}
                  >
                    <View style={styles.personaCardHeader}>
                      <View
                        style={[
                          styles.personaTag,
                          isSelected && styles.personaTagSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.personaTagText,
                            isSelected && styles.personaTagTextSelected,
                          ]}
                        >
                          {opt.tag}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.personaCheckbox,
                          isSelected && styles.personaCheckboxActive,
                        ]}
                      >
                        {isSelected && (
                          <Check size={14} color="#FFFFFF" strokeWidth={3} />
                        )}
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.personaCardTitle,
                        isSelected && styles.personaCardTitleSelected,
                      ]}
                    >
                      {opt.title}
                    </Text>
                    <Text
                      style={[
                        styles.personaCardDesc,
                        isSelected && styles.personaCardDescSelected,
                      ]}
                    >
                      {opt.desc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 7: CONSAPEVOLEZZA SOLUZIONE (TECNOLOGIA & SCIENZA)
           ══════════════════════════════════════════════════════ */}
        {currentStep === 7 && (
          <View style={styles.solutionScreenContainer}>
            <View style={[styles.solutionSplitLayout, isDesktop && styles.solutionSplitLayoutRow]}>
              {/* ── COLONNA SINISTRA: COPY & AUTORITÀ (STILE BETTERME) ── */}
              <View style={[styles.solutionLeftCol, isDesktop && styles.solutionLeftColDesktop]}>
                <View style={styles.solutionAiBadge}>
                  <Sparkles size={13} color={Colors.primary} />
                  <Text style={styles.solutionAiBadgeText}>TECNOLOGIA DI LIVELLO OLIMPICO</Text>
                </View>

                <Text style={styles.solutionHeadline}>
                  La stessa tecnologia delle squadre di Serie A, guidata da oltre 300 studi scientifici.
                </Text>

                <View style={styles.solutionPointsList}>
                  {/* Punto 1: Attrezzature d'Élite */}
                  <View style={styles.solutionPointCard}>
                    <View style={styles.solutionPointIconBox}>
                      <Cpu size={18} color={Colors.primary} />
                    </View>
                    <View style={styles.solutionPointContent}>
                      <Text style={styles.solutionPointTitle}>
                        Tecnologia da oltre €10.000 nel tuo smartphone
                      </Text>
                      <Text style={styles.solutionPointDesc}>
                        I club professionistici investono cifre enormi in pedane di forza e fotocellule per monitorare l'esplosività. <Text style={styles.boldWhite}>VertiCam replica questa precisione millimetrica</Text> tramite la visione artificiale della fotocamera.
                      </Text>
                    </View>
                  </View>

                  {/* Punto 2: Oltre 300 Studi di Biomeccanica */}
                  <View style={styles.solutionPointCard}>
                    <View style={styles.solutionPointIconBox}>
                      <Award size={18} color={Colors.primary} />
                    </View>
                    <View style={styles.solutionPointContent}>
                      <Text style={styles.solutionPointTitle}>
                        Controllo scientifico di carico & volume
                      </Text>
                      <Text style={styles.solutionPointDesc}>
                        Addestrata su <Text style={styles.boldWhite}>oltre 300 studi clinici di biomeccanica</Text>, l'IA calcola la dose minima efficace per ogni allenamento: massimo stimolo per saltare più in alto, <Text style={styles.boldWhite}>con zero rischio di tendinite rotulea</Text>.
                      </Text>
                    </View>
                  </View>

                  {/* Punto 3: Perché supera un Personal Trainer */}
                  <View style={styles.solutionPointCard}>
                    <View style={styles.solutionPointIconBox}>
                      <ShieldCheck size={18} color={Colors.accentGreen} />
                    </View>
                    <View style={styles.solutionPointContent}>
                      <Text style={styles.solutionPointTitle}>
                        Molto più preciso di un allenatore convenzionale
                      </Text>
                      <Text style={styles.solutionPointDesc}>
                        Un personal trainer va 'a occhio' e applica schede generiche fisse. <Text style={styles.boldWhite}>VertiCam misura la reattività reale del tuo sistema nervoso ogni giorno</Text>, ricalibrando volume e carichi in tempo reale per garantirti progressi continui.
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* ── COLONNA DESTRA: CARD TECNOLOGICA & COMPARATIVA ── */}
              <View style={[styles.solutionRightCol, isDesktop && styles.solutionRightColDesktop]}>
                <View style={styles.techDashboardCard}>
                  {/* Top Bar do Card Tecnológico */}
                  <View style={styles.techCardHeader}>
                    <View style={styles.techStatusIndicator}>
                      <View style={styles.greenPulseDot} />
                      <Text style={styles.techStatusText}>SISTEMA BIOMECCANICO ATTIVO</Text>
                    </View>
                    <View style={styles.techAccuracyBadge}>
                      <Text style={styles.techAccuracyText}>98.4% PRECISIONE LAB</Text>
                    </View>
                  </View>

                  {/* Mini Painel de Métricas da IA */}
                  <View style={styles.techMetricsRow}>
                    <View style={styles.techMetricBox}>
                      <Text style={styles.techMetricVal}>300+</Text>
                      <Text style={styles.techMetricLbl}>Studi Clinici</Text>
                    </View>
                    <View style={styles.techMetricDivider} />
                    <View style={styles.techMetricBox}>
                      <Text style={[styles.techMetricVal, { color: Colors.primary }]}>0.01 mm</Text>
                      <Text style={styles.techMetricLbl}>Tracciamento IA</Text>
                    </View>
                    <View style={styles.techMetricDivider} />
                    <View style={styles.techMetricBox}>
                      <Text style={[styles.techMetricVal, { color: Colors.accentGreen }]}>100%</Text>
                      <Text style={styles.techMetricLbl}>Protezione Tendine</Text>
                    </View>
                  </View>

                  {/* Comparativo Visual: Coach Tradizionale vs VertiCam IA */}
                  <View style={styles.compareSection}>
                    <Text style={styles.compareSectionTitle}>CONFRONTO SCIENTIFICO DIRETTO</Text>

                    <View style={styles.compareTable}>
                      {/* Linha 1: Metodo di Misura */}
                      <View style={styles.compareTableRow}>
                        <Text style={styles.compareFeatureName}>Misurazione Stacco</Text>
                        <View style={styles.compareColsWrap}>
                          <View style={styles.compareColOld}>
                            <X size={12} color="#FF5252" />
                            <Text style={styles.compareColOldText}>A occhio / stima</Text>
                          </View>
                          <View style={styles.compareColNew}>
                            <Check size={12} color={Colors.accentGreen} strokeWidth={3} />
                            <Text style={styles.compareColNewText}>Fotocamera IA al mm</Text>
                          </View>
                        </View>
                      </View>

                      {/* Linha 2: Controllo del Carico */}
                      <View style={styles.compareTableRow}>
                        <Text style={styles.compareFeatureName}>Controllo del Carico</Text>
                        <View style={styles.compareColsWrap}>
                          <View style={styles.compareColOld}>
                            <X size={12} color="#FF5252" />
                            <Text style={styles.compareColOldText}>Schede fisse preimpostate</Text>
                          </View>
                          <View style={styles.compareColNew}>
                            <Check size={12} color={Colors.accentGreen} strokeWidth={3} />
                            <Text style={styles.compareColNewText}>Ricalcolo sul SNC continuo</Text>
                          </View>
                        </View>
                      </View>

                      {/* Linha 3: Rischio Tendinite */}
                      <View style={styles.compareTableRow}>
                        <Text style={styles.compareFeatureName}>Rischio Tendinite</Text>
                        <View style={styles.compareColsWrap}>
                          <View style={styles.compareColOld}>
                            <X size={12} color="#FF5252" />
                            <Text style={styles.compareColOldText}>Elevato per sovraccarico</Text>
                          </View>
                          <View style={styles.compareColNew}>
                            <Check size={12} color={Colors.accentGreen} strokeWidth={3} />
                            <Text style={styles.compareColNewText}>Volume scientifico protettivo</Text>
                          </View>
                        </View>
                      </View>

                      {/* Linha 4: Costo & Disponibilità */}
                      <View style={[styles.compareTableRow, { borderBottomWidth: 0 }]}>
                        <Text style={styles.compareFeatureName}>Disponibilità & Costo</Text>
                        <View style={styles.compareColsWrap}>
                          <View style={styles.compareColOld}>
                            <X size={12} color="#FF5252" />
                            <Text style={styles.compareColOldText}>€50–80/ora, orari rigidi</Text>
                          </View>
                          <View style={styles.compareColNew}>
                            <Check size={12} color={Colors.accentGreen} strokeWidth={3} />
                            <Text style={styles.compareColNewText}>24/7 sempre in tasca</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Rodapé do Card */}
                  <View style={styles.techCardFooter}>
                    <ShieldCheck size={14} color={Colors.primary} />
                    <Text style={styles.techCardFooterText}>
                      Standard di preparazione atletica d'élite per pallavolo & basket
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* ── SEZIONE SMARTPHONE IN BASSO: L'APP IN AZIONE COL SALTO ── */}
            <View style={styles.solutionPhoneSection}>
              <View style={styles.solutionPhoneHeader}>
                <View style={styles.solutionPhonePill}>
                  <Camera size={13} color={Colors.primary} />
                  <Text style={styles.solutionPhonePillText}>FOTOCAMERA IA IN AZIONE</Text>
                </View>
                <Text style={styles.solutionPhoneTitle}>
                  Misura l'elevazione in tempo reale a 240 FPS
                </Text>
                <Text style={styles.solutionPhoneSubtitle}>
                  Basta posizionare lo smartphone a terra: l'algoritmo rileva millisecondo per millisecondo il momento esatto di decollo e atterraggio.
                </Text>
              </View>

              <View style={styles.solutionPhoneDisplayWrapper}>
                {/* Glow di sfondo */}
                <View pointerEvents="none" style={styles.solutionPhoneGlowBlob} />

                {/* Badge Telemetria Sinistra */}
                <View style={[styles.floatingTelemetryBadge, styles.floatingBadgeLeft]}>
                  <View style={styles.telemetryDotGreen} />
                  <View>
                    <Text style={styles.telemetryBadgeLabel}>DECOLLO RILEVATO</Text>
                    <Text style={styles.telemetryBadgeVal}>Precisione al ms</Text>
                  </View>
                </View>

                {/* Badge Telemetria Destra */}
                <View style={[styles.floatingTelemetryBadge, styles.floatingBadgeRight]}>
                  <Sparkles size={13} color={Colors.primary} />
                  <View>
                    <Text style={styles.telemetryBadgeLabel}>TEMPO DI VOLO</Text>
                    <Text style={styles.telemetryBadgeValCyan}>+53.4 cm • 640 ms</Text>
                  </View>
                </View>

                {/* Immagine del cellulare che mostra la persona che salta */}
                <Image
                  source={require('../../assets/feature-phone-1.png')}
                  style={styles.solutionPhoneImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 8 (6/1): TRANSIZIONE VERSO PARAMETRI BIOMETRICI
           ══════════════════════════════════════════════════════ */}
        {currentStep === 8 && (
          <View style={styles.stepContainer}>
            <View style={styles.transitionCard}>
              <View style={styles.transitionIconRing}>
                <Activity size={36} color={Colors.primary} />
              </View>

              <Text style={styles.transitionTitle}>ANALISI BIOMETRICA DEL TUO PROFILO</Text>
              <Text style={styles.transitionSubtitle}>
                ULTIMI PASSI PER CALIBRARE I CARICHI DEL TUO PROGRAMMA
              </Text>

              <Text style={styles.transitionBody}>
                Abbiamo registrato il tuo ruolo, i tuoi obiettivi e le tue priorità. Adesso abbiamo bisogno di due soli parametri fisici fondamentali (peso e altezza) per consentire all'IA di calcolare l'indice potenza-peso e la spanna d'attacco a rete.
              </Text>

              <View style={styles.transitionCheckList}>
                <View style={styles.checkListItem}>
                  <Check size={16} color={Colors.accentGreen} strokeWidth={3} />
                  <Text style={styles.checkListText}>Calibrazione carichi personalizzata al grammo</Text>
                </View>
                <View style={styles.checkListItem}>
                  <Check size={16} color={Colors.accentGreen} strokeWidth={3} />
                  <Text style={styles.checkListText}>Zero rischio di tendinite rotulea o infortuni</Text>
                </View>
                <View style={styles.checkListItem}>
                  <Check size={16} color={Colors.accentGreen} strokeWidth={3} />
                  <Text style={styles.checkListText}>Calcolo esatto del punto d'impatto sopra la rete</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.continuePillBtn}
                activeOpacity={0.88}
                onPress={handleNextStep}
              >
                <Text style={styles.continuePillText}>INSERISCI I TUOI PARAMETRI</Text>
                <View style={styles.startArrowCircle}>
                  <ChevronRight size={18} color="#FFFFFF" strokeWidth={3} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 9 (7): QUANTI GIORNI ALLA SETTIMANA VUOI ALLENARTI
           ══════════════════════════════════════════════════════ */}
        {currentStep === 9 && (
          <View style={styles.stepContainer}>
            <Text style={styles.mainTitle}>LA TUA DISPONIBILITÀ</Text>
            <Text style={styles.mainSubtitle}>
              QUANTI GIORNI ALLA SETTIMANA VUOI ALLENARTI?
            </Text>

            <View style={styles.optionsListWrap}>
              {[
                {
                  id: '2-3',
                  title: '2–3 Giorni a Settimana',
                  desc: 'Ideale durante la stagione di campionato per mantenere freschezza in partita.',
                  badge: 'STAGIONE AGONISTICA',
                },
                {
                  id: '3-4',
                  title: '3–4 Giorni a Settimana',
                  desc: 'Il perfetto equilibrio tra stimolo pliometrico e recupero del tendine.',
                  badge: 'RACCOMANDATO DAL PROTOCOLLO',
                  highlight: true,
                },
                {
                  id: '4-5',
                  title: '4–5 Giorni a Settimana',
                  desc: 'Programma intensivo di trasformazione rapida per periodi fuori stagione.',
                  badge: 'ALTA INTENSITÀ',
                },
              ].map((opt) => {
                const isSelected = trainingDays === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.choiceRowCard,
                      opt.highlight && styles.choiceRowCardHighlight,
                      isSelected && styles.choiceRowCardSelected,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => {
                      setTrainingDays(opt.id);
                      setTimeout(() => handleNextStep(), 200);
                    }}
                  >
                    <View style={styles.choiceRowTop}>
                      <View style={[styles.choiceBadge, opt.highlight && styles.choiceBadgeHighlight]}>
                        <Text style={[styles.choiceBadgeText, opt.highlight && styles.choiceBadgeTextHighlight]}>
                          {opt.badge}
                        </Text>
                      </View>
                      <Clock size={20} color={opt.highlight || isSelected ? Colors.primary : '#888888'} />
                    </View>
                    <Text style={styles.choiceRowTitle}>{opt.title}</Text>
                    <Text style={styles.choiceRowDesc}>{opt.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 10 (8): PESO CORPOREO
           ══════════════════════════════════════════════════════ */}
        {currentStep === 10 && (
          <View style={styles.stepContainer}>
            <Text style={styles.mainTitle}>PESO CORPOREO</Text>
            <Text style={styles.mainSubtitle}>
              FONDAMENTALE PER IL RAPPORTO POTENZA-PESO DEL SALTO
            </Text>

            <View style={styles.biometricInputCard}>
              <Text style={styles.biometricCardLabel}>REGOLA IL TUO PESO</Text>

              <View style={styles.biometricStepperRow}>
                <TouchableOpacity
                  style={styles.biometricStepBtn}
                  activeOpacity={0.7}
                  onPress={() => stepWeight(-1)}
                >
                  <Minus size={22} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>

                <View style={styles.biometricInputPill}>
                  <TextInput
                    value={weight}
                    onChangeText={(txt) => setWeight(txt.replace(/[^0-9]/g, ''))}
                    keyboardType="numeric"
                    maxLength={3}
                    placeholder="84"
                    placeholderTextColor="#555555"
                    style={styles.biometricNumberInput}
                  />
                  <Text style={styles.biometricUnitLabel}>KG</Text>
                </View>

                <TouchableOpacity
                  style={styles.biometricStepBtn}
                  activeOpacity={0.7}
                  onPress={() => stepWeight(1)}
                >
                  <Plus size={22} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              <View style={styles.biometricInsightBox}>
                <Zap size={18} color={Colors.primary} />
                <Text style={styles.biometricInsightText}>
                  La forza verticale necessaria allo stacco cresce in modo direttamente proporzionale alla massa corporea. L'algoritmo calcolerà l'impulso newtoniano esatto per te.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.continuePillBtn}
                activeOpacity={0.88}
                onPress={handleNextStep}
              >
                <Text style={styles.continuePillText}>CONFERMA IL PESO</Text>
                <View style={styles.startArrowCircle}>
                  <ChevronRight size={18} color="#FFFFFF" strokeWidth={3} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 11 (9): ALTEZZA CORPOREA
           ══════════════════════════════════════════════════════ */}
        {currentStep === 11 && (
          <View style={styles.stepContainer}>
            <Text style={styles.mainTitle}>ALTEZZA CORPOREA</Text>
            <Text style={styles.mainSubtitle}>
              CALCOLO DEL TUO PUNTO D'IMPATTO SOPRA LA RETE
            </Text>

            <View style={styles.biometricInputCard}>
              <Text style={styles.biometricCardLabel}>REGOLA LA TUA ALTEZZA</Text>

              <View style={styles.biometricStepperRow}>
                <TouchableOpacity
                  style={styles.biometricStepBtn}
                  activeOpacity={0.7}
                  onPress={() => stepHeight(-1)}
                >
                  <Minus size={22} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>

                <View style={styles.biometricInputPill}>
                  <TextInput
                    value={height}
                    onChangeText={(txt) => setHeight(txt.replace(/[^0-9]/g, ''))}
                    keyboardType="numeric"
                    maxLength={3}
                    placeholder="192"
                    placeholderTextColor="#555555"
                    style={styles.biometricNumberInput}
                  />
                  <Text style={styles.biometricUnitLabel}>CM</Text>
                </View>

                <TouchableOpacity
                  style={styles.biometricStepBtn}
                  activeOpacity={0.7}
                  onPress={() => stepHeight(1)}
                >
                  <Plus size={22} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              <View style={styles.reachEstimateBox}>
                <Activity size={18} color={Colors.primary} />
                <Text style={styles.reachEstimateText}>
                  Portata da fermo stimata: <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>{standingReach} cm</Text> • Potenziale in attacco a rete con VertiCam: <Text style={{ color: Colors.primary, fontWeight: '900' }}>{totalAttackReach} cm</Text> ({clearanceOverNet > 0 ? `+${clearanceOverNet} cm sopra la rete!` : 'piena altezza a rete'})
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.continuePillBtn, { maxWidth: 390 }]}
                activeOpacity={0.88}
                onPress={handleFinishBiometrics}
              >
                <Text style={styles.continuePillText}>GENERA IL MIO PIANO CON L'IA</Text>
                <View style={styles.startArrowCircle}>
                  <ChevronRight size={18} color="#FFFFFF" strokeWidth={3} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 12: LOADER BIOMECCANICO ESTILO BETTERME
           ══════════════════════════════════════════════════════ */}
        {currentStep === 12 && (
          <View style={styles.betterMeLoaderWrapper}>
            {/* ── 1. CIRCULAR PROGRESS RING (ESTILO BETTERME) ── */}
            <View style={styles.circularLoaderContainer}>
              <View style={styles.circleSvgWrapper}>
                <Svg width={140} height={140} viewBox="0 0 140 140">
                  {/* Trilha do Círculo */}
                  <Circle
                    cx="70"
                    cy="70"
                    r="56"
                    stroke="rgba(255, 255, 255, 0.12)"
                    strokeWidth="7"
                    fill="none"
                  />
                  {/* Arco de Progresso Marfim/Creme */}
                  <Circle
                    cx="70"
                    cy="70"
                    r="56"
                    stroke="#EBE5D8"
                    strokeWidth="7"
                    strokeDasharray={2 * Math.PI * 56}
                    strokeDashoffset={
                      2 * Math.PI * 56 - (2 * Math.PI * 56 * analysisProgress) / 100
                    }
                    strokeLinecap="round"
                    fill="none"
                    transform="rotate(-90 70 70)"
                  />
                </Svg>

                {/* Porcentagem Central */}
                <View style={styles.circleCenterPercentBox}>
                  <Text style={styles.circleCenterPercentText}>{analysisProgress}%</Text>
                </View>
              </View>

              {/* Texto de Status da IA / Fase */}
              <Text style={styles.loaderStatusMessage}>
                {analysisSteps[analysisTextIndex]}
              </Text>
            </View>

            {/* ── 2. LINHA DIVISÓRIA SUTIL ── */}
            <View style={styles.loaderDividerLine} />

            {/* ── 3. PROVA SOCIAL EM GRANDE ESCALA ── */}
            <View style={styles.loaderSocialProofSection}>
              <Text style={styles.loaderSocialCount}>
                {gender === 'female' ? '68.000 atlete.' : '85.000 atleti.'}
              </Text>
              <Text style={styles.loaderSocialSub}>
                hanno scelto VertiCam per aumentare l'elevazione
              </Text>

              {/* ── 4. CARD DE DEPOIMENTO ESTILO TRUSTPILOT ── */}
              <View style={styles.loaderTestimonialCard}>
                <View style={styles.loaderTestimonialHeader}>
                  <View style={styles.trustpilotStarsRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <View key={s} style={styles.trustpilotStarBox}>
                        <Star size={11} color="#FFFFFF" fill="#FFFFFF" />
                      </View>
                    ))}
                  </View>
                  <Text style={styles.loaderAuthorName}>
                    {gender === 'female' ? 'Giulia B.' : 'Matteo R.'}
                  </Text>
                </View>

                <Text style={styles.loaderReviewHeadline}>
                  Sento la differenza
                </Text>
                <Text style={styles.loaderReviewBody}>
                  {gender === 'female'
                    ? 'Fantastico, dopo 20 giorni di allenamento noto già una reattività incredibile nello stacco a muro e non ho più fastidi al ginocchio. Consiglio a tutte le pallavoliste!'
                    : 'Geniale, dopo 20 giorni di allenamento sento già la differenza: salto molto più in alto sopra il nastro ed è sparito ogni dolore al tendine rotuleo. Top!'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 13: PAGINA FINALE OFFERTA (MODELLATA BETTERME)
           ══════════════════════════════════════════════════════ */}
        {currentStep === 13 && (
          <View style={styles.offerPageWrapper}>
            {/* ── 1. TITOLO PRINCIPALE ── */}
            <Text style={styles.offerHeadline}>
              Il tuo piano di salto personalizzato è pronto!
            </Text>

            {/* ── 2. CARD COMPARATIVA PRIMA / DOPO (STILE BETTERME) ── */}
            <View style={styles.offerComparisonCard}>
              {/* Header Tab: Ora vs Il tuo obiettivo */}
              <View style={styles.offerComparisonTabsHeader}>
                <View style={styles.offerTabHalf}>
                  <Text style={styles.offerTabLabel}>Ora</Text>
                </View>
                <View style={styles.offerTabDividerVertical} />
                <View style={styles.offerTabHalf}>
                  <Text style={[styles.offerTabLabel, { color: '#EBE5D8' }]}>Il tuo obiettivo</Text>
                </View>
              </View>

              {/* Immagine Atleta Prima / Dopo */}
              <View style={styles.offerAthleteImageWrap}>
                <Image
                  source={
                    gender === 'female'
                      ? require('../../assets/proof-jump-female.png')
                      : require('../../assets/proof-jump-male.png')
                  }
                  style={styles.offerAthleteImage}
                  resizeMode="cover"
                />
              </View>

              {/* Parametri di Confronto in Basso */}
              <View style={styles.offerMetricsComparisonRow}>
                {/* Colonna Sinistra (Ora) */}
                <View style={styles.offerMetricCol}>
                  <Text style={styles.offerMetricCategory}>Elevazione attuale</Text>
                  <Text style={styles.offerMetricValue}>{currentJumpEstimated} cm</Text>

                  <Text style={[styles.offerMetricCategory, { marginTop: 14 }]}>Reattività neuromuscolare</Text>
                  <Text style={styles.offerMetricValue}>Base</Text>
                  <View style={styles.offerLevelBarRow}>
                    <View style={[styles.offerLevelSegment, styles.offerLevelSegmentActive]} />
                    <View style={styles.offerLevelSegment} />
                    <View style={styles.offerLevelSegment} />
                  </View>
                </View>

                <View style={styles.offerMetricColDivider} />

                {/* Colonna Destra (Il tuo obiettivo) */}
                <View style={styles.offerMetricCol}>
                  <Text style={styles.offerMetricCategory}>Elevazione obiettivo</Text>
                  <Text style={[styles.offerMetricValue, { color: '#EBE5D8' }]}>
                    {potentialJumpProjected.toFixed(0)} cm (+{potentialGain.toFixed(0)} cm)
                  </Text>

                  <Text style={[styles.offerMetricCategory, { marginTop: 14 }]}>Reattività neuromuscolare</Text>
                  <Text style={[styles.offerMetricValue, { color: '#EBE5D8' }]}>Avanzato (Serie A)</Text>
                  <View style={styles.offerLevelBarRow}>
                    <View style={[styles.offerLevelSegment, styles.offerLevelSegmentActiveCream]} />
                    <View style={[styles.offerLevelSegment, styles.offerLevelSegmentActiveCream]} />
                    <View style={[styles.offerLevelSegment, styles.offerLevelSegmentActiveCream]} />
                  </View>
                </View>
              </View>
            </View>

            {/* ── 3. SEZIONE: SCEGLI IL TUO PIANO (MODELLATO SU BETTERME) ── */}
            <View style={styles.offerPricingSection}>
              <Text style={styles.offerHeadline}>
                Ottieni risultati visibili in 4 settimane!
              </Text>

              {/* Grid de 3 Planos Estilo BetterMe */}
              <View style={[styles.pricingCardsGrid, isDesktop && styles.pricingCardsGridDesktop]}>
                {/* Piano 1: Mensile (1 Mese) */}
                <TouchableOpacity
                  style={[
                    styles.pricingCardItem,
                    isDesktop && styles.pricingCardItemDesktop,
                    selectedPlan === '1_month' && styles.pricingCardItemSelected,
                  ]}
                  activeOpacity={0.88}
                  onPress={() => handleSelectPlanAndCheckout('1_month')}
                >
                  <View style={styles.cardTopContent}>
                    <View style={styles.pricingCardHeader}>
                      <Text style={styles.pricingPlanName}>Piano 1 Mese</Text>
                      <View style={[styles.planRadioCircle, selectedPlan === '1_month' && styles.planRadioCircleActive]}>
                        {selectedPlan === '1_month' && <Check size={13} color="#000000" strokeWidth={3.5} />}
                      </View>
                    </View>
                    <View style={styles.planDurationBadge}>
                      <Text style={styles.planDurationBadgeText}>PIANO 1 MESE</Text>
                    </View>
                    <Text style={styles.planTotalPriceText}>€19.99</Text>
                  </View>
                  <View style={styles.cardBottomContent}>
                    <View style={styles.planDailyPriceRow}>
                      <Text style={styles.planDailyPriceDigits}>€0.66</Text>
                      <Text style={styles.planDailySubText}>al giorno</Text>
                    </View>
                    <View style={styles.planGiftBox}>
                      <Check size={13} color="#00E5FF" strokeWidth={3} />
                      <Text style={styles.planGiftText}>Accesso completo a VertiCam</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Piano 2: Trimestrale (3 Mesi - PIÙ POPOLARE) */}
                <TouchableOpacity
                  style={[
                    styles.pricingCardItem,
                    isDesktop && styles.pricingCardItemDesktop,
                    styles.pricingCardPopular,
                    selectedPlan === '3_months' && styles.pricingCardItemSelected,
                  ]}
                  activeOpacity={0.88}
                  onPress={() => handleSelectPlanAndCheckout('3_months')}
                >
                  <View style={styles.popularTopBadge}>
                    <Text style={styles.popularTopBadgeText}>PIÙ POPOLARE</Text>
                  </View>
                  <View style={styles.cardTopContent}>
                    <View style={styles.pricingCardHeader}>
                      <Text style={styles.pricingPlanName}>Piano 3 Mesi</Text>
                      <View style={[styles.planRadioCircle, selectedPlan === '3_months' && styles.planRadioCircleActive]}>
                        {selectedPlan === '3_months' && <Check size={13} color="#000000" strokeWidth={3.5} />}
                      </View>
                    </View>
                    <View style={[styles.planDurationBadge, { backgroundColor: 'rgba(235, 229, 216, 0.15)' }]}>
                      <Text style={[styles.planDurationBadgeText, { color: '#EBE5D8' }]}>RISPARMIA 37%</Text>
                    </View>
                    <Text style={styles.planTotalPriceText}>€37.99 (€12.66/mese)</Text>
                  </View>
                  <View style={styles.cardBottomContent}>
                    <View style={styles.planDailyPriceRow}>
                      <Text style={styles.planDailyPriceDigits}>€0.42</Text>
                      <Text style={styles.planDailySubText}>al giorno</Text>
                    </View>
                    <View style={styles.planGiftBox}>
                      <Check size={13} color="#00E5FF" strokeWidth={3} />
                      <Text style={styles.planGiftText}>Accesso completo a VertiCam</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Piano 3: Semestrale (6 Mesi - MIGLIOR VALORE) */}
                <TouchableOpacity
                  style={[
                    styles.pricingCardItem,
                    isDesktop && styles.pricingCardItemDesktop,
                    selectedPlan === '6_months' && styles.pricingCardItemSelected,
                  ]}
                  activeOpacity={0.88}
                  onPress={() => handleSelectPlanAndCheckout('6_months')}
                >
                  <View style={styles.cardTopContent}>
                    <View style={styles.pricingCardHeader}>
                      <Text style={styles.pricingPlanName}>Piano 6 Mesi</Text>
                      <View style={[styles.planRadioCircle, selectedPlan === '6_months' && styles.planRadioCircleActive]}>
                        {selectedPlan === '6_months' && <Check size={13} color="#000000" strokeWidth={3.5} />}
                      </View>
                    </View>
                    <View style={[styles.planDurationBadge, { backgroundColor: 'rgba(0, 230, 118, 0.12)' }]}>
                      <Text style={[styles.planDurationBadgeText, { color: '#00E676' }]}>50% DI SCONTO</Text>
                    </View>
                    <Text style={styles.planTotalPriceText}>€59.99 (€9.99/mese)</Text>
                  </View>
                  <View style={styles.cardBottomContent}>
                    <View style={styles.planDailyPriceRow}>
                      <Text style={styles.planDailyPriceDigits}>€0.33</Text>
                      <Text style={styles.planDailySubText}>al giorno</Text>
                    </View>
                    <View style={styles.planGiftBox}>
                      <Check size={13} color="#00E5FF" strokeWidth={3} />
                      <Text style={styles.planGiftText}>Accesso completo a VertiCam</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Botão Principal CTA */}
              <TouchableOpacity
                style={styles.offerPrimaryCtaBtn}
                activeOpacity={0.88}
                onPress={handleCheckout}
              >
                <Text style={styles.offerPrimaryCtaText}>OTTIENI IL MIO PIANO</Text>
              </TouchableOpacity>

              {/* Box de Termos e Cancelamento */}
              <View style={styles.subscriptionTermsBox}>
                <Text style={styles.subscriptionTermsText}>
                  Se non annulli prima del termine del piano selezionato, accetti che VertiCam addebiterà automaticamente il rinnovo fino alla cancellazione. Cancella in qualsiasi momento con un clic nel tuo account.
                </Text>
              </View>

              {/* Selos de Segurança Bancária */}
              <View style={styles.securityBadgesRow}>
                <View style={styles.securityBadgeItem}>
                  <Lock size={12} color="#00E5FF" />
                  <Text style={styles.securityBadgeText}>SECURED SSL ENCRYPTION</Text>
                </View>
                <Text style={styles.securityBrandBadge}>VISA</Text>
                <Text style={styles.securityBrandBadge}>Mastercard ID Check</Text>
                <Text style={[styles.securityBrandBadge, { color: '#38BDF8', borderColor: 'rgba(56, 189, 248, 0.4)' }]}>PayPal</Text>
                <Text style={styles.securityBrandBadge}>PCI DSS</Text>
              </View>
            </View>

            {/* ── 4. SEZIONE: COSA INCLUDE IL TUO PIANO (MODELLATO SU VERTICAM) ── */}
            <View style={styles.offerWhatIncludesSection}>
              <Text style={styles.offerHeadline}>Cosa include il tuo piano</Text>

              {/* Showcase dei 5 Telefoni VertiCam */}
              {isDesktop ? (
                <View style={styles.screensShowcaseRow}>
                  {showcaseFeatures.map((feat, idx) => (
                    <View key={idx} style={styles.screenMockupCard}>
                      <View style={[styles.phoneFrameContainer, feat.isHighlight && styles.phoneFrameHighlight]}>
                        {feat.isHighlight && <View pointerEvents="none" style={styles.phoneGlowBlob} />}
                        <Image
                          source={feat.image}
                          style={[
                            styles.phoneMockupImage,
                            feat.isHighlight && styles.phoneMockupImageHighlight,
                          ]}
                          resizeMode="contain"
                        />
                      </View>
                      <Text style={[styles.mockupCardTitle, feat.isHighlight && { color: Colors.primary }]}>
                        {feat.title}
                      </Text>
                      <Text style={styles.mockupCardSubtitle}>{feat.subtitle}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.screensShowcaseScroll}
                >
                  {showcaseFeatures.map((feat, idx) => (
                    <View key={idx} style={styles.screenMockupCardMobile}>
                      <View style={[styles.phoneFrameContainer, feat.isHighlight && styles.phoneFrameHighlight]}>
                        {feat.isHighlight && <View pointerEvents="none" style={styles.phoneGlowBlob} />}
                        <Image
                          source={feat.image}
                          style={[
                            styles.phoneMockupImageMobile,
                            feat.isHighlight && styles.phoneMockupImageHighlight,
                          ]}
                          resizeMode="contain"
                        />
                      </View>
                      <Text style={[styles.mockupCardTitle, feat.isHighlight && { color: Colors.primary }]}>
                        {feat.title}
                      </Text>
                      <Text style={styles.mockupCardSubtitle}>{feat.subtitle}</Text>
                    </View>
                  ))}
                </ScrollView>
              )}

              {/* Banner Inferior: Piano di recupero e nutrizione personalizzato */}
              <View style={styles.showcaseBottomBanner}>
                <Text style={styles.showcaseBottomTitle}>
                  🔥 Piano di recupero e nutrizione personalizzato
                </Text>
                <Text style={styles.showcaseBottomDesc}>
                  Con oltre 100 protocolli facili da seguire per raggiungere il tuo obiettivo più velocemente e proteggere i tendini.
                </Text>
              </View>
            </View>

            {/* ── 5. SEZIONE: RE-PITCH RISULTATI IN 4 SETTIMANE ── */}
            <View style={styles.rePitchSection}>
              <Text style={styles.offerHeadline}>
                Ottieni risultati visibili in 4 settimane!
              </Text>

              {/* Grid Repetido de Planos */}
              <View style={[styles.pricingCardsGrid, isDesktop && styles.pricingCardsGridDesktop]}>
                {/* Piano 1: Mensile */}
                <TouchableOpacity
                  style={[
                    styles.pricingCardItem,
                    isDesktop && styles.pricingCardItemDesktop,
                    selectedPlan === '1_month' && styles.pricingCardItemSelected,
                  ]}
                  activeOpacity={0.88}
                  onPress={() => handleSelectPlanAndCheckout('1_month')}
                >
                  <View style={styles.cardTopContent}>
                    <View style={styles.pricingCardHeader}>
                      <Text style={styles.pricingPlanName}>Piano 1 Mese</Text>
                      <View style={[styles.planRadioCircle, selectedPlan === '1_month' && styles.planRadioCircleActive]}>
                        {selectedPlan === '1_month' && <Check size={13} color="#000000" strokeWidth={3.5} />}
                      </View>
                    </View>
                    <View style={styles.planDurationBadge}>
                      <Text style={styles.planDurationBadgeText}>PIANO 1 MESE</Text>
                    </View>
                    <Text style={styles.planTotalPriceText}>€19.99</Text>
                  </View>
                  <View style={styles.cardBottomContent}>
                    <View style={styles.planDailyPriceRow}>
                      <Text style={styles.planDailyPriceDigits}>€0.66</Text>
                      <Text style={styles.planDailySubText}>al giorno</Text>
                    </View>
                    <View style={styles.planGiftBox}>
                      <Check size={13} color="#00E5FF" strokeWidth={3} />
                      <Text style={styles.planGiftText}>Accesso completo a VertiCam</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Piano 2: Trimestrale */}
                <TouchableOpacity
                  style={[
                    styles.pricingCardItem,
                    isDesktop && styles.pricingCardItemDesktop,
                    styles.pricingCardPopular,
                    selectedPlan === '3_months' && styles.pricingCardItemSelected,
                  ]}
                  activeOpacity={0.88}
                  onPress={() => handleSelectPlanAndCheckout('3_months')}
                >
                  <View style={styles.popularTopBadge}>
                    <Text style={styles.popularTopBadgeText}>PIÙ POPOLARE</Text>
                  </View>
                  <View style={styles.cardTopContent}>
                    <View style={styles.pricingCardHeader}>
                      <Text style={styles.pricingPlanName}>Piano 3 Mesi</Text>
                      <View style={[styles.planRadioCircle, selectedPlan === '3_months' && styles.planRadioCircleActive]}>
                        {selectedPlan === '3_months' && <Check size={13} color="#000000" strokeWidth={3.5} />}
                      </View>
                    </View>
                    <View style={[styles.planDurationBadge, { backgroundColor: 'rgba(235, 229, 216, 0.15)' }]}>
                      <Text style={[styles.planDurationBadgeText, { color: '#EBE5D8' }]}>RISPARMIA 37%</Text>
                    </View>
                    <Text style={styles.planTotalPriceText}>€37.99 (€12.66/mese)</Text>
                  </View>
                  <View style={styles.cardBottomContent}>
                    <View style={styles.planDailyPriceRow}>
                      <Text style={styles.planDailyPriceDigits}>€0.42</Text>
                      <Text style={styles.planDailySubText}>al giorno</Text>
                    </View>
                    <View style={styles.planGiftBox}>
                      <Check size={13} color="#00E5FF" strokeWidth={3} />
                      <Text style={styles.planGiftText}>Accesso completo a VertiCam</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Piano 3: Semestrale */}
                <TouchableOpacity
                  style={[
                    styles.pricingCardItem,
                    isDesktop && styles.pricingCardItemDesktop,
                    selectedPlan === '6_months' && styles.pricingCardItemSelected,
                  ]}
                  activeOpacity={0.88}
                  onPress={() => handleSelectPlanAndCheckout('6_months')}
                >
                  <View style={styles.cardTopContent}>
                    <View style={styles.pricingCardHeader}>
                      <Text style={styles.pricingPlanName}>Piano 6 Mesi</Text>
                      <View style={[styles.planRadioCircle, selectedPlan === '6_months' && styles.planRadioCircleActive]}>
                        {selectedPlan === '6_months' && <Check size={13} color="#000000" strokeWidth={3.5} />}
                      </View>
                    </View>
                    <View style={[styles.planDurationBadge, { backgroundColor: 'rgba(0, 230, 118, 0.12)' }]}>
                      <Text style={[styles.planDurationBadgeText, { color: '#00E676' }]}>50% DI SCONTO</Text>
                    </View>
                    <Text style={styles.planTotalPriceText}>€59.99 (€9.99/mese)</Text>
                  </View>
                  <View style={styles.cardBottomContent}>
                    <View style={styles.planDailyPriceRow}>
                      <Text style={styles.planDailyPriceDigits}>€0.33</Text>
                      <Text style={styles.planDailySubText}>al giorno</Text>
                    </View>
                    <View style={styles.planGiftBox}>
                      <Check size={13} color="#00E5FF" strokeWidth={3} />
                      <Text style={styles.planGiftText}>Accesso completo a VertiCam</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Botão Final CTA */}
              <TouchableOpacity
                style={styles.offerPrimaryCtaBtn}
                activeOpacity={0.88}
                onPress={handleCheckout}
              >
                <Text style={styles.offerPrimaryCtaText}>OTTIENI IL MIO PIANO</Text>
              </TouchableOpacity>

              {/* Box de Termos e Cancelamento */}
              <View style={styles.subscriptionTermsBox}>
                <Text style={styles.subscriptionTermsText}>
                  Se non annulli prima del termine del piano selezionato, accetti che VertiCam addebiterà automaticamente il rinnovo fino alla cancellazione. Cancella in qualsiasi momento con un clic nel tuo account.
                </Text>
              </View>

              {/* Garanzia Soddisfatti o Rimborsati */}
              <View style={styles.guaranteeFinalBox}>
                <ShieldCheck size={22} color={Colors.accentGreen} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.guaranteeFinalTitle}>GARANZIA 100% SODDISFATTI O RIMBORSATI</Text>
                  <Text style={styles.guaranteeFinalText}>
                    Prova VertiCam per 14 giorni. Se non vedi un incremento concreto del tuo salto verticale o non sei pienamente soddisfatto, ti rimborsiamo ogni singolo centesimo.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ── FOOTER BETTERME COM DISCLAIMER & SUPPORTO (oculto no loader Step 12 e na oferta 13) ── */}
        {currentStep !== 12 && currentStep !== 13 && (
          <View style={styles.betterMeFooter}>
            <Text style={styles.legalDisclaimer}>
              Selezionando la tua opzione e continuando, accetti i nostri{' '}
              <Text style={styles.legalLink}>Termini di Servizio</Text> |{' '}
              <Text style={styles.legalLink}>Informativa sulla Privacy</Text>
            </Text>
            <Text style={styles.readBeforeNotice}>Leggi prima di continuare</Text>
          </View>
        )}
      </ScrollView>

      {/* ── BARRA FLUTTUANTE INFERIORE (STEP 6 & STEP 7: BOTTONE ESTILO BETTERME) ── */}
      {(currentStep === 6 || currentStep === 7) && (
        <View style={styles.floatingBottomBarContainer}>
          <TouchableOpacity
            style={styles.betterMeFloatingBtn}
            activeOpacity={0.88}
            onPress={handleNextStep}
          >
            <Text style={styles.betterMeFloatingBtnText}>
              {currentStep === 6 ? 'PROSSIMO PASSO' : 'CONTINUA'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Floating Help Button (oculto nos Steps 6, 7, no loader 12 e na oferta 13) */}
      {currentStep !== 6 && currentStep !== 7 && currentStep !== 12 && currentStep !== 13 && (
        <TouchableOpacity style={styles.floatingHelpBtn} activeOpacity={0.8}>
          <HelpCircle size={15} color="#000000" />
          <Text style={styles.floatingHelpText}>Aiuto</Text>
        </TouchableOpacity>
      )}

      {/* Modal di Checkout Incorporato Stripe su Pagina */}
      <StripeEmbeddedCheckoutModal
        visible={isCheckoutModalVisible}
        onClose={() => setIsCheckoutModalVisible(false)}
        planId={selectedPlan}
        planName={
          selectedPlan === '1_month'
            ? 'Piano 1 Mese'
            : selectedPlan === '3_months'
            ? 'Piano 3 Mesi (Più Popolare)'
            : 'Piano 6 Mesi'
        }
        planPrice={
          selectedPlan === '1_month'
            ? '€ 19,99/mese'
            : selectedPlan === '3_months'
            ? '€ 37,99'
            : '€ 59,99'
        }
      />
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

  // ── HEADER & BARRA DE PROGRESSO ESTILO BETTERME ──
  headerContainer: {
    width: '100%',
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    zIndex: 100,
  },
  headerBar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  headerBarOffer: {
    height: 70,
    paddingHorizontal: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerCategoryText: {
    color: '#9E9E9E',
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.2,
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
    fontSize: 24,
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
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  segmentedProgressBarContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 6,
    gap: 6,
  },
  segmentTrack: {
    flex: 1,
    height: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  segmentFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },

  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  stepContainer: {
    width: '100%',
    maxWidth: 1240,
    alignItems: 'center',
  },

  // ── BADGE IA & TECNOLOGIA NO TOPO ──
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.35)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 16,
    alignSelf: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  aiBadgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
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

  // ── STEP 0: IMMAGINE DI TRASFORMAZIONE ELEVAZIONE ──
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
    backgroundColor: '#F3F4ED',
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
    fontWeight: '600',
    textAlign: 'center',
  },

  // ── GRID DE CARDS BETTERME ──
  cardsGrid: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardsGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    gap: 16,
  },
  cardsGrid5Desktop: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    gap: 12,
  },
  cardsGrid6Desktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    width: '100%',
    maxWidth: 750,
  },
  cardsGridMobile: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 420,
  },
  cardsGrid6Mobile: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    maxWidth: 420,
  },

  // ── O CARD BETTERME COM ATLETA & PÍLULA EMBAIXO ──
  betterMeCard: {
    backgroundColor: '#161922',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    justifyContent: 'space-between',
    paddingBottom: 8,
    paddingHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  betterMeCardDesktop: {
    width: 225,
    height: 310,
  },
  betterMeCard5Desktop: {
    width: 182,
    height: 265,
  },
  betterMeCard6Desktop: {
    width: 220,
    height: 300,
    paddingBottom: 8,
    paddingHorizontal: 8,
    borderRadius: 18,
  },
  betterMeCardMobile: {
    width: '47%',
    maxWidth: 185,
    height: 240,
    paddingBottom: 6,
    paddingHorizontal: 6,
    borderRadius: 16,
  },
  betterMeCard6Mobile: {
    width: '31%',
    maxWidth: 125,
    minWidth: 96,
    height: 182,
    paddingBottom: 5,
    paddingHorizontal: 4,
    borderRadius: 13,
  },
  betterMeCardSelected: {
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
  },
  cardImageContainer: {
    width: '100%',
    height: 234,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImageContainer5: {
    height: 198,
  },
  cardImageContainer6Desktop: {
    height: 224,
    borderRadius: 12,
  },
  cardImageContainerMobile: {
    height: 174,
    borderRadius: 10,
  },
  cardImageContainer6Mobile: {
    height: 126,
    borderRadius: 9,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },

  // ── PÍLULA CLARA EMBAIXO DO CARD ──
  cardBottomPill: {
    height: 52,
    backgroundColor: '#F3F4ED',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  cardBottomPill5: {
    height: 46,
    paddingHorizontal: 12,
    borderRadius: 13,
  },
  cardBottomPill6Desktop: {
    height: 50,
    paddingHorizontal: 12,
    borderRadius: 13,
  },
  cardBottomPillMobile: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  cardBottomPill6Mobile: {
    height: 38,
    borderRadius: 10,
    paddingHorizontal: 5,
  },
  cardBottomPillSelected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  cardPillText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    marginRight: 6,
  },
  cardPillText5: {
    fontSize: 14,
    fontWeight: '800',
  },
  cardPillText6Desktop: {
    fontSize: 15,
    fontWeight: '800',
  },
  cardPillTextMobile: {
    fontSize: 14,
    fontWeight: '800',
  },
  cardPillText6Mobile: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  cardPillText6MobileLong: {
    fontSize: 9.2,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  cardArrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardArrowCircle5: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  cardArrowCircle6Desktop: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  cardArrowCircleMobile: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  cardArrowCircle6Mobile: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
  },

  // ── STEP 4: RULER & JUMPING ATHLETE STAGE ──
  rulerScreenLayout: {
    width: '100%',
    maxWidth: 860,
    flexDirection: 'column',
    gap: 18,
    marginBottom: 20,
  },
  rulerScreenLayoutDesktop: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 24,
  },
  rulerControlsCard: {
    flex: 1,
    backgroundColor: '#161922',
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rulerControlsCardDesktop: {
    minHeight: 400,
  },
  rulerCardSubtitle: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  rulerHeroNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 12,
  },
  rulerStepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#262D3D',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rulerHeroValueBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#0A0C12',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 8,
  },
  rulerHeroPlus: {
    color: Colors.primary,
    fontSize: 26,
    fontWeight: '900',
    marginRight: 2,
  },
  rulerHeroDigits: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '900',
    minWidth: 60,
    textAlign: 'center',
  },
  rulerHeroUnit: {
    color: Colors.primary,
    fontSize: 22,
    fontWeight: '900',
    marginLeft: 4,
  },
  rulerLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  rulerLevelText: {
    color: Colors.primary,
    fontSize: 12.5,
    fontWeight: '800',
  },
  rulerBoxContainer: {
    width: '100%',
    height: 72,
    backgroundColor: '#0F121B',
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 4,
  },
  rulerPointerMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 2,
    marginLeft: -1,
    backgroundColor: Colors.primary,
    zIndex: 10,
  },
  rulerScrollContent: {
    alignItems: 'center',
  },
  rulerTickCol: {
    width: 14,
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 54,
  },
  rulerTickLine: {
    width: 1.5,
    backgroundColor: '#444444',
  },
  rulerTickMinor: {
    height: 14,
  },
  rulerTickMajor: {
    height: 24,
    backgroundColor: '#AAAAAA',
    width: 2,
  },
  rulerTickActive: {
    backgroundColor: Colors.primary,
    width: 2.5,
    height: 28,
  },
  rulerTickText: {
    color: '#777777',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  rulerTickTextActive: {
    color: Colors.primary,
    fontWeight: '900',
  },
  quickChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  quickChip: {
    backgroundColor: '#1E2330',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  quickChipActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    borderColor: Colors.primary,
  },
  quickChipText: {
    color: '#AAAAAA',
    fontSize: 12,
    fontWeight: '700',
  },
  quickChipTextActive: {
    color: Colors.primary,
    fontWeight: '900',
  },

  // ── PALCO DO ATLETA ──
  athleteStageCard: {
    flex: 1,
    backgroundColor: '#10131C',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative',
    overflow: 'hidden',
    height: 350,
    alignItems: 'center',
  },
  athleteStageCardDesktop: {
    height: 420,
    minHeight: 400,
  },
  stageCourtBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  stageVolleyNetLine: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  stageVolleyAntenna: {
    position: 'absolute',
    top: 20,
    right: 30,
    width: 2,
    height: 60,
    backgroundColor: 'rgba(255, 23, 68, 0.4)',
  },
  athleteFigureWrapper: {
    position: 'absolute',
    alignSelf: 'center',
    width: 140,
    height: 230,
    zIndex: 5,
  },
  athleteFigureImage: {
    width: '100%',
    height: '100%',
  },
  feetElevationMarker: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 22,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 6,
  },
  feetElevationLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#00E676',
    borderStyle: 'dashed',
  },
  feetElevationBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderWidth: 1,
    borderColor: '#00E676',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginLeft: 6,
  },
  feetElevationBadgeText: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: '900',
  },
  measurementArrowTrack: {
    position: 'absolute',
    left: 36,
    width: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 6,
  },
  arrowTopHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFD700',
  },
  arrowShaft: {
    width: 2,
    flex: 1,
    backgroundColor: '#FFD700',
  },
  arrowBottomHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFD700',
  },
  groundBaseContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 42,
    justifyContent: 'flex-end',
    zIndex: 4,
  },
  groundRedLine: {
    height: 2,
    backgroundColor: '#FF1744',
    width: '100%',
  },
  groundFloorBar: {
    height: 40,
    backgroundColor: '#1E140F',
    borderTopWidth: 1,
    borderTopColor: '#3E2723',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groundFloorText: {
    color: '#8D6E63',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // ── ESTILOS DAS NOVAS OPÇÕES EM LISTA / CARDS HORIZONTAIS ──
  optionsListWrap: {
    width: '100%',
    maxWidth: 580,
    gap: 14,
  },
  choiceRowCard: {
    backgroundColor: '#161922',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  choiceRowCardHighlight: {
    borderColor: 'rgba(0, 229, 255, 0.35)',
    backgroundColor: 'rgba(0, 229, 255, 0.03)',
  },
  choiceRowCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
  },
  choiceRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  choiceBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  choiceBadgeHighlight: {
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
  },
  choiceBadgeText: {
    color: '#AAAAAA',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  choiceBadgeTextHighlight: {
    color: Colors.primary,
  },
  choiceRowTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6,
  },
  choiceRowDesc: {
    color: '#9E9E9E',
    fontSize: 14,
    lineHeight: 20,
  },

  // ── STEP 5 (4/1): TEMPO STIMATO & CASO STUDIO (LAYOUT CLEAN) ──
  projectionScreenLayout: {
    width: '100%',
    maxWidth: 960,
    flexDirection: 'column',
    gap: 22,
    marginBottom: 20,
  },
  projectionScreenLayoutDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 40,
    marginBottom: 24,
  },
  projectionTextCol: {
    width: '100%',
  },
  projectionTextColDesktop: {
    flex: 1.1,
    maxWidth: 460,
  },
  cleanHeaderGoalLabel: {
    color: '#90A4AE',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  cleanHeroTitle: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 42,
    letterSpacing: -0.8,
    marginBottom: 20,
  },
  heroTimeCard: {
    backgroundColor: '#0F131D',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.35)',
    padding: 22,
    marginBottom: 16,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
  },
  heroTimeCardLabel: {
    color: '#90A4AE',
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },
  heroTimeDigitsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  heroTimeDigitsText: {
    color: Colors.primary,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  heroTimeWeeksSub: {
    color: '#B0BEC5',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 14,
    marginLeft: 48,
  },
  heroTimeDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 14,
  },
  heroTimeDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroTimeDateText: {
    color: '#CFD8DC',
    fontSize: 13.5,
    fontWeight: '600',
  },
  cleanFooterInsight: {
    color: '#78909C',
    fontSize: 12.5,
    fontWeight: '600',
  },

  // Coluna Direita (Prova Social Clean com Foto em Destaque)
  proofCardWrapper: {
    width: '100%',
    backgroundColor: '#10131C',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  proofCardWrapperDesktop: {
    flex: 1,
    maxWidth: 440,
  },
  cleanProofHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  proofAthleteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  proofAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  proofAthleteName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  proofAthleteRole: {
    color: '#90A4AE',
    fontSize: 11,
    fontWeight: '600',
  },
  proofResultBadge: {
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    borderWidth: 1,
    borderColor: '#00E676',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  proofResultBadgeText: {
    color: '#00E676',
    fontSize: 13.5,
    fontWeight: '900',
  },
  proofResultBadgeSub: {
    color: '#A5D6A7',
    fontSize: 9.5,
    fontWeight: '700',
  },
  cleanProofImageWrapper: {
    width: '100%',
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0A0C12',
  },
  proofCardImage: {
    width: '100%',
    height: '100%',
  },
  proofOverlayBadgeLeft: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  proofOverlayText: {
    color: '#E0E0E0',
    fontSize: 10.5,
    fontWeight: '800',
  },
  proofOverlayBadgeRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00E676',
  },
  proofOverlayTextGreen: {
    color: '#00E676',
    fontSize: 10.5,
    fontWeight: '900',
  },

  // ── MULTI-SELECT INSTRUCTION (STEP 6) ──
  multiSelectInstruction: {
    fontSize: 14.5,
    color: '#9E9E9E',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 22,
    fontWeight: '500',
  },

  // ── PERSONAS CARD (STEP 6 - ESTILO BETTERME) ──
  personaChoiceCard: {
    backgroundColor: '#161922',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  personaChoiceCardSelected: {
    backgroundColor: '#EBE5D8',
    borderColor: '#EBE5D8',
  },
  personaCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  personaTag: {
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    paddingVertical: 3.5,
    paddingHorizontal: 9,
    borderRadius: 6,
  },
  personaTagSelected: {
    backgroundColor: 'rgba(30, 28, 25, 0.12)',
  },
  personaTagText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  personaTagTextSelected: {
    color: '#2B2620',
  },
  personaCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.8,
    borderColor: '#555866',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  personaCheckboxActive: {
    backgroundColor: '#5A4D41',
    borderColor: '#5A4D41',
  },
  personaCardTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  personaCardTitleSelected: {
    color: '#1C1C1E',
  },
  personaCardDesc: {
    color: '#9E9E9E',
    fontSize: 13.5,
    lineHeight: 19,
  },
  personaCardDescSelected: {
    color: '#44413C',
  },

  // ── BARRA FLUTTUANTE INFERIORE (STEP 6) ──
  floatingBottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 16,
    paddingBottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 999,
  },
  betterMeFloatingBtn: {
    backgroundColor: '#EBE5D8',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 48,
    minWidth: 280,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  betterMeFloatingBtnText: {
    color: '#1C1C1E',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  // ── SOLUZIONE & SCIENZA (STEP 7: STILE BETTERME DUAL-PANE) ──
  solutionScreenContainer: {
    width: '100%',
    maxWidth: 1040,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  solutionSplitLayout: {
    width: '100%',
    flexDirection: 'column',
    gap: 28,
    alignItems: 'stretch',
  },
  solutionSplitLayoutRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 36,
  },
  solutionLeftCol: {
    flex: 1,
    alignItems: 'flex-start',
  },
  solutionLeftColDesktop: {
    maxWidth: 520,
  },
  solutionAiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.35)',
    paddingVertical: 5,
    paddingHorizontal: 13,
    borderRadius: 20,
    marginBottom: 16,
  },
  solutionAiBadgeText: {
    color: Colors.primary,
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.9,
  },
  solutionHeadline: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '900',
    lineHeight: 35,
    letterSpacing: -0.5,
    marginBottom: 24,
    textAlign: 'left',
  },
  solutionPointsList: {
    width: '100%',
    gap: 14,
  },
  solutionPointCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: '#161922',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 16,
    padding: 16,
  },
  solutionPointIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  solutionPointContent: {
    flex: 1,
  },
  solutionPointTitle: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '800',
    marginBottom: 4,
  },
  solutionPointDesc: {
    color: '#9E9E9E',
    fontSize: 13.5,
    lineHeight: 20,
  },
  boldWhite: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // ── COLONNA DESTRA: DASHBOARD & COMPARATIVO ──
  solutionRightCol: {
    width: '100%',
  },
  solutionRightColDesktop: {
    flex: 1,
    maxWidth: 480,
  },
  techDashboardCard: {
    backgroundColor: '#12141C',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    padding: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  techCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  techStatusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  greenPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accentGreen,
  },
  techStatusText: {
    color: Colors.accentGreen,
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  techAccuracyBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  techAccuracyText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  techMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  techMetricBox: {
    alignItems: 'center',
    flex: 1,
  },
  techMetricVal: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 2,
  },
  techMetricLbl: {
    color: '#8A8D9B',
    fontSize: 11,
    fontWeight: '600',
  },
  techMetricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  compareSection: {
    paddingTop: 16,
  },
  compareSectionTitle: {
    color: '#8A8D9B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },
  compareTable: {
    backgroundColor: '#0C0E14',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  compareTableRow: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  compareFeatureName: {
    color: '#E0E0E0',
    fontSize: 12.5,
    fontWeight: '800',
    marginBottom: 6,
  },
  compareColsWrap: {
    flexDirection: 'column',
    gap: 6,
  },
  compareColOld: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.65,
  },
  compareColOldText: {
    color: '#B0B0B0',
    fontSize: 11.5,
  },
  compareColNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compareColNewText: {
    color: Colors.accentGreen,
    fontSize: 12,
    fontWeight: '700',
  },
  techCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  techCardFooterText: {
    color: '#8A8D9B',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },

  // ── SEZIONE SMARTPHONE COL SALTO IN BASSO (STEP 7) ──
  solutionPhoneSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 40,
    paddingTop: 36,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  solutionPhoneHeader: {
    alignItems: 'center',
    maxWidth: 640,
    marginBottom: 24,
    gap: 8,
  },
  solutionPhonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 4,
  },
  solutionPhonePillText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  solutionPhoneTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  solutionPhoneSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  solutionPhoneDisplayWrapper: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 10,
    marginBottom: 10,
  },
  solutionPhoneGlowBlob: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    filter: 'blur(60px)' as any,
    alignSelf: 'center',
  },
  solutionPhoneImage: {
    width: '100%',
    maxWidth: 340,
    height: 480,
    alignSelf: 'center',
  },
  floatingTelemetryBadge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    zIndex: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  floatingBadgeLeft: {
    left: 8,
    top: 80,
  },
  floatingBadgeRight: {
    right: 8,
    top: 220,
    borderColor: 'rgba(0, 229, 255, 0.35)',
  },
  telemetryDotGreen: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  telemetryBadgeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  telemetryBadgeVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 1,
  },
  telemetryBadgeValCyan: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.primary,
    marginTop: 1,
  },

  // ── TRANSIZIONE BIOMETRICA (STEP 8 / 6-1) ──
  transitionCard: {
    width: '100%',
    maxWidth: 580,
    backgroundColor: '#161922',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.25)',
  },
  transitionIconRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  transitionTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  transitionSubtitle: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 16,
  },
  transitionBody: {
    color: '#CCCCCC',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  transitionCheckList: {
    width: '100%',
    gap: 10,
    marginBottom: 24,
    backgroundColor: '#0F121B',
    padding: 16,
    borderRadius: 14,
  },
  checkListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkListText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    flex: 1,
  },

  // ── BIOMETRIC INPUT CARD (STEPS 10 & 11) ──
  biometricInputCard: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#161922',
    borderRadius: 24,
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  biometricCardLabel: {
    color: '#8A8D9B',
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 20,
  },
  biometricStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 26,
    width: '100%',
  },
  biometricStepBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricInputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D1017',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.4)',
    borderRadius: 20,
    paddingHorizontal: 20,
    height: 64,
    minWidth: 160,
    maxWidth: 190,
  },
  biometricNumberInput: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    minWidth: 64,
    maxWidth: 80,
    padding: 0,
    margin: 0,
  },
  biometricUnitLabel: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.primary,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  biometricInsightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(0, 229, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  biometricInsightText: {
    color: '#B0BEC5',
    fontSize: 13.5,
    lineHeight: 20,
    flex: 1,
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
    marginBottom: 24,
  },
  reachEstimateText: {
    color: '#B0BEC5',
    fontSize: 14,
    lineHeight: 21,
    flex: 1,
  },
  continuePillBtn: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    height: 58,
    backgroundColor: '#F3F4ED',
    borderRadius: 29,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 18,
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  continuePillText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  // ── BETTERME STEP 12: LOADER BIOMECCANICO ──
  betterMeLoaderWrapper: {
    width: '100%',
    maxWidth: 580,
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 16,
  },
  circularLoaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  circleSvgWrapper: {
    width: 140,
    height: 140,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  circleCenterPercentBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleCenterPercentText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  loaderStatusMessage: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 420,
    lineHeight: 22,
    minHeight: 44,
  },
  loaderDividerLine: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 36,
  },
  loaderSocialProofSection: {
    width: '100%',
    alignItems: 'center',
  },
  loaderSocialCount: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.8,
    textAlign: 'center',
    marginBottom: 6,
  },
  loaderSocialSub: {
    fontSize: 16,
    color: '#A0A0A5',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 32,
  },
  loaderTestimonialCard: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#161922',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  loaderTestimonialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trustpilotStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustpilotStarBox: {
    width: 20,
    height: 20,
    borderRadius: 3,
    backgroundColor: '#00B67A', // Trustpilot Green
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderAuthorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A8D9B',
  },
  loaderReviewHeadline: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  loaderReviewBody: {
    fontSize: 14,
    color: '#D0D0D5',
    lineHeight: 20.5,
  },

  // ── HEADER OFFERTA (STEP 13 - ESTILO BETTERME) ──
  headerOfferTimerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerOfferTimerLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  betterMeTimerWidget: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  timerDigitUnitCol: {
    alignItems: 'center',
    minWidth: 32,
  },
  betterMeTimerDigits: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 28,
    letterSpacing: 0.5,
  },
  betterMeTimerColon: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 26,
    marginHorizontal: 1,
  },
  betterMeTimerUnitText: {
    color: '#8A8D9B',
    fontSize: 9.5,
    fontWeight: '600',
    marginTop: 1,
    textTransform: 'lowercase',
  },
  headerOfferCtaBtn: {
    backgroundColor: '#EBE5D8',
    borderRadius: 22,
    paddingVertical: 9,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerOfferCtaText: {
    color: '#1C1C1E',
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  // ── STEP 13: OFFERTA MODELLATA BETTERME ──
  offerPageWrapper: {
    width: '100%',
    maxWidth: 1040,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 12,
  },
  offerHeadline: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 24,
    maxWidth: 620,
  },
  offerComparisonCard: {
    width: '100%',
    maxWidth: 680,
    backgroundColor: '#161922',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    marginBottom: 36,
  },
  offerComparisonTabsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  offerTabHalf: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  offerTabLabel: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#9E9E9E',
    letterSpacing: 0.5,
  },
  offerTabDividerVertical: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  offerAthleteImageWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#0F121A',
    overflow: 'hidden',
  },
  offerAthleteImage: {
    width: '100%',
    height: '100%',
  },
  offerMetricsComparisonRow: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#11141C',
  },
  offerMetricCol: {
    flex: 1,
  },
  offerMetricColDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 16,
  },
  offerMetricCategory: {
    color: '#8A8D9B',
    fontSize: 11.5,
    fontWeight: '700',
    marginBottom: 3,
  },
  offerMetricValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 6,
  },
  offerLevelBarRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  offerLevelSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  offerLevelSegmentActive: {
    backgroundColor: '#FFFFFF',
  },
  offerLevelSegmentActiveCream: {
    backgroundColor: '#EBE5D8',
  },

  // ── SEZIONE PREZZI & PIANI ──
  offerPricingSection: {
    width: '100%',
    maxWidth: 1040,
    alignItems: 'center',
    marginBottom: 44,
  },
  offerSectionTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 20,
  },

  // Grid Planos (Modelado fielmente ao BetterMe)
  pricingCardsGrid: {
    width: '100%',
    maxWidth: 1000,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    marginBottom: 28,
  },
  pricingCardsGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  pricingCardItem: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#222224',
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    justifyContent: 'space-between',
    minHeight: 270,
  },
  pricingCardItemDesktop: {
    flex: 1,
    minWidth: 260,
    maxWidth: 310,
  },
  cardTopContent: {
    width: '100%',
  },
  cardBottomContent: {
    width: '100%',
    marginTop: 'auto',
  },
  pricingCardPopular: {
    borderColor: '#EBE5D8',
    paddingTop: 36,
  },
  pricingCardItemSelected: {
    borderColor: '#EBE5D8',
  },
  popularTopBadge: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    backgroundColor: '#EBE5D8',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularTopBadgeText: {
    color: '#1C1C1E',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  pricingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pricingPlanName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  planRadioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#666666',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  planRadioCircleActive: {
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
  },
  planDurationBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  planDurationBadgeText: {
    color: '#A0A0A5',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  planTotalPriceText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  planDailyPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    marginBottom: 8,
  },
  planDailyPriceDigits: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  planDailySubText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
  },
  planGiftBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2A2A2E',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 14,
  },
  planGiftText: {
    color: '#B5B5BE',
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
  },

  offerPrimaryCtaBtn: {
    backgroundColor: '#EBE5D8',
    borderRadius: 34,
    paddingVertical: 18,
    paddingHorizontal: 48,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    marginTop: 18,
    marginBottom: 16,
  },
  offerPrimaryCtaText: {
    color: '#1C1C1E',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  subscriptionTermsBox: {
    width: '100%',
    maxWidth: 580,
    backgroundColor: '#0E1017',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  subscriptionTermsText: {
    color: '#8A8D9B',
    fontSize: 11.5,
    lineHeight: 17,
    textAlign: 'center',
  },
  securityBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  securityBadgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  securityBadgeText: {
    color: '#8A8D9B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  securityBrandBadge: {
    color: '#C0C0C8',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  // ── SEZIONE: COSA INCLUDE IL TUO PIANO (MODELLATO SU VERTICAM) ──
  offerWhatIncludesSection: {
    width: '100%',
    maxWidth: 1040,
    alignItems: 'center',
    marginBottom: 48,
    alignSelf: 'center',
  },
  screensShowcaseRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 16,
    marginTop: 24,
    marginBottom: 32,
  },
  screensShowcaseScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 14,
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  screenMockupCard: {
    width: 180,
    alignItems: 'center',
  },
  screenMockupCardMobile: {
    width: 165,
    alignItems: 'center',
  },
  // Nessuna ombra sul contenitore: su web shadow* diventa box-shadow rettangolare.
  phoneFrameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    backgroundColor: 'transparent',
  },
  phoneFrameHighlight: {
    zIndex: 2,
  },
  // Alone morbido e arrotondato dietro al telefono in evidenza
  phoneGlowBlob: {
    position: 'absolute',
    top: '6%',
    bottom: '6%',
    left: '4%',
    right: '4%',
    borderRadius: 999,
    backgroundColor: 'rgba(0, 229, 255, 0.45)',
    ...(Platform.OS === 'web' && {
      filter: 'blur(38px)',
    }),
    ...(Platform.OS !== 'web' && {
      shadowColor: '#00E5FF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 40,
      backgroundColor: 'rgba(0, 229, 255, 0.18)',
    }),
  },
  // Il drop-shadow segue la sagoma trasparente del PNG (niente rettangolo)
  phoneMockupImage: {
    width: 144,
    height: 270,
    ...(Platform.OS === 'web' && {
      filter: 'drop-shadow(0px 8px 14px rgba(0, 0, 0, 0.55))',
    }),
  },
  phoneMockupImageHighlight: {
    width: 152,
    height: 285,
    transform: [{ translateY: -6 }],
    ...(Platform.OS === 'web' && {
      filter: 'drop-shadow(0px 0px 4px rgba(0, 229, 255, 0.35))',
    }),
  },
  phoneMockupImageMobile: {
    width: 132,
    height: 248,
  },
  mockupCardTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 4,
    minHeight: 34,
  },
  mockupCardSubtitle: {
    color: '#8A8D9B',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  showcaseBottomBanner: {
    width: '100%',
    maxWidth: 760,
    backgroundColor: '#141721',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.28)',
    marginTop: 8,
  },
  showcaseBottomTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  showcaseBottomDesc: {
    color: '#A0A3BD',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },

  // ── SEZIONE: RE-PITCH RISULTATI ──
  rePitchSection: {
    width: '100%',
    maxWidth: 1040,
    alignItems: 'center',
    marginTop: 10,
  },
  guaranteeFinalBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.25)',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    maxWidth: 580,
    marginTop: 8,
  },
  guaranteeFinalTitle: {
    color: Colors.accentGreen,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  guaranteeFinalText: {
    color: '#C8E6C9',
    fontSize: 12.5,
    lineHeight: 18,
  },

  // ── FOOTER BETTERME ──
  betterMeFooter: {
    width: '100%',
    maxWidth: 620,
    alignItems: 'center',
    marginTop: 36,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  legalDisclaimer: {
    color: '#666666',
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginBottom: 4,
  },
  legalLink: {
    color: '#888888',
    textDecorationLine: 'underline',
  },
  readBeforeNotice: {
    color: '#555555',
    fontSize: 11,
  },
  floatingHelpBtn: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 99,
  },
  floatingHelpText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
});
