import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Activity,
  ShieldAlert,
  Flame,
  Zap,
  TrendingUp,
  Star,
  ShieldCheck,
  Check,
  Sparkles,
  Lock,
  Camera,
  Play,
  Award,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { VertiCamLogo } from '../components/VertiCamLogo';
import { useApp } from '../context/AppContext';
import { VolleyballPosition, ExperienceLevel, AthleteGoal } from '../types';
import { estimateStandingReach } from '../utils/jumpPhysics';

export const QuizScreen: React.FC = () => {
  const { userProfile, updateProfile, navigate, setSubscribed } = useApp();

  // Current Funnel Step:
  // 0: Hook & Promise + Proof
  // 1: Pergunta 1 - Você já faz treinos de impulsão?
  // 2: Pergunta 2 - Frustração / Obstáculo
  // 3: Insight Científico (Quebra de Padrão SNC)
  // 4: Pergunta 3 - Esporte & Posição
  // 5: Pergunta 4 - Parâmetros Físicos
  // 6: Pergunta 5 - Meta de salto nos próximos 60 dias
  // 7: Pergunta 6 - Compromisso com o método
  // 8: Análise do Algoritmo da IA (Loader)
  // 9: Oferta / Página de Vendas com Diagnóstico Personalizado
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [alreadyTrains, setAlreadyTrains] = useState<string>('stuck');
  const [mainFrustration, setMainFrustration] = useState<string>('plateau');
  const [selectedSport, setSelectedSport] = useState<string>('volley_outside');
  const [selectedLevel, setSelectedLevel] = useState<ExperienceLevel>('intermediate');
  const [age, setAge] = useState<string>(String(userProfile.age || 22));
  const [height, setHeight] = useState<string>(String(userProfile.heightCm || 192));
  const [weight, setWeight] = useState<string>(String(userProfile.weightKg || 84));
  const [targetGain, setTargetGain] = useState<string>('gain_8_12');
  const [commitment, setCommitment] = useState<string>('yes_100');

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
    if (currentStep === 8) {
      const interval = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setCurrentStep(9), 400);
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

  const handleNext = async () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 7) {
      // Save profile
      const heightNum = parseFloat(height) || 192;
      const calculatedStandingReach = estimateStandingReach(heightNum);

      let pos: VolleyballPosition = 'outside';
      if (selectedSport.includes('outside')) pos = 'outside';
      else if (selectedSport.includes('opposite')) pos = 'opposite';
      else if (selectedSport.includes('middle')) pos = 'middle';
      else if (selectedSport.includes('setter')) pos = 'setter';
      else if (selectedSport.includes('beach')) pos = 'beach';

      await updateProfile({
        position: pos,
        level: selectedLevel,
        age: parseInt(age, 10) || 22,
        heightCm: heightNum,
        weightKg: parseFloat(weight) || 84,
        standingReachCm: calculatedStandingReach,
        goals: ['higher_jump', 'jumper_knee'],
      });

      setCurrentStep(8); // Go to AI analysis animation
    }
  };

  const handleBack = () => {
    if (currentStep > 1 && currentStep !== 8) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('Welcome');
    }
  };

  const handleActivatePro = () => {
    setSubscribed(true);
    navigate('Dashboard');
  };

  const handleTryCameraFirst = () => {
    navigate('CameraIntro');
  };

  const heightNum = parseFloat(height) || 192;
  const currentJumpEstimated = 54;
  const potentialJumpProjected = 62.5;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      {currentStep !== 8 && (
        <Header
          showBack
          onBack={handleBack}
          title={
            currentStep === 0
              ? 'Valutazione Gratuita'
              : currentStep === 9
              ? 'Il Tuo Piano VertiCam'
              : `Passo ${currentStep} di 7`
          }
        />
      )}

      {/* Progress Bar (Visible during questions 1-7) */}
      {currentStep >= 1 && currentStep <= 7 && (
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${(currentStep / 7) * 100}%` }]} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ══════════════════════════════════════════════════════
            STEP 0: HOOK & PROMESSA + PROVA INCONTESTABILE
           ══════════════════════════════════════════════════════ */}
        {currentStep === 0 && (
          <View style={styles.hookContainer}>
            <View style={styles.badgeWrapper}>
              <View style={styles.techBadge}>
                <Sparkles size={13} color={Colors.primary} />
                <Text style={styles.techBadgeText}>TEST DI ELEVAZIONE & AI VISION</Text>
              </View>
            </View>

            {/* Headline Principal da Promessa */}
            <Text style={styles.promiseHeadline}>
              Rispondi al test per iniziare il tuo{'\n'}
              <Text style={styles.promiseHeadlineHighlight}>allenamento personalizzato</Text>
            </Text>

            <Text style={styles.promiseSubtitle}>
              Valuta il tuo potenziale atletico in 90 secondi e scopri il metodo biomeccanico autoregolato per guadagnare da <Text style={{ color: Colors.primary, fontWeight: '800' }}>+6 a +10 cm</Text> di salto verticale, proteggendo i tendini rotulei.
            </Text>

            {/* ── CARD DE PROVA REAL / MÉTRICAS COMPROVADAS ── */}
            <View style={styles.proofCard}>
              <View style={styles.proofHeader}>
                <Award size={18} color={Colors.primary} />
                <Text style={styles.proofHeaderText}>RISULTATI COMPROVATI DAGLI ATLETI</Text>
              </View>

              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricBig}>+8.4 cm</Text>
                  <Text style={styles.metricLabel}>Aumento medio in 8 settimane</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricBig}>94.2%</Text>
                  <Text style={styles.metricLabel}>Nuovo record personale di salto</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricBig}>0 Infortuni</Text>
                  <Text style={styles.metricLabel}>-89% fastidi al tendine rotuleo</Text>
                </View>
              </View>

              {/* Comparativo de Método: Convencional vs VertiCam */}
              <View style={styles.comparisonBox}>
                <View style={styles.comparisonColBad}>
                  <Text style={styles.compBadTitle}>❌ Allenamento Comune</Text>
                  <Text style={styles.compDesc}>Squat pesanti alla cieca, salto bloccato per stanchezza del SNC e tendinopatia cronica.</Text>
                </View>
                <View style={styles.comparisonDivider} />
                <View style={styles.comparisonColGood}>
                  <Text style={styles.compGoodTitle}>⚡ Metodo VertiCam</Text>
                  <Text style={styles.compDesc}>Misura la prontezza giornaliera con la fotocamera e allena solo le fibre veloci al momento giusto.</Text>
                </View>
              </View>
            </View>

            {/* ── DEPOIMENTOS REAIS (SOCIAL PROOF) ── */}
            <View style={styles.testimonialsSection}>
              <Text style={styles.testimHeading}>Cosa dicono i nostri atleti in Italia:</Text>

              {/* Depoimento 1 */}
              <View style={styles.testimCard}>
                <View style={styles.testimTop}>
                  <View style={styles.avatarMini}>
                    <Text style={styles.avatarMiniText}>F</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.testimName}>Filippo R. (Schiacciatore Serie B - 23 anni)</Text>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={13} color="#FBBF24" fill="#FBBF24" />
                      ))}
                      <Text style={styles.verifiedText}>• Misurazione Verificata</Text>
                    </View>
                  </View>
                  <View style={styles.gainPill}>
                    <Text style={styles.gainPillText}>+9.2 cm</Text>
                  </View>
                </View>
                <Text style={styles.testimQuote}>
                  "Ero fermo a 56 cm da oltre un anno. La misurazione quotidiana con la fotocamera mi ha fatto capire che mi allenavo troppo stanco. Con i carichi autoregolati ho toccato 65.2 cm senza alcun fastidio al ginocchio!"
                </Text>
              </View>

              {/* Depoimento 2 */}
              <View style={styles.testimCard}>
                <View style={styles.testimTop}>
                  <View style={styles.avatarMini}>
                    <Text style={styles.avatarMiniText}>M</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.testimName}>Matteo B. (Basket Serie C - 25 anni)</Text>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={13} color="#FBBF24" fill="#FBBF24" />
                      ))}
                      <Text style={styles.verifiedText}>• Misurazione Verificata</Text>
                    </View>
                  </View>
                  <View style={styles.gainPill}>
                    <Text style={styles.gainPillText}>+7.8 cm</Text>
                  </View>
                </View>
                <Text style={styles.testimQuote}>
                  "Il protocollo isometrico per i tendini mi ha salvato la stagione. Ora schiaccio a due mani con estrema naturalezza."
                </Text>
              </View>
            </View>

            {/* CTA do Passo 0 */}
            <View style={styles.step0Cta}>
              <Button
                title="Inizia il Test Gratuito (1 min)"
                variant="primary"
                size="large"
                onPress={() => setCurrentStep(1)}
                icon={<ArrowRight size={20} color="#080C14" strokeWidth={3} />}
              />
              <Text style={styles.step0Footnote}>
                🔒 Nessun sensore da comprare • Test 100% scientifico via fotocamera
              </Text>
            </View>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 1: PERGUNTA 1 (OBRIGATÓRIA)
            "Você já faz treinos de impulsão?"
           ══════════════════════════════════════════════════════ */}
        {currentStep === 1 && (
          <View>
            <View style={styles.questionBadge}>
              <Text style={styles.questionBadgeText}>DOMANDA 1 DI 6</Text>
            </View>
            <Text style={styles.stepTitle}>Ti alleni già per aumentare l'elevazione?</Text>
            <Text style={styles.stepSubtitle}>
              Capire il tuo punto di partenza ci permette di impostare il volume e il recupero neuromuscolare ideale.
            </Text>

            <View style={styles.listContainer}>
              {[
                {
                  id: 'stuck',
                  icon: '🛑',
                  title: 'Sì, ma ho raggiunto un punto di stallo',
                  desc: 'Mi alleno costantemente ma il mio salto non aumenta più di un singolo centimetro.',
                },
                {
                  id: 'knee_pain',
                  icon: '⚠️',
                  title: 'Sì, ma sento dolori o fastidi alle ginocchia',
                  desc: 'I tendini rotulei o le articolazioni mi fanno male dopo le sessioni di salto o le partite.',
                },
                {
                  id: 'random',
                  icon: '🔄',
                  title: 'Sì, ma faccio salti o esercizi a caso',
                  desc: 'Seguo routine trovate online o sui social senza una vera periodizzazione scientifica.',
                },
                {
                  id: 'beginner',
                  icon: '🚀',
                  title: 'No, voglio iniziare da zero nel modo corretto',
                  desc: 'Voglio un metodo professionale sicuro che mi garantisca risultati fin dalla prima settimana.',
                },
              ].map((item) => {
                const isSelected = alreadyTrains === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                    onPress={() => {
                      setAlreadyTrains(item.id);
                      setTimeout(() => setCurrentStep(2), 200);
                    }}
                  >
                    <View style={styles.optionHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                        <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                        <Text style={[styles.optionTitle, isSelected && styles.textSelected]}>
                          {item.title}
                        </Text>
                      </View>
                      {isSelected ? (
                        <CheckCircle2 size={20} color={Colors.primary} />
                      ) : (
                        <Circle size={20} color={Colors.textMuted} />
                      )}
                    </View>
                    <Text style={styles.optionDesc}>{item.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 2: PERGUNTA 2 (CONSCIÊNCIA DO PROBLEMA / FRUSTRAÇÃO)
           ══════════════════════════════════════════════════════ */}
        {currentStep === 2 && (
          <View>
            <View style={styles.questionBadge}>
              <Text style={styles.questionBadgeText}>DOMANDA 2 DI 6</Text>
            </View>
            <Text style={styles.stepTitle}>Qual è la tua maggiore frustrazione quando giochi?</Text>
            <Text style={styles.stepSubtitle}>
              Identificare la causa primaria sblocca l'adattamento corretto delle fibre rapide.
            </Text>

            <View style={styles.listContainer}>
              {[
                {
                  id: 'blocked',
                  icon: '🏐',
                  title: 'Vedere gli avversari saltare più in alto o murarmi',
                  desc: 'La sensazione di non raggiungere l\'altezza desiderata sopra la rete o il canestro.',
                },
                {
                  id: 'plateau',
                  icon: '📉',
                  title: 'Fare squat pesanti in palestra senza guadagnare salto',
                  desc: 'La forza statica non si trasferisce alla velocità e reattività elastica dello stacco.',
                },
                {
                  id: 'knee_fear',
                  icon: '🩹',
                  title: 'La paura di infiammare il tendine rotuleo',
                  desc: 'Non riesco a spingere al 100% nello stacco per timore di riacutizzare il dolore.',
                },
                {
                  id: 'no_data',
                  icon: '❓',
                  title: 'Non avere modo di misurare i centimetri reali',
                  desc: 'Non so se sto migliorando, peggiorando o solo accumulando fatica inutile.',
                },
              ].map((item) => {
                const isSelected = mainFrustration === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                    onPress={() => {
                      setMainFrustration(item.id);
                      setTimeout(() => setCurrentStep(3), 200);
                    }}
                  >
                    <View style={styles.optionHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                        <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                        <Text style={[styles.optionTitle, isSelected && styles.textSelected]}>
                          {item.title}
                        </Text>
                      </View>
                      {isSelected ? (
                        <CheckCircle2 size={20} color={Colors.primary} />
                      ) : (
                        <Circle size={20} color={Colors.textMuted} />
                      )}
                    </View>
                    <Text style={styles.optionDesc}>{item.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 3: MICRO-BREAK PSICOLÓGICO (O INSIGHT CIENTÍFICO)
           ══════════════════════════════════════════════════════ */}
        {currentStep === 3 && (
          <View style={styles.insightContainer}>
            <View style={styles.insightBadge}>
              <Zap size={14} color={Colors.primary} />
              <Text style={styles.insightBadgeText}>SCOPERTA BIOMECCANICA</Text>
            </View>

            <Text style={styles.insightHeadline}>
              Perché il 90% degli atleti fallisce nell'aumentare il proprio salto?
            </Text>

            <View style={styles.insightCard}>
              <Text style={styles.insightBody}>
                La scienza dimostra che le fibre a contrazione rapida e i tendini richiedono la <Text style={{ color: Colors.primary, fontWeight: '800' }}>massima freschezza neurale</Text> per adattarsi.{'\n\n'}
                Se ti alleni duramente quando il tuo <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>Sistema Nervoso Centrale (SNC)</Text> è affaticato anche solo del 6%, il corpo attiva compensazioni lente e scarica l'impatto sui tendini rotulei, causando il fastidioso "Ginocchio del saltatore".
              </Text>

              <View style={styles.solutionHighlight}>
                <CheckCircle2 size={18} color={Colors.accentGreen} />
                <Text style={styles.solutionText}>
                  <Text style={{ color: Colors.accentGreen, fontWeight: '800' }}>La soluzione VertiCam:</Text> Prima di iniziare la sessione, esegui 2 salti liberi davanti alla fotocamera. L'algoritmo calcola la tua prontezza reale e autoregola i carichi per farti saltare di più senza rischio.
                </Text>
              </View>
            </View>

            <Button
              title="Ho capito, continuiamo →"
              variant="primary"
              size="large"
              onPress={() => setCurrentStep(4)}
            />
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 4: PERGUNTA 3 (ESPORTE & POSIÇÃO)
           ══════════════════════════════════════════════════════ */}
        {currentStep === 4 && (
          <View>
            <View style={styles.questionBadge}>
              <Text style={styles.questionBadgeText}>DOMANDA 3 DI 6</Text>
            </View>
            <Text style={styles.stepTitle}>In quale sport e ruolo vuoi dominare l'elevazione?</Text>
            <Text style={styles.stepSubtitle}>
              Adatteremo la traiettoria balistica e la reattività alla specificità del tuo gioco.
            </Text>

            <View style={styles.listContainer}>
              {[
                {
                  id: 'volley_outside',
                  title: 'Pallavolo — Schiacciatore (Banda)',
                  desc: 'Rincorsa d\'attacco dinamica, stacco potente e capacità di superare muri alti.',
                },
                {
                  id: 'volley_opposite',
                  title: 'Pallavolo — Opposto / Centrale',
                  desc: 'Muro esplosivo a tempo zero e attacchi potenti da prima e seconda linea.',
                },
                {
                  id: 'volley_setter',
                  title: 'Pallavolo — Palleggiatore / Libero / Beach',
                  desc: 'Reattività fulminea sui cambi di direzione e stacco per il palleggio in salto.',
                },
                {
                  id: 'basketball',
                  title: 'Pallacanestro — Guardia / Playmaker / Ala',
                  desc: 'Stacco a uno o due piedi per la schiacciata, rimbalzo dominante e stoppata.',
                },
                {
                  id: 'other',
                  title: 'Altro Sport Dinamico (Calcio, Atletica, Calisthenics)',
                  desc: 'Massima potenza esplosiva e stacco da terra senza sovraccarichi inutili.',
                },
              ].map((item) => {
                const isSelected = selectedSport === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                    onPress={() => {
                      setSelectedSport(item.id);
                      setTimeout(() => setCurrentStep(5), 200);
                    }}
                  >
                    <View style={styles.optionHeader}>
                      <Text style={[styles.optionTitle, isSelected && styles.textSelected]}>
                        {item.title}
                      </Text>
                      {isSelected ? (
                        <CheckCircle2 size={20} color={Colors.primary} />
                      ) : (
                        <Circle size={20} color={Colors.textMuted} />
                      )}
                    </View>
                    <Text style={styles.optionDesc}>{item.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 5: PERGUNTA 4 (PARÂMETROS FÍSICOS & BIOMÉTRICOS)
           ══════════════════════════════════════════════════════ */}
        {currentStep === 5 && (
          <View>
            <View style={styles.questionBadge}>
              <Text style={styles.questionBadgeText}>DOMANDA 4 DI 6</Text>
            </View>
            <Text style={styles.stepTitle}>I tuoi parametri per calibrare il carico neuromuscolare:</Text>
            <Text style={styles.stepSubtitle}>
              Necessari per stimare il massimale di 1RM e la portata in attacco.
            </Text>

            <View style={styles.inputsContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Età (anni)</Text>
                <TextInput
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  placeholder="22"
                  placeholderTextColor={Colors.textMuted}
                  style={styles.textInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Altezza corporea (cm)</Text>
                <TextInput
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  placeholder="192"
                  placeholderTextColor={Colors.textMuted}
                  style={styles.textInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Peso corporeo (kg)</Text>
                <TextInput
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  placeholder="84"
                  placeholderTextColor={Colors.textMuted}
                  style={styles.textInput}
                />
              </View>

              {/* Box de Estimativa de Alcance em Tempo Real */}
              <View style={styles.infoBox}>
                <Activity size={18} color={Colors.primary} />
                <View style={styles.infoTextWrapper}>
                  <Text style={styles.infoTitle}>
                    Portata da fermo stimata: {estimateStandingReach(heightNum)} cm
                  </Text>
                  <Text style={styles.infoDesc}>
                    Con un salto di base a {currentJumpEstimated} cm tocchi già {estimateStandingReach(heightNum) + currentJumpEstimated} cm. Il potenziale stimato ti porterà a {estimateStandingReach(heightNum) + Math.round(potentialJumpProjected)} cm!
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ marginTop: 24 }}>
              <Button
                title="Continua →"
                variant="primary"
                size="large"
                onPress={() => setCurrentStep(6)}
              />
            </View>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 6: PERGUNTA 5 (A META DESEJADA / ESPERANÇA)
           ══════════════════════════════════════════════════════ */}
        {currentStep === 6 && (
          <View>
            <View style={styles.questionBadge}>
              <Text style={styles.questionBadgeText}>DOMANDA 5 DI 6</Text>
            </View>
            <Text style={styles.stepTitle}>Quanto vorresti aumentare il tuo salto nei prossimi 60 giorni?</Text>
            <Text style={styles.stepSubtitle}>
              Seleziona l'obiettivo che trasformerebbe le tue prestazioni.
            </Text>

            <View style={styles.listContainer}>
              {[
                {
                  id: 'gain_5_8',
                  title: '+5 a +8 cm di elevazione',
                  desc: 'Obiettivo realistico e solido per superare costantemente il muro avversario.',
                },
                {
                  id: 'gain_8_12',
                  title: '+9 a +14 cm di elevazione',
                  desc: 'Trasformazione atletica totale: schiacciare sopra chiunque con autorità.',
                },
                {
                  id: 'pain_free',
                  title: 'Saltare alla massima potenza SENZA dolore alle ginocchia',
                  desc: 'Eliminare definitivamente la tendinopatia e saltare libero da paure.',
                },
              ].map((item) => {
                const isSelected = targetGain === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                    onPress={() => {
                      setTargetGain(item.id);
                      setTimeout(() => setCurrentStep(7), 200);
                    }}
                  >
                    <View style={styles.optionHeader}>
                      <Text style={[styles.optionTitle, isSelected && styles.textSelected]}>
                        {item.title}
                      </Text>
                      {isSelected ? (
                        <CheckCircle2 size={20} color={Colors.primary} />
                      ) : (
                        <Circle size={20} color={Colors.textMuted} />
                      )}
                    </View>
                    <Text style={styles.optionDesc}>{item.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 7: PERGUNTA 6 (COMPROMISSO & QUALIFICAÇÃO)
           ══════════════════════════════════════════════════════ */}
        {currentStep === 7 && (
          <View>
            <View style={styles.questionBadge}>
              <Text style={styles.questionBadgeText}>DOMANDA FINALE</Text>
            </View>
            <Text style={styles.stepTitle}>
              Sei pronto a dedicare 15-20 minuti, 3 volte a settimana, usando la fotocamera del tuo telefono?
            </Text>
            <Text style={styles.stepSubtitle}>
              Il metodo richiede costanza e l'esecuzione del breve check-in per garantire i risultati promessi.
            </Text>

            <View style={styles.listContainer}>
              {[
                {
                  id: 'yes_100',
                  icon: '🔥',
                  title: 'Sì, sono determinato al 100%!',
                  desc: 'Voglio sbloccare il mio massimo potenziale e seguire il metodo scientifico.',
                },
                {
                  id: 'yes_guided',
                  icon: '👍',
                  title: 'Sì, se il programma mi guida passo-passo',
                  desc: 'Voglio sapere esattamente cosa fare in ogni singola sessione.',
                },
              ].map((item) => {
                const isSelected = commitment === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                    onPress={() => {
                      setCommitment(item.id);
                      handleNext();
                    }}
                  >
                    <View style={styles.optionHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                        <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                        <Text style={[styles.optionTitle, isSelected && styles.textSelected]}>
                          {item.title}
                        </Text>
                      </View>
                      {isSelected ? (
                        <CheckCircle2 size={20} color={Colors.primary} />
                      ) : (
                        <Circle size={20} color={Colors.textMuted} />
                      )}
                    </View>
                    <Text style={styles.optionDesc}>{item.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 8: ANIMAÇÃO DE CÁLCULO DA IA (NEUROMUSCULAR ENGINE)
           ══════════════════════════════════════════════════════ */}
        {currentStep === 8 && (
          <View style={styles.loadingContainer}>
            <VertiCamLogo size="medium" variant="badge" />

            <View style={{ marginTop: 32, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingProgressNum}>{analysisProgress}%</Text>
              <Text style={styles.loadingProgressText}>
                {analysisSteps[analysisTextIndex]}
              </Text>
            </View>

            <View style={styles.loadingBarWrapper}>
              <View style={[styles.loadingBarFill, { width: `${analysisProgress}%` }]} />
            </View>

            <Text style={styles.loadingSub}>
              Elaborazione del modello biomeccanico VertiCam basato sulle equazioni di volo balistico...
            </Text>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 9: A PÁGINA DE VENDAS / OFERTA DE ALTA CONVERSÃO
           ══════════════════════════════════════════════════════ */}
        {currentStep === 9 && (
          <View style={styles.salesPageContainer}>
            {/* Badge de Diagnóstico Concluído */}
            <View style={styles.offerBadgeWrapper}>
              <View style={styles.offerBadge}>
                <Sparkles size={14} color="#080C14" />
                <Text style={styles.offerBadgeText}>DIAGNOSI NEUROMUSCOLARE COMPLETATA</Text>
              </View>
            </View>

            {/* Headline da Oferta */}
            <Text style={styles.offerHeadline}>
              Il Tuo Piano di Elevazione Personalizzato è Pronto!
            </Text>
            <Text style={styles.offerSubtitle}>
              In base alle tue risposte ({height} cm, {weight} kg), abbiamo identificato un <Text style={{ color: Colors.primary, fontWeight: '800' }}>deficit di reattività elastica</Text>. Ecco la tua proiezione:
            </Text>

            {/* ── CARD DE PROJEÇÃO COMPARATIVA (ANTES VS DEPOIS) ── */}
            <View style={styles.projectionCard}>
              <Text style={styles.projCardTitle}>PROIEZIONE DEL TUO SALTO IN 8 SETTIMANE</Text>

              <View style={styles.barsContainer}>
                {/* Salto Atual */}
                <View style={styles.barCol}>
                  <Text style={styles.barValue}>{currentJumpEstimated} cm</Text>
                  <View style={[styles.barVisual, { height: 110, backgroundColor: '#334155' }]} />
                  <Text style={styles.barLabel}>Salto Attuale (Stima)</Text>
                </View>

                {/* Salto Projetado */}
                <View style={styles.barCol}>
                  <View style={styles.gainFloatingBadge}>
                    <Text style={styles.gainFloatingText}>+8.5 cm 🔥</Text>
                  </View>
                  <Text style={[styles.barValue, { color: Colors.primary, fontWeight: '900' }]}>
                    {potentialJumpProjected} cm
                  </Text>
                  <View style={[styles.barVisual, { height: 160, backgroundColor: Colors.primary }]} />
                  <Text style={[styles.barLabel, { color: Colors.primary, fontWeight: '800' }]}>
                    Con VertiCam
                  </Text>
                </View>
              </View>

              <View style={styles.reachSummaryBox}>
                <Text style={styles.reachSummaryText}>
                  Portata totale in attacco stimata: da <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>{estimateStandingReach(heightNum) + currentJumpEstimated} cm</Text> a <Text style={{ color: Colors.primary, fontWeight: '800' }}>{estimateStandingReach(heightNum) + Math.round(potentialJumpProjected)} cm</Text>!
                </Text>
              </View>
            </View>

            {/* ── O QUE VOCÊ RECEBE NO VERTICAM PRO ── */}
            <View style={styles.featuresSection}>
              <Text style={styles.featuresHeading}>Cosa include il tuo programma:</Text>

              <View style={styles.featureItem}>
                <View style={styles.featureIconWrap}>
                  <Camera size={20} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>Laboratorio Balistico con Telecamera</Text>
                  <Text style={styles.featureDesc}>
                    Misurazioni illimitate del tempo di volo e altezza reale con precisione di 0.01 secondi. Nessun sensore da acquistare.
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIconWrap}>
                  <Zap size={20} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>Motore di Autoregolazione Giornaliera</Text>
                  <Text style={styles.featureDesc}>
                    Zone Verde, Gialla e Rossa. L'algoritmo adatta serie e percentuali di carico sul bilanciere in base allo stato del tuo SNC ogni giorno.
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIconWrap}>
                  <ShieldCheck size={20} color={Colors.accentGreen} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>Protocollo "Ginocchia di Ferro"</Text>
                  <Text style={styles.featureDesc}>
                    Isometrie di protezione del tendine rotuleo per saltare potente senza alcun fastidio articolare.
                  </Text>
                </View>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIconWrap}>
                  <Play size={20} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureTitle}>Video HD con Tecnica Esercizi</Text>
                  <Text style={styles.featureDesc}>
                    Guida visiva completa per Loaded CMJ, Concentric Squat Jump e Drop Jump con altezze esatte della scatola pliometrica.
                  </Text>
                </View>
              </View>
            </View>

            {/* ── OFERTA & PREÇO ANCORADO ── */}
            <View style={styles.pricingCard}>
              <View style={styles.pricingHeader}>
                <View style={styles.bestOfferBadge}>
                  <Text style={styles.bestOfferText}>OFFERTA SPECIALE • RISPARMI IL 40%</Text>
                </View>
                <Text style={styles.planName}>VertiCam PRO (Piano Annuale)</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceMain}>349,00 €</Text>
                  <Text style={styles.pricePeriod}>/ anno</Text>
                </View>
                <Text style={styles.priceMonthlyEquiv}>Solo ~29 € al mese (meno di una pizza a settimana)</Text>
              </View>

              <View style={styles.guaranteeBox}>
                <ShieldCheck size={28} color={Colors.accentGreen} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.guaranteeTitle}>Garanzia 100% Soddisfatti o Rimborsati</Text>
                  <Text style={styles.guaranteeDesc}>
                    Hai 14 giorni completi di prova. Se non vedi progressi scientifici nel tuo salto, ti rimborsiamo l'intero importo senza fare domande.
                  </Text>
                </View>
              </View>

              <Button
                title="Sblocca il Tuo Piano Ora"
                variant="primary"
                size="large"
                onPress={handleActivatePro}
                icon={<Lock size={18} color="#080C14" />}
              />

              <TouchableOpacity
                style={styles.secondaryActionBtn}
                onPress={handleTryCameraFirst}
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryActionText}>
                  Oppure esegui prima il tuo primo test del salto con la fotocamera →
                </Text>
              </TouchableOpacity>
            </View>

            {/* Security Badges */}
            <View style={styles.securityRow}>
              <Text style={styles.securityText}>🔒 Pagamento Protetto con Crittografia SSL a 256-bit</Text>
              <Text style={styles.securitySubText}>Apple Pay • Google Pay • Carte di Credito • Conforme GDPR</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: Colors.cardBackground,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },

  // ── HOOK / STEP 0 ──
  hookContainer: {
    paddingVertical: 8,
  },
  badgeWrapper: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  techBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.35)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  techBadgeText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  promiseHeadline: {
    fontSize: 27,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 34,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  promiseHeadlineHighlight: {
    color: Colors.primary,
  },
  promiseSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  proofCard: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  proofHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  proofHeaderText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  metricBig: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  comparisonBox: {
    backgroundColor: '#080C14',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  comparisonColBad: {
    marginBottom: 10,
  },
  compBadTitle: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  compGoodTitle: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  comparisonDivider: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginVertical: 8,
  },
  comparisonColGood: {},
  compDesc: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },

  // Testimonials
  testimonialsSection: {
    marginBottom: 24,
  },
  testimHeading: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },
  testimCard: {
    backgroundColor: '#0F1726',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  testimTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniText: {
    color: '#080C14',
    fontSize: 14,
    fontWeight: '900',
  },
  testimName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  verifiedText: {
    color: Colors.accentGreen,
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  gainPill: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  gainPillText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  testimQuote: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  step0Cta: {
    gap: 8,
    alignItems: 'center',
  },
  step0Footnote: {
    color: Colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },

  // ── QUESTIONS GENERAL ──
  questionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  questionBadgeText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
    lineHeight: 28,
  },
  stepSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 19,
  },
  listContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    borderRadius: 14,
    padding: 16,
  },
  optionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  textSelected: {
    color: Colors.primary,
  },
  optionDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
  },

  // ── INSIGHT / BREAK ──
  insightContainer: {
    paddingVertical: 10,
  },
  insightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  insightBadgeText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  insightHeadline: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 28,
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
  },
  insightBody: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 21,
    marginBottom: 16,
  },
  solutionHighlight: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 12,
    padding: 12,
  },
  solutionText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 18,
  },

  // ── INPUTS STEP 5 ──
  inputsContainer: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    marginTop: 8,
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoTitle: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 4,
  },
  infoDesc: {
    color: Colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },

  // ── LOADING STEP 8 ──
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  loadingProgressNum: {
    fontSize: 36,
    fontWeight: '900',
    color: Colors.primary,
    marginTop: 16,
  },
  loadingProgressText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
    minHeight: 40,
  },
  loadingBarWrapper: {
    width: '80%',
    height: 8,
    backgroundColor: Colors.cardBackground,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 16,
  },
  loadingBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  loadingSub: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 24,
  },

  // ── SALES PAGE STEP 9 ──
  salesPageContainer: {
    paddingVertical: 8,
  },
  offerBadgeWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  offerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  offerBadgeText: {
    color: '#080C14',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  offerHeadline: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 8,
  },
  offerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  projectionCard: {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
  },
  projCardTitle: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: 16,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 40,
    height: 190,
    marginBottom: 16,
  },
  barCol: {
    alignItems: 'center',
    width: 90,
  },
  gainFloatingBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 6,
  },
  gainFloatingText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  barValue: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  barVisual: {
    width: 60,
    borderRadius: 8,
  },
  barLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  reachSummaryBox: {
    backgroundColor: '#080C14',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  reachSummaryText: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  featuresSection: {
    marginBottom: 24,
    gap: 14,
  },
  featuresHeading: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  featureItem: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#0F1726',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 14,
    padding: 14,
  },
  featureIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDesc: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  pricingCard: {
    backgroundColor: '#0F1726',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
    padding: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    marginBottom: 16,
  },
  pricingHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  bestOfferBadge: {
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  bestOfferText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  planName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceMain: {
    color: Colors.primary,
    fontSize: 34,
    fontWeight: '900',
  },
  pricePeriod: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  priceMonthlyEquiv: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  guaranteeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 18,
  },
  guaranteeTitle: {
    color: Colors.accentGreen,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  guaranteeDesc: {
    color: Colors.textSecondary,
    fontSize: 10,
    lineHeight: 14,
  },
  secondaryActionBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 6,
  },
  secondaryActionText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  securityRow: {
    alignItems: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  securityText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  securitySubText: {
    color: '#475569',
    fontSize: 10,
  },
});
