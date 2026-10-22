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
  PanResponder,
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
  const [selectedImpact, setSelectedImpact] = useState<string>('spike_over_block');
  const [trainingDays, setTrainingDays] = useState<string>('3-4');
  const [weight, setWeight] = useState<string>(String(userProfile.weightKg || 84));
  const [height, setHeight] = useState<string>(String(userProfile.heightCm || 192));

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

  // Countdown timer per offerta (Step 13 - 15 minuti)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(894);

  const analysisSteps = [
    'Analisi della curva di forza elastica e reattività...',
    'Valutazione del deficit EUR (Countermovement vs Squat Jump)...',
    'Calcolo del rischio di sovraccarico del tendine rotuleo...',
    'Configurazione del protocollo balistico autoregolato...',
    'Calcolo del potenziale di elevazione: +8.4 cm stimati!',
  ];

  // Loader automatico per Step 12
  useEffect(() => {
    if (currentStep === 12) {
      setAnalysisProgress(10);
      const interval = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setCurrentStep(13), 400);
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
      {/* ── TOP HEADER (ESTILO BETTERME: LOGO NA ESQUERDA, MENU CIRCULAR NA DIREITA) ── */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          {currentStep > 0 && currentStep !== 12 && (
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

            <View style={styles.optionsListWrap}>
              {[
                {
                  id: 'spike_over_block',
                  title: 'Schiacciare sopra il muro avversario',
                  desc: 'Palle imprendibili da posto 4, pipe e diagonali strette senza subire murate.',
                  tag: 'ATTACCO DOMINANTE',
                },
                {
                  id: 'block_roof',
                  title: 'Chiudere ogni varco a muro',
                  desc: 'Invadere lo spazio avversario sopra la rete e murare punto con sicurezza.',
                  tag: 'MURO INVALICABILE',
                },
                {
                  id: 'explosive_agility',
                  title: 'Sentirmi agile, leggero ed esplosivo',
                  desc: 'Piedi reattivi nei cambi di direzione, rincorsa fluida e decollo immediato.',
                  tag: 'DINAMISMO TOTALE',
                },
                {
                  id: 'pain_free_knees',
                  title: 'Saltare al massimo senza paura del tendine',
                  desc: 'Atterraggi morbidi e ginocchia protette senza dover convivere col dolore.',
                  tag: 'SALVAGUARDIA TENDINEA',
                },
              ].map((opt) => {
                const isSelected = selectedImpact === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.personaChoiceCard,
                      isSelected && styles.personaChoiceCardSelected,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => {
                      setSelectedImpact(opt.id);
                      setTimeout(() => handleNextStep(), 200);
                    }}
                  >
                    <View style={styles.personaCardHeader}>
                      <View style={styles.personaTag}>
                        <Text style={styles.personaTagText}>{opt.tag}</Text>
                      </View>
                      <View style={[styles.personaRadioCircle, isSelected && styles.personaRadioCircleActive]}>
                        {isSelected && <View style={styles.personaRadioInner} />}
                      </View>
                    </View>
                    <Text style={styles.personaCardTitle}>{opt.title}</Text>
                    <Text style={styles.personaCardDesc}>{opt.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 7 (6): CONSAPEVOLEZZA SOLUZIONE (COME FUNZIONA)
           ══════════════════════════════════════════════════════ */}
        {currentStep === 7 && (
          <View style={styles.stepContainer}>
            <View style={styles.aiBadge}>
              <Sparkles size={13} color={Colors.primary} />
              <Text style={styles.aiBadgeText}>TECNOLOGIA ESCLUSIVA VERTICAM</Text>
            </View>

            <Text style={styles.mainTitle}>COME FUNZIONA VERTICAM</Text>
            <Text style={styles.mainSubtitle}>
              INTELLIGENZA ARTIFICIALE + VISIONE COMPUTERIZZATA DALLA FOTOCAMERA
            </Text>

            <View style={styles.howItWorksCard}>
              <View style={styles.howItWorksImageWrap}>
                <Image
                  source={require('../../assets/proof-jump.webp')}
                  style={styles.howItWorksImage}
                  resizeMode="cover"
                />
              </View>

              <View style={styles.pillarsContainer}>
                <View style={styles.pillarItem}>
                  <View style={styles.pillarIconBox}>
                    <Zap size={18} color={Colors.primary} />
                  </View>
                  <View style={styles.pillarTextBox}>
                    <Text style={styles.pillarTitle}>1. Tracciamento Ottico al Millimetro</Text>
                    <Text style={styles.pillarDesc}>
                      Basta posizionare lo smartphone a terra. L'algoritmo rileva il tempo di volo e l'altezza dello stacco istantaneamente.
                    </Text>
                  </View>
                </View>

                <View style={styles.pillarItem}>
                  <View style={styles.pillarIconBox}>
                    <Activity size={18} color={Colors.primary} />
                  </View>
                  <View style={styles.pillarTextBox}>
                    <Text style={styles.pillarTitle}>2. Calibrazione Giornaliera con IA</Text>
                    <Text style={styles.pillarDesc}>
                      L'algoritmo valuta la freschezza del sistema nervoso e ricalcola i carichi quotidiani per evitare sovraccarichi al tendine.
                    </Text>
                  </View>
                </View>

                <View style={styles.pillarItem}>
                  <View style={styles.pillarIconBox}>
                    <Award size={18} color={Colors.primary} />
                  </View>
                  <View style={styles.pillarTextBox}>
                    <Text style={styles.pillarTitle}>3. Risultati Concreti e Dimostrati</Text>
                    <Text style={styles.pillarDesc}>
                      +8.4 cm di incremento medio registrati nei primi 60 giorni su giocatori di pallavolo e beach volley.
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
              <Text style={styles.continuePillText}>HO CAPITO, CONTINUA</Text>
              <View style={styles.startArrowCircle}>
                <ChevronRight size={18} color="#FFFFFF" strokeWidth={3} />
              </View>
            </TouchableOpacity>
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
              <Text style={styles.biometricCardLabel}>INSERISCI IL TUO PESO</Text>
              <View style={styles.inputWithUnitBox}>
                <TextInput
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  placeholder="84"
                  placeholderTextColor="#555555"
                  style={styles.bigHeroInput}
                />
                <Text style={styles.bigHeroUnit}>KG</Text>
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
              <Text style={styles.biometricCardLabel}>INSERISCI LA TUA ALTEZZA</Text>
              <View style={styles.inputWithUnitBox}>
                <TextInput
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  placeholder="192"
                  placeholderTextColor="#555555"
                  style={styles.bigHeroInput}
                />
                <Text style={styles.bigHeroUnit}>CM</Text>
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
            STEP 12 (10): CARICAMENTO & ANALISI IA (LOADER)
           ══════════════════════════════════════════════════════ */}
        {currentStep === 12 && (
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
            STEP 13 (11): OFFERTA & DIAGNOSTICA (LANDING PAGE)
           ══════════════════════════════════════════════════════ */}
        {currentStep === 13 && (
          <View style={styles.pitchContainer}>
            {/* Banner Urgenza con Countdown */}
            <View style={styles.urgencyBanner}>
              <Flame size={18} color="#FF9100" />
              <Text style={styles.urgencyBannerText}>
                OFFERTA DI BENVENUTO RISERVATA • SCONTO -57% VALIDO ANCORA PER:{' '}
                <Text style={styles.countdownTimer}>{formatCountdown(secondsRemaining)}</Text>
              </Text>
            </View>

            <Text style={styles.mainTitle}>IL TUO PIANO DI ELEVAZIONE È PRONTO</Text>
            <Text style={styles.mainSubtitle}>
              ANALISI COMPLETATA CON SUCCESSO SUI TUOI PARAMETRI BIOMETRICI
            </Text>

            <View style={styles.pitchContentCard}>
              {/* Gráfico Comparativo do Salto */}
              <View style={styles.pitchGraphRow}>
                <View style={styles.pitchGraphCol}>
                  <Text style={styles.pitchGraphNumber}>{currentJumpEstimated} cm</Text>
                  <View style={[styles.pitchGraphBar, { height: 110, backgroundColor: '#333846' }]} />
                  <Text style={styles.pitchGraphLabel}>Salto Attuale (Stima)</Text>
                </View>

                <View style={styles.pitchGraphCol}>
                  <View style={styles.gainTagFloating}>
                    <Text style={styles.gainTagFloatingText}>+{potentialGain.toFixed(1)} cm 🔥</Text>
                  </View>
                  <Text style={[styles.pitchGraphNumber, { color: Colors.primary }]}>
                    {potentialJumpProjected.toFixed(1)} cm
                  </Text>
                  <View style={[styles.pitchGraphBar, { height: 175, backgroundColor: Colors.primary }]} />
                  <Text style={[styles.pitchGraphLabel, { color: Colors.primary, fontWeight: '800' }]}>
                    Con VertiCam
                  </Text>
                </View>
              </View>

              {/* Box con stima di impatto a rete */}
              <View style={styles.netImpactBanner}>
                <Target size={20} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.netImpactTitle}>PUNTO D'IMPATTO A RETE PREVISTO</Text>
                  <Text style={styles.netImpactText}>
                    Altezza totale di attacco stimata: <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>{totalAttackReach} cm</Text> ({clearanceOverNet > 0 ? `+${clearanceOverNet} cm oltre l'asta ufficiale di rete` : 'piena elevazione'}).
                  </Text>
                </View>
              </View>

              {/* I 3 Pilastri del Metodo */}
              <View style={styles.methodPillarsBox}>
                <Text style={styles.methodPillarsHeading}>COSA COMPRENDE IL TUO PIANO PERSONALIZZATO:</Text>

                <View style={styles.methodPillarRow}>
                  <CheckCircle2 size={18} color={Colors.primary} />
                  <Text style={styles.methodPillarText}>
                    <Text style={{ fontWeight: '800', color: '#FFFFFF' }}>Pliometria Autoregolata da IA:</Text> Carichi giornalieri calibrati sul tuo stato di freschezza nervosa.
                  </Text>
                </View>

                <View style={styles.methodPillarRow}>
                  <CheckCircle2 size={18} color={Colors.primary} />
                  <Text style={styles.methodPillarText}>
                    <Text style={{ fontWeight: '800', color: '#FFFFFF' }}>Protocollo Tendineo Isocinetico:</Text> Rinforzo del tendine rotuleo per saltare al 100% senza dolori.
                  </Text>
                </View>

                <View style={styles.methodPillarRow}>
                  <CheckCircle2 size={18} color={Colors.primary} />
                  <Text style={styles.methodPillarText}>
                    <Text style={{ fontWeight: '800', color: '#FFFFFF' }}>Feedback Ottico via Fotocamera:</Text> Misurazione in tempo reale di ogni salto senza sensori esterni.
                  </Text>
                </View>
              </View>

              {/* Box di Prezzo con Ancoraggio e Garanzia */}
              <View style={styles.pitchPricingBox}>
                <View style={styles.pitchBestBadge}>
                  <Text style={styles.pitchBestBadgeText}>PIÙ SCELTO DAGLI ATLETI • RISPARMI IL 57%</Text>
                </View>
                <View style={styles.priceComparisonRow}>
                  <Text style={styles.priceOldStrikethrough}>349,00 €</Text>
                  <Text style={styles.pitchPriceBig}>149,00 € <Text style={styles.pitchPeriod}>/ anno</Text></Text>
                </View>
                <Text style={styles.pitchPriceSub}>Equivalente a soli ~12,40 € al mese (meno di un caffè a settimana)</Text>

                <View style={styles.guaranteeRow}>
                  <ShieldCheck size={22} color={Colors.accentGreen} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.guaranteeTitle}>GARANZIA 100% SODDISFATTI O RIMBORSATI</Text>
                    <Text style={styles.guaranteeText}>
                      Se nei primi 14 giorni non misuri un aumento concreto del tuo salto o non sei pienamente soddisfatto, ti rimborsiamo l'intero importo. Senza domande.
                    </Text>
                  </View>
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
                  <Lock size={18} color="#000000" />
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

              {/* Recensioni Reali e Prova Sociale */}
              <View style={styles.socialProofSection}>
                <Text style={styles.socialProofHeading}>COSA DICONO GLI ATLETI CHE LO USANO:</Text>

                <View style={styles.testimonialCard}>
                  <View style={styles.testimonialHeader}>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={14} color="#FFD700" fill="#FFD700" />
                      ))}
                    </View>
                    <Text style={styles.testimonialGain}>+10.2 cm in 8 settimane</Text>
                  </View>
                  <Text style={styles.testimonialText}>
                    "Ero scettico all'inizio, ma il feedback con la fotocamera cambia tutto. Sapere esattamente quanto stacchi ogni giorno ti costringe a spingere al massimo. Ora passo sopra il muro con facilità."
                  </Text>
                  <Text style={styles.testimonialAuthor}>Marco T. • Schiacciatore (Serie B)</Text>
                </View>

                <View style={styles.testimonialCard}>
                  <View style={styles.testimonialHeader}>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={14} color="#FFD700" fill="#FFD700" />
                      ))}
                    </View>
                    <Text style={styles.testimonialGain}>+7.8 cm • Zero dolori</Text>
                  </View>
                  <Text style={styles.testimonialText}>
                    "Convivovo con la tendinite rotulea da due anni. L'algoritmo di VertiCam mi ha fatto recuperare reattività elastica proteggendo i tendini. Il miglior programma di salto mai provato."
                  </Text>
                  <Text style={styles.testimonialAuthor}>Giulia B. • Centrale (Serie C)</Text>
                </View>
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

      {/* Floating Help Button */}
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
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
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

  // ── PERSONAS CARD (STEP 6 / 5) ──
  personaChoiceCard: {
    backgroundColor: '#161922',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  personaChoiceCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
  },
  personaCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  personaTag: {
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  personaTagText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  personaRadioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#444444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  personaRadioCircleActive: {
    borderColor: Colors.primary,
  },
  personaRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  personaCardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  personaCardDesc: {
    color: '#9E9E9E',
    fontSize: 14,
    lineHeight: 20,
  },

  // ── HOW IT WORKS CARD (STEP 7 / 6) ──
  howItWorksCard: {
    width: '100%',
    maxWidth: 620,
    backgroundColor: '#161922',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 24,
  },
  howItWorksImageWrap: {
    width: '100%',
    height: 220,
    backgroundColor: '#0F121B',
  },
  howItWorksImage: {
    width: '100%',
    height: '100%',
  },
  pillarsContainer: {
    padding: 20,
    gap: 16,
  },
  pillarItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  pillarIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  pillarTextBox: {
    flex: 1,
  },
  pillarTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  pillarDesc: {
    color: '#9E9E9E',
    fontSize: 13,
    lineHeight: 19,
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
    borderRadius: 22,
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  biometricCardLabel: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  inputWithUnitBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0C12',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 20,
    minWidth: 220,
  },
  bigHeroInput: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    minWidth: 100,
  },
  bigHeroUnit: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primary,
    marginLeft: 8,
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

  // ── STEP 12: LOADER BETTERME ──
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

  // ── STEP 13: LANDING PAGE DI VENDITA & DIAGNOSI ──
  pitchContainer: {
    width: '100%',
    maxWidth: 780,
    alignItems: 'center',
  },
  urgencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 145, 0, 0.12)',
    borderWidth: 1,
    borderColor: '#FF9100',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
  },
  urgencyBannerText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  countdownTimer: {
    color: '#FF9100',
    fontWeight: '900',
    fontSize: 14,
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
    height: 210,
    marginBottom: 24,
  },
  pitchGraphCol: {
    alignItems: 'center',
    width: 110,
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
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6,
  },
  pitchGraphBar: {
    width: '100%',
    borderRadius: 10,
    marginBottom: 8,
  },
  pitchGraphLabel: {
    color: '#888888',
    fontSize: 13,
    textAlign: 'center',
  },
  netImpactBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  netImpactTitle: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  netImpactText: {
    color: '#CCCCCC',
    fontSize: 13.5,
    lineHeight: 19,
  },
  methodPillarsBox: {
    backgroundColor: '#0F121B',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    gap: 12,
  },
  methodPillarsHeading: {
    color: '#888888',
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  methodPillarRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  methodPillarText: {
    color: '#B0BEC5',
    fontSize: 13.5,
    lineHeight: 19,
    flex: 1,
  },
  pitchPricingBox: {
    backgroundColor: '#0D0F17',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    marginBottom: 28,
  },
  pitchBestBadge: {
    backgroundColor: Colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  pitchBestBadgeText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  priceComparisonRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  priceOldStrikethrough: {
    color: '#777777',
    fontSize: 22,
    fontWeight: '700',
    textDecorationLine: 'line-through',
  },
  pitchPriceBig: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '900',
  },
  pitchPeriod: {
    fontSize: 16,
    color: '#9E9E9E',
    fontWeight: '600',
  },
  pitchPriceSub: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(0, 230, 118, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.25)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    width: '100%',
  },
  guaranteeTitle: {
    color: Colors.accentGreen,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  guaranteeText: {
    color: '#C8E6C9',
    fontSize: 12.5,
    lineHeight: 18,
  },
  pitchCtaBtn: {
    width: '100%',
    height: 60,
    backgroundColor: Colors.primary,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  pitchCtaText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  testCameraFirstBtn: {
    marginTop: 14,
    paddingVertical: 6,
  },
  testCameraFirstText: {
    color: '#888888',
    fontSize: 13.5,
    textDecorationLine: 'underline',
  },
  socialProofSection: {
    gap: 14,
  },
  socialProofHeading: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
    textAlign: 'center',
  },
  testimonialCard: {
    backgroundColor: '#0F121B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  testimonialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 3,
  },
  testimonialGain: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  testimonialText: {
    color: '#DDDDDD',
    fontSize: 13.5,
    lineHeight: 19,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  testimonialAuthor: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '700',
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
