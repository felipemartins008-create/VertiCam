import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ShieldAlert,
  Flame,
  Activity,
  Maximize2,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';

interface BiomechanicalDemonstrationProps {
  type: 'warmup' | 'cmj' | 'sj' | 'camera_setup';
  compact?: boolean;
}

export const BiomechanicalDemonstration: React.FC<BiomechanicalDemonstrationProps> = ({
  type,
  compact = false,
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  if (type === 'warmup') {
    const steps = [
      {
        title: '1. Posição Inicial',
        description: 'Pés na largura dos ombros, pontas levemente voltadas para fora, peito ereto e abdômen firme.',
        cue: 'Base estável',
      },
      {
        title: '2. Descida Controlada (2s)',
        description: 'Flexione os joelhos e empurre os quadris para trás até a linha de 90° (coxas paralelas ao chão).',
        cue: 'Joelhos alinhados às pontas dos pés',
      },
      {
        title: '3. Subida Explosiva (1s)',
        description: 'Empurre o chão com os calcanhares e estenda quadris e joelhos com velocidade e potência.',
        cue: 'Ativação máxima dos fusos musculares',
      },
    ];

    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Flame size={16} color="#F97316" />
          <Text style={styles.headerTitle}>DEMONSTRAÇÃO: AGACHAMENTO (3x10)</Text>
        </View>

        {/* Visual do Movimento (Animação de Passos) */}
        <View style={styles.visualCanvas}>
          <View style={styles.stepPreviewRow}>
            {steps.map((st, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setActiveStep(i)}
                style={[styles.stepTab, activeStep === i && styles.stepTabActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.stepTabText, activeStep === i && styles.stepTabTextActive]}>
                  Passo {i + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.demoVisualBox}>
            <View style={styles.stickFigureBox}>
              {activeStep === 0 && (
                <View style={styles.stickFigureContent}>
                  <View style={styles.headCircle} />
                  <View style={styles.torsoLine} />
                  <View style={styles.legsStraightRow}>
                    <View style={styles.legStraight} />
                    <View style={styles.legStraight} />
                  </View>
                  <View style={styles.groundLine} />
                  <Text style={styles.phaseTag}>ERETO (0°)</Text>
                </View>
              )}
              {activeStep === 1 && (
                <View style={styles.stickFigureContent}>
                  <View style={[styles.headCircle, { marginTop: 14 }]} />
                  <View style={[styles.torsoLine, { height: 26, transform: [{ rotate: '10deg' }] }]} />
                  <View style={styles.legsSquatRow}>
                    <View style={styles.thighParallel} />
                    <View style={styles.shinDown} />
                  </View>
                  <View style={styles.groundLine} />
                  <Text style={[styles.phaseTag, { color: '#F97316' }]}>DESCIDA A 90°</Text>
                </View>
              )}
              {activeStep === 2 && (
                <View style={styles.stickFigureContent}>
                  <View style={[styles.headCircle, { marginTop: -4 }]} />
                  <View style={styles.torsoLine} />
                  <View style={styles.legsStraightRow}>
                    <View style={[styles.legStraight, { backgroundColor: '#10B981' }]} />
                    <View style={[styles.legStraight, { backgroundColor: '#10B981' }]} />
                  </View>
                  <View style={styles.groundLine} />
                  <Text style={[styles.phaseTag, { color: '#10B981' }]}>SUBIDA EXPLOSIVA</Text>
                </View>
              )}
            </View>

            <View style={styles.demoExplanation}>
              <Text style={styles.demoStepTitle}>{steps[activeStep].title}</Text>
              <Text style={styles.demoStepDesc}>{steps[activeStep].description}</Text>
              <View style={styles.cuePill}>
                <CheckCircle2 size={12} color="#10B981" />
                <Text style={styles.cuePillText}>{steps[activeStep].cue}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (type === 'cmj') {
    const steps = [
      {
        title: '1. Posição Inicial',
        description: 'Mãos fixadas nas cristas ilíacas (cintura). Joelhos completamente retos.',
        tag: 'MÃOS NA CINTURA',
      },
      {
        title: '2. Contramovimento Rápido',
        description: 'Agache rapidamente até ~90° sem parar embaixo. O tendão estica e acumula energia elástica.',
        tag: 'ENERGIA ELÁSTICA',
      },
      {
        title: '3. Decolagem Máxima',
        description: 'Inverta a direção imediatamente e empurre o chão com máxima velocidade balística.',
        tag: 'POTÊNCIA REATIVA',
      },
      {
        title: '4. Voo com Pernas Retas',
        description: 'No ar, pernas e tornozelos apontando estendidos para baixo até a aterrissagem.',
        tag: 'PERNAS ESTENDIDAS',
      },
    ];

    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Activity size={16} color={Colors.primary} />
          <Text style={styles.headerTitle}>DEMONSTRAÇÃO: SALTO CMJ (COM CONTRAMOVIMENTO)</Text>
        </View>

        <View style={styles.visualCanvas}>
          <View style={styles.stepPreviewRow}>
            {steps.map((st, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setActiveStep(i)}
                style={[styles.stepTab, activeStep === i && styles.stepTabActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.stepTabText, activeStep === i && styles.stepTabTextActive]}>
                  {i + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.demoVisualBox}>
            <View style={styles.stickFigureBox}>
              {activeStep === 0 && (
                <View style={styles.stickFigureContent}>
                  <View style={styles.headCircle} />
                  <View style={styles.handsOnWaist} />
                  <View style={styles.torsoLine} />
                  <View style={styles.legsStraightRow}>
                    <View style={styles.legStraight} />
                    <View style={styles.legStraight} />
                  </View>
                  <View style={styles.groundLine} />
                  <Text style={styles.phaseTag}>1. ERETO</Text>
                </View>
              )}
              {activeStep === 1 && (
                <View style={styles.stickFigureContent}>
                  <View style={[styles.headCircle, { marginTop: 12 }]} />
                  <View style={styles.handsOnWaist} />
                  <View style={[styles.torsoLine, { height: 26 }]} />
                  <View style={styles.legsSquatRow}>
                    <View style={styles.thighParallel} />
                    <View style={styles.shinDown} />
                  </View>
                  <View style={styles.groundLine} />
                  <Text style={[styles.phaseTag, { color: Colors.primary }]}>2. FLEXÃO RÁPIDA</Text>
                </View>
              )}
              {activeStep === 2 && (
                <View style={styles.stickFigureContent}>
                  <View style={[styles.headCircle, { marginTop: -14 }]} />
                  <View style={styles.handsOnWaist} />
                  <View style={styles.torsoLine} />
                  <View style={styles.legsStraightRow}>
                    <View style={[styles.legStraight, { backgroundColor: Colors.primary }]} />
                    <View style={[styles.legStraight, { backgroundColor: Colors.primary }]} />
                  </View>
                  <View style={[styles.groundLine, { borderColor: '#10B981' }]} />
                  <Text style={[styles.phaseTag, { color: '#10B981' }]}>3. DECOLAGEM</Text>
                </View>
              )}
              {activeStep === 3 && (
                <View style={styles.stickFigureContent}>
                  <View style={[styles.headCircle, { marginTop: -22 }]} />
                  <View style={styles.handsOnWaist} />
                  <View style={styles.torsoLine} />
                  <View style={styles.legsStraightRow}>
                    <View style={[styles.legStraight, { backgroundColor: '#38BDF8', height: 42 }]} />
                    <View style={[styles.legStraight, { backgroundColor: '#38BDF8', height: 42 }]} />
                  </View>
                  <View style={styles.groundLine} />
                  <Text style={[styles.phaseTag, { color: '#38BDF8' }]}>4. VOO ESTENDIDO</Text>
                </View>
              )}
            </View>

            <View style={styles.demoExplanation}>
              <Text style={styles.demoStepTitle}>{steps[activeStep].title}</Text>
              <Text style={styles.demoStepDesc}>{steps[activeStep].description}</Text>
              <View style={styles.cuePill}>
                <CheckCircle2 size={12} color={Colors.primary} />
                <Text style={styles.cuePillText}>{steps[activeStep].tag}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (type === 'sj') {
    const steps = [
      {
        title: '1. Agache a 90° e Pare',
        description: 'Mãos na cintura, desça até 90° e congele totalmente o corpo.',
        tag: 'IMÓVEL NA POSIÇÃO',
      },
      {
        title: '2. Pausa Estática de 2 Segundos',
        description: 'Segure a posição sem balançar o quadril. A pausa dissipa toda a elasticidade do tendão.',
        tag: 'ZERO CONTRAMOVIMENTO',
      },
      {
        title: '3. Explosão Concêntrica Pura',
        description: 'Sem descer mais nenhum centímetro, exploda direto para cima com pura força muscular.',
        tag: 'FORÇA CONCÊNTRICA PURA',
      },
      {
        title: '4. Voo e Aterrissagem',
        description: 'Mantenha joelhos estendidos e mãos na cintura até tocar o chão.',
        tag: 'CONTROLE TOTAL',
      },
    ];

    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Activity size={16} color="#A855F7" />
          <Text style={[styles.headerTitle, { color: '#A855F7' }]}>
            DEMONSTRAÇÃO: SALTO SJ (SEM CONTRAMOVIMENTO)
          </Text>
        </View>

        <View style={styles.visualCanvas}>
          <View style={styles.stepPreviewRow}>
            {steps.map((st, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setActiveStep(i)}
                style={[styles.stepTab, activeStep === i && [styles.stepTabActive, { borderColor: '#A855F7' }]]}
                activeOpacity={0.8}
              >
                <Text style={[styles.stepTabText, activeStep === i && { color: '#A855F7' }]}>
                  {i + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.demoVisualBox}>
            <View style={styles.stickFigureBox}>
              {activeStep === 0 && (
                <View style={styles.stickFigureContent}>
                  <View style={[styles.headCircle, { marginTop: 12 }]} />
                  <View style={styles.handsOnWaist} />
                  <View style={[styles.torsoLine, { height: 26 }]} />
                  <View style={styles.legsSquatRow}>
                    <View style={styles.thighParallel} />
                    <View style={styles.shinDown} />
                  </View>
                  <View style={styles.groundLine} />
                  <Text style={[styles.phaseTag, { color: '#A855F7' }]}>1. PARADA A 90°</Text>
                </View>
              )}
              {activeStep === 1 && (
                <View style={styles.stickFigureContent}>
                  <View style={[styles.headCircle, { marginTop: 12 }]} />
                  <View style={styles.handsOnWaist} />
                  <View style={[styles.torsoLine, { height: 26 }]} />
                  <View style={styles.legsSquatRow}>
                    <View style={[styles.thighParallel, { backgroundColor: '#F59E0B' }]} />
                    <View style={[styles.shinDown, { backgroundColor: '#F59E0B' }]} />
                  </View>
                  <View style={styles.groundLine} />
                  <Text style={[styles.phaseTag, { color: '#F59E0B' }]}>2. SEGURE 2s</Text>
                </View>
              )}
              {activeStep === 2 && (
                <View style={styles.stickFigureContent}>
                  <View style={[styles.headCircle, { marginTop: -14 }]} />
                  <View style={styles.handsOnWaist} />
                  <View style={styles.torsoLine} />
                  <View style={styles.legsStraightRow}>
                    <View style={[styles.legStraight, { backgroundColor: '#A855F7' }]} />
                    <View style={[styles.legStraight, { backgroundColor: '#A855F7' }]} />
                  </View>
                  <View style={styles.groundLine} />
                  <Text style={[styles.phaseTag, { color: '#A855F7' }]}>3. EXPLOSÃO DIRETA</Text>
                </View>
              )}
              {activeStep === 3 && (
                <View style={styles.stickFigureContent}>
                  <View style={[styles.headCircle, { marginTop: -22 }]} />
                  <View style={styles.handsOnWaist} />
                  <View style={styles.torsoLine} />
                  <View style={styles.legsStraightRow}>
                    <View style={[styles.legStraight, { backgroundColor: '#A855F7', height: 42 }]} />
                    <View style={[styles.legStraight, { backgroundColor: '#A855F7', height: 42 }]} />
                  </View>
                  <View style={styles.groundLine} />
                  <Text style={[styles.phaseTag, { color: '#A855F7' }]}>4. VOO ESTENDIDO</Text>
                </View>
              )}
            </View>

            <View style={styles.demoExplanation}>
              <Text style={styles.demoStepTitle}>{steps[activeStep].title}</Text>
              <Text style={styles.demoStepDesc}>{steps[activeStep].description}</Text>
              <View style={styles.cuePill}>
                <CheckCircle2 size={12} color="#A855F7" />
                <Text style={styles.cuePillText}>{steps[activeStep].tag}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Camera Setup
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Maximize2 size={16} color={Colors.primary} />
        <Text style={styles.headerTitle}>DEMONSTRAÇÃO: POSICIONAMENTO DA CÂMERA</Text>
      </View>

      <View style={styles.cameraSetupBox}>
        <View style={styles.setupStep}>
          <Text style={styles.setupStepNum}>1</Text>
          <Text style={styles.setupStepText}>
            Apoie o smartphone no chão ou em um suporte a <Text style={{ color: Colors.primary, fontWeight: '700' }}>2 a 3 metros de distância</Text>.
          </Text>
        </View>

        <View style={styles.setupStep}>
          <Text style={styles.setupStepNum}>2</Text>
          <Text style={styles.setupStepText}>
            Incline a câmera para que seus <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>pés e a linha do chão fiquem 100% nítidos</Text>.
          </Text>
        </View>

        <View style={styles.setupStep}>
          <Text style={styles.setupStepNum}>3</Text>
          <Text style={styles.setupStepText}>
            Você terá <Text style={{ color: '#10B981', fontWeight: '700' }}>3 segundos de contagem regressiva</Text> antes do salto para se posicionar com tranquilidade.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0D111F',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
    marginVertical: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#CBD5E1',
    letterSpacing: 0.6,
  },
  visualCanvas: {
    backgroundColor: '#070A14',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 12,
  },
  stepPreviewRow: {
    flexDirection: 'row',
    gap: 8,
  },
  stepTab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#12172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  stepTabActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    borderColor: Colors.primary,
  },
  stepTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  stepTabTextActive: {
    color: Colors.primary,
    fontWeight: '900',
  },
  demoVisualBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stickFigureBox: {
    width: 90,
    height: 110,
    backgroundColor: '#0D111F',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative',
  },
  stickFigureContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  headCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    marginBottom: 2,
  },
  handsOnWaist: {
    position: 'absolute',
    top: 26,
    width: 28,
    height: 2,
    backgroundColor: '#94A3B8',
    borderRadius: 1,
  },
  torsoLine: {
    width: 4,
    height: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  legsStraightRow: {
    flexDirection: 'row',
    gap: 6,
  },
  legStraight: {
    width: 4,
    height: 34,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
  },
  legsSquatRow: {
    width: 32,
    height: 22,
    position: 'relative',
  },
  thighParallel: {
    position: 'absolute',
    top: 0,
    left: 2,
    width: 28,
    height: 4,
    backgroundColor: '#F97316',
    borderRadius: 2,
  },
  shinDown: {
    position: 'absolute',
    top: 4,
    right: 2,
    width: 4,
    height: 18,
    backgroundColor: '#F97316',
    borderRadius: 2,
  },
  groundLine: {
    position: 'absolute',
    bottom: 12,
    width: 70,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  phaseTag: {
    position: 'absolute',
    bottom: 2,
    fontSize: 9,
    fontWeight: '900',
    color: '#64748B',
    textAlign: 'center',
  },
  demoExplanation: {
    flex: 1,
    gap: 4,
  },
  demoStepTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  demoStepDesc: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
  cuePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  cuePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  cameraSetupBox: {
    backgroundColor: '#070A14',
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  setupStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  setupStepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 22,
  },
  setupStepText: {
    flex: 1,
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 16,
  },
});
