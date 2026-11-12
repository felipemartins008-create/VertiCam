import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Camera,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sliders,
  ChevronRight,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

interface JumpTutorialPlayerProps {
  initialTab?: 'setup' | 'cmj' | 'sj';
  onReadyToRecord?: () => void;
}

export const JumpTutorialPlayer: React.FC<JumpTutorialPlayerProps> = ({
  initialTab = 'setup',
  onReadyToRecord,
}) => {
  const { language } = useApp();
  const isPt = language === 'pt';

  const [activeTab, setActiveTab] = useState<'setup' | 'cmj' | 'sj'>(initialTab);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [animFrame, setAnimFrame] = useState<number>(0);

  // Animação de demonstração visual em loop (simula o vídeo passo a passo)
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setAnimFrame((prev) => (prev + 1) % 4);
      }, 1600);
    }
    return () => clearInterval(timer);
  }, [isPlaying, activeTab]);

  const tabs = [
    {
      id: 'setup' as const,
      label: isPt ? '1. Posicionar Celular' : '1. Posizionamento',
      tag: isPt ? 'Distância & Ângulo' : 'Distanza & Angolo',
    },
    {
      id: 'cmj' as const,
      label: isPt ? '2. Salto CMJ (Elástico)' : '2. Salto CMJ (Elastico)',
      tag: isPt ? 'Com Contramovimento' : 'Con Contromovimento',
    },
    {
      id: 'sj' as const,
      label: isPt ? '3. Salto SJ (Força Pura)' : '3. Salto SJ (Forza)',
      tag: isPt ? 'Pausa de 2s a 90°' : 'Pausa di 2s a 90°',
    },
  ];

  return (
    <View style={styles.container}>
      {/* ── SELETOR DE ABAS DO VÍDEO TUTORIAL ── */}
      <View style={styles.tabsRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => {
              setActiveTab(tab.id);
              setAnimFrame(0);
            }}
            style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnLabel, activeTab === tab.id && styles.tabBtnLabelActive]}>
              {tab.label}
            </Text>
            <Text style={[styles.tabBtnSub, activeTab === tab.id && styles.tabBtnSubActive]}>
              {tab.tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── PLAYER DE VÍDEO TUTORIAL COM ILUSTRAÇÃO ANIMADA ── */}
      <View style={styles.playerWrapper}>
        {/* Simulação Visual do Vídeo (Canvas / Ilustração Dinâmica) */}
        <View style={styles.videoStage}>
          {/* ── TAB 1: POSICIONAMENTO DO CELULAR ── */}
          {activeTab === 'setup' && (
            <View style={styles.stageContent}>
              <View style={styles.setupIllustration}>
                {/* Celular no chão encostado na garrafa */}
                <View style={styles.phoneOnFloor}>
                  <View style={styles.phoneScreenMini}>
                    <Camera size={14} color={Colors.primary} />
                  </View>
                  <View style={styles.bottleSupport} />
                </View>

                {/* Linha de distância de 2 metros */}
                <View style={styles.distanceLine}>
                  <View style={styles.distanceDot} />
                  <View style={styles.distanceDash} />
                  <Text style={styles.distanceText}>2.0 METROS</Text>
                  <View style={styles.distanceDash} />
                  <View style={styles.distanceDot} />
                </View>

                {/* Atleta de corpo inteiro */}
                <View style={styles.athleteSilhouette}>
                  <View style={styles.athleteHead} />
                  <View style={styles.athleteTorso} />
                  <View style={styles.athleteLegs} />
                  <View style={styles.groundBaseLine} />
                </View>
              </View>

              <View style={styles.videoOverlayBadge}>
                <Sparkles size={11} color={Colors.primary} />
                <Text style={styles.videoOverlayBadgeText}>
                  {isPt ? 'ENQUADRAMENTO OBRIGATÓRIO' : 'INQUADRATURA OBBLIGATORIA'}
                </Text>
              </View>
            </View>
          )}

          {/* ── TAB 2: SALTO CMJ (COM CONTRAMOVIMENTO) ── */}
          {activeTab === 'cmj' && (
            <View style={styles.stageContent}>
              <View style={styles.jumpIllustration}>
                {animFrame === 0 && (
                  <View style={styles.jumpStateBox}>
                    <View style={styles.jumpHead} />
                    <View style={styles.handsHips} />
                    <View style={styles.jumpTorso} />
                    <View style={styles.jumpLegsStraight} />
                    <View style={styles.groundBaseLine} />
                    <Text style={styles.jumpPhasePill}>1. ERETO (MÃOS NA CINTURA)</Text>
                  </View>
                )}

                {animFrame === 1 && (
                  <View style={styles.jumpStateBox}>
                    <View style={[styles.jumpHead, { marginTop: 16 }]} />
                    <View style={[styles.handsHips, { top: 28 }]} />
                    <View style={[styles.jumpTorso, { height: 26 }]} />
                    <View style={styles.jumpLegsSquat} />
                    <View style={styles.groundBaseLine} />
                    <Text style={[styles.jumpPhasePill, { color: '#F59E0B' }]}>
                      2. DESCIDA RÁPIDA (CONTRAMOVIMENTO)
                    </Text>
                  </View>
                )}

                {animFrame === 2 && (
                  <View style={styles.jumpStateBox}>
                    <View style={[styles.jumpHead, { marginTop: -26 }]} />
                    <View style={[styles.handsHips, { top: -14 }]} />
                    <View style={styles.jumpTorso} />
                    <View style={styles.jumpLegsFlight} />
                    <View style={styles.groundBaseLine} />
                    <Text style={[styles.jumpPhasePill, { color: Colors.primary }]}>
                      3. VOANDO (PERNAS ESTICADAS NO AR)
                    </Text>
                  </View>
                )}

                {animFrame === 3 && (
                  <View style={styles.jumpStateBox}>
                    <View style={styles.jumpHead} />
                    <View style={styles.handsHips} />
                    <View style={styles.jumpTorso} />
                    <View style={styles.jumpLegsStraight} />
                    <View style={styles.groundBaseLine} />
                    <Text style={[styles.jumpPhasePill, { color: '#10B981' }]}>
                      4. POUSO SUAVE (AMORTECIMENTO)
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.videoOverlayBadge}>
                <Text style={styles.videoOverlayBadgeText}>
                  {isPt ? 'CAM-LENTA: 240 FPS' : 'SLOW-MOTION: 240 FPS'}
                </Text>
              </View>
            </View>
          )}

          {/* ── TAB 3: SALTO SQUAT JUMP (SEM CONTRAMOVIMENTO) ── */}
          {activeTab === 'sj' && (
            <View style={styles.stageContent}>
              <View style={styles.jumpIllustration}>
                {animFrame === 0 && (
                  <View style={styles.jumpStateBox}>
                    <View style={[styles.jumpHead, { marginTop: 16 }]} />
                    <View style={[styles.handsHips, { top: 28 }]} />
                    <View style={[styles.jumpTorso, { height: 26 }]} />
                    <View style={styles.jumpLegsSquat} />
                    <View style={styles.groundBaseLine} />
                    <Text style={[styles.jumpPhasePill, { color: '#A855F7' }]}>
                      1. PARADO A 90° (CONGELADO)
                    </Text>
                  </View>
                )}

                {animFrame === 1 && (
                  <View style={styles.jumpStateBox}>
                    <View style={[styles.jumpHead, { marginTop: 16 }]} />
                    <View style={[styles.handsHips, { top: 28 }]} />
                    <View style={[styles.jumpTorso, { height: 26 }]} />
                    <View style={styles.jumpLegsSquat} />
                    <View style={styles.groundBaseLine} />
                    <Text style={[styles.jumpPhasePill, { color: '#F59E0B' }]}>
                      2. SEGURE 2 SEGUNDOS SEM BALANÇAR
                    </Text>
                  </View>
                )}

                {animFrame === 2 && (
                  <View style={styles.jumpStateBox}>
                    <View style={[styles.jumpHead, { marginTop: -26 }]} />
                    <View style={[styles.handsHips, { top: -14 }]} />
                    <View style={styles.jumpTorso} />
                    <View style={styles.jumpLegsFlight} />
                    <View style={styles.groundBaseLine} />
                    <Text style={[styles.jumpPhasePill, { color: Colors.primary }]}>
                      3. EXPLOSÃO PURA PARA CIMA!
                    </Text>
                  </View>
                )}

                {animFrame === 3 && (
                  <View style={styles.jumpStateBox}>
                    <View style={styles.jumpHead} />
                    <View style={styles.handsHips} />
                    <View style={styles.jumpTorso} />
                    <View style={styles.jumpLegsStraight} />
                    <View style={styles.groundBaseLine} />
                    <Text style={[styles.jumpPhasePill, { color: '#10B981' }]}>
                      4. ATERRISSAGEM CONCLUÍDA
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.videoOverlayBadge}>
                <Text style={styles.videoOverlayBadgeText}>
                  {isPt ? 'FORÇA CONCÊNTRICA PURA' : 'FORZA PURA'}
                </Text>
              </View>
            </View>
          )}

          {/* Controles de Reprodução em Miniatura */}
          <View style={styles.videoControlsBar}>
            <TouchableOpacity
              onPress={() => setIsPlaying(!isPlaying)}
              style={styles.playMiniBtn}
              activeOpacity={0.8}
            >
              {isPlaying ? (
                <Pause size={12} color="#FFFFFF" />
              ) : (
                <Play size={12} color="#FFFFFF" fill="#FFFFFF" />
              )}
            </TouchableOpacity>

            {/* Barra de Progresso em Loop */}
            <View style={styles.timelineBar}>
              {[0, 1, 2, 3].map((f) => (
                <View
                  key={f}
                  style={[
                    styles.timelineDot,
                    animFrame === f && styles.timelineDotActive,
                  ]}
                />
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setAnimFrame(0)}
              style={styles.replayMiniBtn}
              activeOpacity={0.8}
            >
              <RotateCcw size={12} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── CARD COM INSTRUÇÕES EXATAS DO PASSO ── */}
        <View style={styles.instructionCard}>
          {activeTab === 'setup' && (
            <>
              <Text style={styles.instructionTitle}>
                {isPt ? 'Como Posicionar Seu Celular:' : 'Come Posizionare il Telefono:'}
              </Text>
              <View style={styles.bulletItem}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  {isPt
                    ? 'Apoie o celular no chão encostado numa garrafa d\'água ou na parede a 2 metros de distância.'
                    : 'Appoggia lo smartphone a terra contro una bottiglia d\'acqua o al muro a circa 2 metri.'}
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  {isPt
                    ? 'Incline levemente a tela de forma que seus pés no chão e a cabeça apareçam no vídeo.'
                    : 'Inclina l\'inquadratura in modo che i piedi e la testa siano interamente visibili.'}
                </Text>
              </View>
            </>
          )}

          {activeTab === 'cmj' && (
            <>
              <Text style={styles.instructionTitle}>
                {isPt ? 'Como Executar o Salto CMJ:' : 'Come Eseguire il Salto CMJ:'}
              </Text>
              <View style={styles.bulletItem}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldWhite}>{isPt ? 'Mãos firmes na cintura' : 'Mani sui fianchi'}:</Text>{' '}
                  {isPt ? 'não use os braços para saltar — assim isolamos 100% a potência real das suas pernas.' : 'non usare le braccia per spingere.'}
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldWhite}>{isPt ? 'Pernas esticadas no ar' : 'Gambe distese in volo'}:</Text>{' '}
                  {isPt ? 'não dobre os joelhos no ar até tocar o chão, para não alterar o tempo de voo real.' : 'non flettere le ginocchia in volo.'}
                </Text>
              </View>
            </>
          )}

          {activeTab === 'sj' && (
            <>
              <Text style={styles.instructionTitle}>
                {isPt ? 'Como Executar o Salto SJ (Squat Jump):' : 'Come Eseguire il Salto SJ:'}
              </Text>
              <View style={styles.bulletItem}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldWhite}>{isPt ? 'Agache a 90° e congele 2 segundos' : 'Fermo a 90° per 2 secondi'}:</Text>{' '}
                  {isPt ? 'elimina qualquer energia elástica residual para medir sua força concêntrica pura.' : 'elimina l\'energia elastica per misurare la forza pura.'}
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldWhite}>{isPt ? 'Sem contramovimento' : 'Nessun contromovimento'}:</Text>{' '}
                  {isPt ? 'salte direto para cima sem descer mais antes de decolar.' : 'esplodi verso l\'alto senza scendere ulteriormente.'}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0E1A',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    borderColor: Colors.primary,
  },
  tabBtnLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    textAlign: 'center',
  },
  tabBtnLabelActive: {
    color: Colors.primary,
  },
  tabBtnSub: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  tabBtnSubActive: {
    color: '#CBD5E1',
  },
  playerWrapper: {
    backgroundColor: '#070A14',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  videoStage: {
    height: 190,
    backgroundColor: '#000000',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageContent: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoOverlayBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  videoOverlayBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  videoControlsBar: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  playMiniBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineBar: {
    flexDirection: 'row',
    gap: 6,
  },
  timelineDot: {
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  timelineDotActive: {
    backgroundColor: Colors.primary,
  },
  replayMiniBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Ilustração Setup
  setupIllustration: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 16,
    height: 130,
    width: '90%',
  },
  phoneOnFloor: {
    alignItems: 'center',
  },
  phoneScreenMini: {
    width: 28,
    height: 46,
    borderRadius: 6,
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottleSupport: {
    width: 14,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    position: 'absolute',
    right: -12,
    bottom: 0,
  },
  distanceLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  distanceDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  distanceDash: {
    width: 24,
    height: 1,
    backgroundColor: Colors.primary,
  },
  distanceText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  athleteSilhouette: {
    alignItems: 'center',
  },
  athleteHead: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    marginBottom: 2,
  },
  athleteTorso: {
    width: 4,
    height: 38,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  athleteLegs: {
    width: 4,
    height: 42,
    backgroundColor: '#94A3B8',
    borderRadius: 2,
  },
  groundBaseLine: {
    width: 60,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 1,
    marginTop: 2,
  },

  // Ilustração Salto
  jumpIllustration: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
  },
  jumpStateBox: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 130,
  },
  jumpHead: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    marginBottom: 2,
  },
  handsHips: {
    position: 'absolute',
    top: 24,
    width: 26,
    height: 2,
    backgroundColor: Colors.primary,
  },
  jumpTorso: {
    width: 4,
    height: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  jumpLegsStraight: {
    width: 4,
    height: 38,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
  },
  jumpLegsSquat: {
    width: 28,
    height: 18,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    borderColor: '#CBD5E1',
    borderRadius: 2,
  },
  jumpLegsFlight: {
    width: 4,
    height: 44,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  jumpPhasePill: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 8,
    letterSpacing: 0.4,
  },

  // Card Instrução
  instructionCard: {
    padding: 14,
    gap: 8,
  },
  instructionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
    marginTop: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  boldWhite: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
