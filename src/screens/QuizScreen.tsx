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
  imageUri: string;
}

export const QuizScreen: React.FC = () => {
  const { userProfile, updateProfile, navigate, setSubscribed } = useApp();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  // Current Funnel Step:
  // 0: Apenas Prova Social embaixo da Headline + Botão COMEÇAR
  // 1: Ti alleni già per aumentare l'elevazione? (Pergunta 1 do usuário)
  // 2: Scegli la tua età (Exatamente a tela BetterMe da foto!)
  // 3: Sport & Ruolo
  // 4: Ostacolo principale / frustrazione
  // 5: Obiettivo di salto nei prossimi 60 giorni
  // 6: Parametri fisici (Altezza, Peso)
  // 7: Analisi Algoritmo IA (Loader BetterMe)
  // 8: Offerta / Diagnosi Personalizzata (Sales Pitch)
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Form State
  const [alreadyTrains, setAlreadyTrains] = useState<string>('stuck');
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
    if (currentStep === 7) {
      const interval = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setCurrentStep(8), 400);
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
    if (currentStep > 0 && currentStep !== 7) {
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
    if (ageRange === '18-29') ageNum = 23;
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

    setCurrentStep(7); // Trigger AI Analysis Loader
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
                  source={{ uri: opt.imageUri }}
                  style={styles.cardImage}
                  resizeMode="cover"
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
          {currentStep > 0 && currentStep !== 7 && (
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

            {/* ── APENAS UMA PROVA SOCIAL EMBAIXO DA HEADLINE ── */}
            <View style={styles.singleProofCard}>
              <View style={styles.singleProofTop}>
                <View style={styles.proofAvatarCircle}>
                  <Text style={styles.proofAvatarText}>F</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.proofStarsRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} color="#FBBF24" fill="#FBBF24" />
                    ))}
                    <Text style={styles.proofScoreText}>4.9/5 • Atleta Verificato</Text>
                  </View>
                  <Text style={styles.proofAuthorText}>
                    Filippo R. <Text style={{ color: '#9E9E9E', fontWeight: '400' }}>(Schiacciatore Serie B - 23 anni)</Text>
                  </Text>
                </View>

                <View style={styles.proofGainBadge}>
                  <Text style={styles.proofGainBadgeText}>+9.2 cm</Text>
                </View>
              </View>

              <Text style={styles.singleProofQuote}>
                "Ero fermo a 56 cm da oltre un anno. La misurazione quotidiana con la fotocamera e l'autoregolazione sulle zone di prontezza mi hanno fatto toccare 65.2 cm in 8 settimane, senza mai più dolore alle ginocchia!"
              </Text>

              <View style={styles.singleProofStatRow}>
                <View style={styles.statMiniItem}>
                  <Text style={styles.statMiniNumber}>+8.4 cm</Text>
                  <Text style={styles.statMiniLabel}>Aumento medio in 8 sett.</Text>
                </View>
                <View style={styles.statMiniDivider} />
                <View style={styles.statMiniItem}>
                  <Text style={styles.statMiniNumber}>94.2%</Text>
                  <Text style={styles.statMiniLabel}>Nuovo record personale</Text>
                </View>
                <View style={styles.statMiniDivider} />
                <View style={styles.statMiniItem}>
                  <Text style={styles.statMiniNumber}>0 Dolori</Text>
                  <Text style={styles.statMiniLabel}>Tendine rotuleo protetto</Text>
                </View>
              </View>
            </View>

            {/* ── BOTÃO ESCRITO COMEÇAR ── */}
            <TouchableOpacity
              style={styles.startPillButton}
              activeOpacity={0.88}
              onPress={() => setCurrentStep(1)}
            >
              <Text style={styles.startPillButtonText}>COMEÇAR</Text>
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
            STEP 1: PERGUNTA 1 (OBRIGATÓRIA DO USUÁRIO)
            "Você já faz treinos de impulsão?"
           ══════════════════════════════════════════════════════ */}
        {currentStep === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.mainTitle}>PIANO DI ALLENAMENTO ELEVAZIONE & SALTO</Text>
            <Text style={styles.mainSubtitle}>TI ALLENI GIÀ PER AUMENTARE L'ELEVAZIONE?</Text>

            {renderBetterMeCards(
              [
                {
                  id: 'stuck',
                  pillTitle: 'Bloccato nello stallo',
                  imageUri: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
                },
                {
                  id: 'knee_pain',
                  pillTitle: 'Dolori al tendine',
                  imageUri: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&w=600&q=80',
                },
                {
                  id: 'random',
                  pillTitle: 'Esercizi a caso',
                  imageUri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
                },
                {
                  id: 'beginner',
                  pillTitle: 'Inizio da zero',
                  imageUri: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80',
                },
              ],
              alreadyTrains,
              (id) => {
                setAlreadyTrains(id);
                setTimeout(() => handleNextStep(), 200);
              }
            )}
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 2: FAIXA ETÁRIA (EXATAMENTE COMO NO SCREENSHOT BETTERME!)
           ══════════════════════════════════════════════════════ */}
        {currentStep === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.mainTitle}>PIANO DI ALLENAMENTO ELEVAZIONE & SALTO</Text>
            <Text style={styles.mainSubtitle}>ESCOLHA A SUA IDADE / SCEGLI LA TUA ETÀ</Text>

            {renderBetterMeCards(
              [
                {
                  id: '18-29',
                  pillTitle: 'Idade: 18–29',
                  imageUri: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80',
                },
                {
                  id: '30-39',
                  pillTitle: 'Idade: 30–39',
                  imageUri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
                },
                {
                  id: '40-49',
                  pillTitle: 'Idade: 40–49',
                  imageUri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
                },
                {
                  id: '50+',
                  pillTitle: 'Idade: 50+',
                  imageUri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
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
            STEP 3: SPORT & RUOLO
           ══════════════════════════════════════════════════════ */}
        {currentStep === 3 && (
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
            STEP 4: OSTACOLO PRINCIPALE / FRUSTRAZIONE
           ══════════════════════════════════════════════════════ */}
        {currentStep === 4 && (
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
            STEP 5: OBIETTIVO DI SALTO (60 GIORNI)
           ══════════════════════════════════════════════════════ */}
        {currentStep === 5 && (
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
            STEP 6: PARAMETRI FISICI (ALTEZZA & PESO)
           ══════════════════════════════════════════════════════ */}
        {currentStep === 6 && (
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
            STEP 7: ANALISI ALGORITMO IA (LOADER BETTERME)
           ══════════════════════════════════════════════════════ */}
        {currentStep === 7 && (
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
            STEP 8: OFFERTA & DIAGNOSI (PITCH BETTERME)
           ══════════════════════════════════════════════════════ */}
        {currentStep === 8 && (
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
            Ao escolher sua opção e continuar, você concorda com nossos{' '}
            <Text style={styles.legalLink}>Termos de Serviço</Text> |{' '}
            <Text style={styles.legalLink}>Política de Privacidade</Text>
          </Text>
          <Text style={styles.readBeforeNotice}>Leia antes de continuar</Text>
        </View>
      </ScrollView>

      {/* Floating Help Button (Bottom-Right, exactly like BetterMe screenshot) */}
      <TouchableOpacity style={styles.floatingHelpBtn} activeOpacity={0.8}>
        <HelpCircle size={15} color="#000000" />
        <Text style={styles.floatingHelpText}>Ajuda</Text>
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
    fontSize: 22,
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
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: 8,
  },
  mainSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9E9E9E',
    letterSpacing: 2,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 24,
  },

  // ── STEP 0: CARD DE PROVA SOCIAL INDIVIDUAL ──
  singleProofCard: {
    width: '100%',
    maxWidth: 640,
    backgroundColor: '#161922',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    borderRadius: 22,
    padding: 22,
    marginBottom: 26,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
  },
  singleProofTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  proofAvatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proofAvatarText: {
    color: '#080C14',
    fontSize: 16,
    fontWeight: '900',
  },
  proofStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 3,
  },
  proofScoreText: {
    color: '#CCCCCC',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  proofAuthorText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  proofGainBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  proofGainBadgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  singleProofQuote: {
    color: '#D1D5DB',
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  singleProofStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0C0E14',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statMiniItem: {
    flex: 1,
    alignItems: 'center',
  },
  statMiniNumber: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 2,
  },
  statMiniLabel: {
    color: '#888888',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  statMiniDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  // ── BOTÃO COMEÇAR (ESTILO BETTERME PILL) ──
  startPillButton: {
    width: '100%',
    maxWidth: 360,
    height: 56,
    backgroundColor: '#F3F4ED', // O tom creme BetterMe
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  startPillButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  startArrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startFootnote: {
    color: '#666666',
    fontSize: 11,
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
    height: 330,
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
    width: 240,
    height: 330,
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
    height: 48,
    backgroundColor: '#F3F4ED', // O tom exato off-white / creme do BetterMe
    borderRadius: 14,
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
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
    marginRight: 6,
  },
  cardArrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
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
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  betterMeInput: {
    height: 56,
    backgroundColor: '#161922',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 18,
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  reachEstimateBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  reachEstimateText: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  continuePillBtn: {
    height: 54,
    backgroundColor: '#F3F4ED',
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  continuePillText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
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
    fontSize: 42,
    fontWeight: '900',
    color: Colors.primary,
    marginVertical: 14,
  },
  loadingStatusText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    minHeight: 40,
  },
  trackLoading: {
    width: '100%',
    height: 8,
    backgroundColor: '#0A0C12',
    borderRadius: 4,
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
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  gainTagFloatingText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  pitchGraphNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  pitchGraphBar: {
    width: 64,
    borderRadius: 8,
  },
  pitchGraphLabel: {
    color: '#9E9E9E',
    fontSize: 11,
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
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  pitchBestBadgeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  pitchPriceBig: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  pitchPeriod: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9E9E9E',
  },
  pitchPriceSub: {
    color: '#9E9E9E',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    padding: 10,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
  },
  guaranteeText: {
    color: Colors.accentGreen,
    fontSize: 11,
    fontWeight: '700',
  },
  pitchCtaBtn: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F3F4ED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  pitchCtaText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  testCameraFirstBtn: {
    paddingVertical: 8,
  },
  testCameraFirstText: {
    color: '#9E9E9E',
    fontSize: 12,
    fontWeight: '600',
  },

  // ── FOOTER LEGAL BETTERME ──
  betterMeFooter: {
    marginTop: 48,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  legalDisclaimer: {
    color: '#777777',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  legalLink: {
    color: '#AAAAAA',
    textDecorationLine: 'underline',
  },
  readBeforeNotice: {
    color: '#555555',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },

  // ── FLOATING AJUDA BUTTON (BOTÃO DIREITA INFERIOR) ──
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
    zIndex: 999,
  },
  floatingHelpText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
});
