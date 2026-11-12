import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  CheckCircle2,
  Flame,
  Activity,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

interface BiomechanicalDemonstrationProps {
  type: 'warmup' | 'cmj' | 'sj' | 'camera_setup';
  compact?: boolean;
}

export const BiomechanicalDemonstration: React.FC<BiomechanicalDemonstrationProps> = ({
  type,
  compact = false,
}) => {
  const { language } = useApp();
  const isPt = language === 'pt';
  const [activeStep, setActiveStep] = useState<number>(0);

  if (type === 'warmup') {
    const steps = [
      {
        title: isPt ? '1. Posição Inicial' : '1. Posizione Iniziale',
        description: isPt
          ? 'Pés na largura dos ombros, pontas levemente voltadas para fora, tronco ereto e abdômen ativado.'
          : 'Piedi alla larghezza delle spalle, punte leggermente rivolte verso l\'esterno, busto eretto e addome attivo.',
        cue: isPt ? 'Base sólida e estável' : 'Base stabile',
      },
      {
        title: isPt ? '2. Descida Controlada (2s)' : '2. Discesa Controllata (2s)',
        description: isPt
          ? 'Flexione os joelhos e empurre o quadril para trás até 90° (coxas paralelas ao solo).'
          : 'Fletti le ginocchia e spingi il bacino all\'indietro fino a 90° (cosce parallele al suolo).',
        cue: isPt ? 'Joelhos alinhados às pontas dos pés' : 'Ginocchia allineate alle punte dei piedi',
      },
      {
        title: isPt ? '3. Subida Explosiva (1s)' : '3. Risalita Esplosiva (1s)',
        description: isPt
          ? 'Empurre o chão com os calcanhares e estenda quadril e joelhos com velocidade e potência máximas.'
          : 'Spingi sul pavimento con i talloni ed estendi bacino e ginocchia con massima velocità e potenza.',
        cue: isPt ? 'Ativação neuromuscular máxima' : 'Massima attivazione neuromuscolare',
      },
    ];

    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Flame size={16} color="#F97316" />
          <Text style={styles.headerTitle}>
            {isPt ? 'DEMO: AGACHAMENTO DE AQUECIMENTO (3x10)' : 'DEMO: SQUAT DI RISCALDAMENTO (3x10)'}
          </Text>
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
                  {isPt ? `Fase ${i + 1}` : `Fase ${i + 1}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.demoVisualBox}>
            {/* SVG Biomecânico do Agachamento de Aquecimento */}
            <View style={styles.svgContainer}>
              <svg width="100%" height="150" viewBox="0 0 200 150" style={{ display: 'block' }}>
                {/* Linha do chão */}
                <line x1="20" y1="135" x2="180" y2="135" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

                {/* Fase 0: Ereto (Postura inicial) */}
                {activeStep === 0 && (
                  <g transform="translate(100, 10)">
                    <circle cx="0" cy="16" r="8" fill="#FFFFFF" />
                    <path d="M -6,26 L 6,26 L 7,62 L -7,62 Z" fill="#E2E8F0" />
                    {/* Braços cruzados no peito */}
                    <path d="M -6,28 L -14,42 L 8,42" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M 6,28 L 14,42 L -8,42" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M -8,62 L 8,62 L 9,82 L -9,82 Z" fill="#F97316" />
                    <path d="M -5,82 L -5,124" fill="none" stroke="#CBD5E1" strokeWidth="5" strokeLinecap="round" />
                    <path d="M 5,82 L 5,124" fill="none" stroke="#CBD5E1" strokeWidth="5" strokeLinecap="round" />
                    <ellipse cx="-4" cy="125" rx="6" ry="2.5" fill="#F97316" />
                    <ellipse cx="6" cy="125" rx="6" ry="2.5" fill="#F97316" />
                  </g>
                )}

                {/* Fase 1: Agachamento a 90° (Descida controlada) */}
                {activeStep === 1 && (
                  <g transform="translate(100, 38)">
                    {/* Seta de descida lenta */}
                    <line x1="50" y1="20" x2="50" y2="40" stroke="#F97316" strokeWidth="2" strokeDasharray="2,2" />
                    <polygon points="46,38 54,38 50,44" fill="#F97316" />
                    <text x="56" y="34" fill="#F97316" fontSize="8" fontWeight="800">2s</text>

                    <circle cx="4" cy="16" r="8" fill="#FFFFFF" />
                    <path d="M -4,26 L 10,26 L 5,60 L -9,60 Z" fill="#E2E8F0" />
                    <path d="M -4,28 L -12,40 L 7,40" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                    <path d="M 10,28 L 16,40 L -6,40" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                    <path d="M -11,60 L 7,60 L 3,78 L -16,78 Z" fill="#F97316" />
                    <path d="M -13,78 L 12,84 L 5,96" fill="none" stroke="#CBD5E1" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M -2,78 L 18,84 L 11,96" fill="none" stroke="#CBD5E1" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                    <ellipse cx="7" cy="97" rx="7" ry="2.5" fill="#F97316" />
                    <ellipse cx="14" cy="97" rx="7" ry="2.5" fill="#F97316" />
                    {/* Indicador 90° */}
                    <circle cx="15" cy="84" r="8" fill="none" stroke="#F97316" strokeWidth="1.5" strokeDasharray="12,24" />
                  </g>
                )}

                {/* Fase 2: Subida Explosiva */}
                {activeStep === 2 && (
                  <g transform="translate(100, 10)">
                    {/* Seta de subida rápida */}
                    <line x1="50" y1="60" x2="50" y2="35" stroke="#10B981" strokeWidth="2.5" />
                    <polygon points="46,38 54,38 50,30" fill="#10B981" />
                    <text x="56" y="48" fill="#10B981" fontSize="8" fontWeight="900">1s MAX</text>

                    <circle cx="0" cy="16" r="8" fill="#FFFFFF" />
                    <path d="M -6,26 L 6,26 L 7,62 L -7,62 Z" fill="#E2E8F0" />
                    <path d="M -6,28 L -14,42 L 8,42" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M 6,28 L 14,42 L -8,42" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M -8,62 L 8,62 L 9,82 L -9,82 Z" fill="#10B981" />
                    <path d="M -5,82 L -5,124" fill="none" stroke="#10B981" strokeWidth="5" strokeLinecap="round" />
                    <path d="M 5,82 L 5,124" fill="none" stroke="#10B981" strokeWidth="5" strokeLinecap="round" />
                    <ellipse cx="-4" cy="125" rx="6" ry="2.5" fill="#10B981" />
                    <ellipse cx="6" cy="125" rx="6" ry="2.5" fill="#10B981" />
                  </g>
                )}
              </svg>
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

  return null;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0F1D',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#F97316',
    letterSpacing: 0.5,
  },
  visualCanvas: {
    gap: 10,
  },
  stepPreviewRow: {
    flexDirection: 'row',
    gap: 6,
  },
  stepTab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  stepTabActive: {
    backgroundColor: 'rgba(249, 115, 22, 0.14)',
    borderColor: '#F97316',
  },
  stepTabText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
  },
  stepTabTextActive: {
    color: '#F97316',
  },
  demoVisualBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#040711',
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  svgContainer: {
    width: 120,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
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
    lineHeight: 15,
  },
  cuePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  cuePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
  },
});
