import React, { useState, useEffect } from 'react';
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
  XCircle,
  AlertTriangle,
  Activity,
  Layers,
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
  const [viewMode, setViewMode] = useState<'mocap' | 'errors'>('mocap');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [animFrame, setAnimFrame] = useState<number>(0);

  // Animação contínua de ciclo em 4 fases com timing esportivo biomecânico
  useEffect(() => {
    let timer: any;
    if (isPlaying && viewMode === 'mocap') {
      const durations = [1800, 1200, 1600, 1400]; // durações de cada fase
      timer = setTimeout(() => {
        setAnimFrame((prev) => (prev + 1) % 4);
      }, durations[animFrame] || 1500);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, animFrame, viewMode, activeTab]);

  const tabs = [
    {
      id: 'setup' as const,
      label: isPt ? '1. Posicionar Celular' : '1. Posizionamento',
      tag: isPt ? 'Distância & Câmera' : 'Distanza & Angolo',
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
      {/* ── SELETOR DE ABAS PRINCIPAIS ── */}
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

      {/* ── SUB-SELETOR: MOCAP BIOMECÂNICO vs ERROS CRÍTICOS (CERTO vs ERRADO) ── */}
      {activeTab !== 'setup' && (
        <View style={styles.viewModeRow}>
          <TouchableOpacity
            onPress={() => setViewMode('mocap')}
            style={[styles.viewModeBtn, viewMode === 'mocap' && styles.viewModeBtnActive]}
            activeOpacity={0.8}
          >
            <Activity size={13} color={viewMode === 'mocap' ? Colors.primary : '#94A3B8'} />
            <Text style={[styles.viewModeBtnText, viewMode === 'mocap' && styles.viewModeBtnTextActive]}>
              {isPt ? 'SIMULADOR BIOMECÂNICO' : 'SIMULATORE BIOMECCANICO'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setViewMode('errors')}
            style={[styles.viewModeBtn, viewMode === 'errors' && styles.viewModeBtnActiveWarning]}
            activeOpacity={0.8}
          >
            <AlertTriangle size={13} color={viewMode === 'errors' ? '#F59E0B' : '#94A3B8'} />
            <Text style={[styles.viewModeBtnText, viewMode === 'errors' && styles.viewModeBtnTextActiveWarning]}>
              {isPt ? 'CERTO vs. ERRADO' : 'CORRETTO vs. ERRATO'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ══════════════════════════════════════════════════════════════
          ESTÚDIO VISUAL MOCAP (VETOR SVG DE ALTA DEFINIÇÃO)
      ══════════════════════════════════════════════════════════════ */}
      {viewMode === 'mocap' && (
        <View style={styles.playerWrapper}>
          <View style={styles.videoStage}>
            {/* ── CENA 1: SETUP DA CÂMERA ── */}
            {activeTab === 'setup' && (
              <svg width="100%" height="210" viewBox="0 0 380 210" style={{ display: 'block' }}>
                <defs>
                  <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.45" />
                    <stop offset="70%" stopColor="#00E5FF" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00E5FF" />
                    <stop offset="100%" stopColor="#0088FF" />
                  </linearGradient>
                </defs>

                {/* Grade perspectiva de laboratório biomecânico */}
                <line x1="30" y1="175" x2="350" y2="175" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
                <line x1="10" y1="195" x2="370" y2="195" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <line x1="65" y1="175" x2="40" y2="205" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <line x1="180" y1="175" x2="180" y2="205" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                <line x1="295" y1="175" x2="320" y2="205" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

                {/* Cone de visão da Câmera (Field of View) */}
                <polygon points="65,138 310,25 310,185 65,148" fill="url(#beamGrad)" />
                <line x1="65" y1="138" x2="310" y2="25" stroke="#00E5FF" strokeWidth="1" strokeDasharray="4,4" opacity="0.6" />
                <line x1="65" y1="148" x2="310" y2="185" stroke="#00E5FF" strokeWidth="1" strokeDasharray="4,4" opacity="0.6" />

                {/* Régua de Distância 2.0 Metros */}
                <line x1="65" y1="188" x2="295" y2="188" stroke="#00E5FF" strokeWidth="1.5" />
                <circle cx="65" cy="188" r="3" fill="#00E5FF" />
                <circle cx="295" cy="188" r="3" fill="#00E5FF" />
                <rect x="145" y="179" width="70" height="18" rx="5" fill="#0A0F1D" stroke="#00E5FF" strokeWidth="1" />
                <text x="180" y="192" fill="#00E5FF" fontSize="10" fontWeight="900" textAnchor="middle" letterSpacing="0.6">
                  2.0 METROS
                </text>

                {/* Celular no Chão apoiado (inclinado a ~75°) */}
                <g transform="translate(48, 118) rotate(12)">
                  {/* Apoio / garrafa de água */}
                  <rect x="-10" y="15" width="12" height="28" rx="3" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                  {/* Aparelho celular */}
                  <rect x="0" y="0" width="22" height="42" rx="4" fill="#0F172A" stroke="#00E5FF" strokeWidth="2" />
                  {/* Tela brilhando */}
                  <rect x="2" y="3" width="18" height="34" rx="2" fill="rgba(0, 229, 255, 0.25)" />
                  {/* Lente da câmera */}
                  <circle cx="11" cy="7" r="2" fill="#00E5FF" />
                </g>
                <text x="59" y="170" fill="#94A3B8" fontSize="8" fontWeight="700" textAnchor="middle">
                  CELULAR
                </text>

                {/* Caixa delimitadora de enquadramento (Viewfinder da Câmera) */}
                <g stroke="#10B981" strokeWidth="2" fill="none">
                  {/* Cantos do Viewfinder */}
                  <path d="M 270,30 L 260,30 L 260,40" />
                  <path d="M 320,30 L 330,30 L 330,40" />
                  <path d="M 270,180 L 260,180 L 260,170" />
                  <path d="M 320,180 L 330,180 L 330,170" />
                </g>

                {/* Silhueta Atlética de Corpo Inteiro (Vetor Realista) */}
                <g transform="translate(295, 25)">
                  {/* Cabeça */}
                  <circle cx="0" cy="18" r="8" fill="#FFFFFF" />
                  {/* Pescoço & Tronco Atlético */}
                  <path d="M -6,28 L 6,28 L 7,65 L -7,65 Z" fill="#E2E8F0" />
                  {/* Braço com mão na cintura */}
                  <path d="M -6,30 L -15,48 L -7,58" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 6,30 L 15,48 L 7,58" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Shorts / Quadril */}
                  <path d="M -8,65 L 8,65 L 9,85 L -9,85 Z" fill="#00E5FF" />
                  {/* Pernas esticadas */}
                  <path d="M -5,85 L -5,148 L 1,148" fill="none" stroke="#CBD5E1" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M 5,85 L 5,148 L 11,148" fill="none" stroke="#CBD5E1" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Tênis / Pés apoiados no chão */}
                  <ellipse cx="-2" cy="149" rx="6" ry="2.5" fill="#10B981" />
                  <ellipse cx="8" cy="149" rx="6" ry="2.5" fill="#10B981" />
                </g>

                {/* Selo de Enquadramento Válido */}
                <rect x="235" y="10" width="130" height="20" rx="6" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" strokeWidth="1" />
                <text x="300" y="24" fill="#10B981" fontSize="9" fontWeight="900" textAnchor="middle" letterSpacing="0.4">
                  ✓ CORPO & PÉS VISÍVEIS
                </text>
              </svg>
            )}

            {/* ── CENA 2: SALTO CMJ (4 FASES VETORIAIS COM TELEMETRIA) ── */}
            {activeTab === 'cmj' && (
              <svg width="100%" height="210" viewBox="0 0 380 210" style={{ display: 'block' }}>
                <defs>
                  <linearGradient id="cmjForceGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Linha do Solo com grid biomecânico */}
                <line x1="40" y1="180" x2="340" y2="180" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                <line x1="190" y1="20" x2="190" y2="180" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3,3" />

                {/* ── FASE 0: ERETO (MÃOS NA CINTURA, JOELHOS 180°) ── */}
                {animFrame === 0 && (
                  <g>
                    {/* Silhueta Ereta */}
                    <g transform="translate(190, 32)">
                      {/* Cabeça */}
                      <circle cx="0" cy="18" r="9" fill="#FFFFFF" />
                      {/* Tronco */}
                      <path d="M -8,29 L 8,29 L 9,70 L -9,70 Z" fill="#E2E8F0" />
                      {/* Braços com mãos ancoradas na cintura */}
                      <path d="M -8,32 L -18,52 L -9,64" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M 8,32 L 18,52 L 9,64" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      {/* Shorts */}
                      <path d="M -10,70 L 10,70 L 11,92 L -11,92 Z" fill="#00E5FF" />
                      {/* Pernas Estendidas (180°) */}
                      <path d="M -6,92 L -6,145" fill="none" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" />
                      <path d="M 6,92 L 6,145" fill="none" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" />
                      {/* Pés no chão */}
                      <ellipse cx="-4" cy="147" rx="7" ry="3" fill="#00E5FF" />
                      <ellipse cx="8" cy="147" rx="7" ry="3" fill="#00E5FF" />

                      {/* Marcadores de Articulação MoCap */}
                      <circle cx="-9" cy="64" r="3.5" fill="#10B981" />
                      <circle cx="9" cy="64" r="3.5" fill="#10B981" />
                      <circle cx="-6" cy="118" r="3" fill="#00E5FF" />
                      <circle cx="6" cy="118" r="3" fill="#00E5FF" />
                    </g>

                    {/* HUD Telemetria */}
                    <rect x="250" y="60" width="115" height="48" rx="8" fill="#0B132B" stroke="#00E5FF" strokeWidth="1" />
                    <text x="260" y="77" fill="#94A3B8" fontSize="9" fontWeight="800">ÂNGULO DO JOELHO</text>
                    <text x="260" y="98" fill="#00E5FF" fontSize="18" fontWeight="900">180.0°</text>

                    {/* Badge das mãos na cintura */}
                    <rect x="250" y="116" width="115" height="24" rx="6" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" strokeWidth="1" />
                    <text x="260" y="132" fill="#10B981" fontSize="9" fontWeight="800">✓ MÃOS NA CINTURA</text>
                  </g>
                )}

                {/* ── FASE 1: CONTRAMOVIMENTO RÁPIDO (~90° FLUIDO) ── */}
                {animFrame === 1 && (
                  <g>
                    {/* Vetor de descida rápida */}
                    <path d="M 190,40 L 190,65" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="3,3" />
                    <polygon points="186,63 194,63 190,70" fill="#F59E0B" />

                    {/* Silhueta Agachada a ~90° */}
                    <g transform="translate(190, 68)">
                      {/* Cabeça inclinada */}
                      <circle cx="5" cy="16" r="9" fill="#FFFFFF" />
                      {/* Tronco inclinado ~15° para frente */}
                      <path d="M -3,27 L 13,27 L 7,65 L -10,65 Z" fill="#E2E8F0" />
                      {/* Mãos continuam firmes na cintura */}
                      <path d="M -3,30 L -16,48 L -8,60" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M 13,30 L 22,48 L 10,60" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      {/* Shorts / Quadril para trás */}
                      <path d="M -12,65 L 9,65 L 5,85 L -18,85 Z" fill="#00E5FF" />
                      {/* Coxas a 90° e tíbias descendo para o calcanhar */}
                      <path d="M -14,85 L 14,92 L 6,110" fill="none" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M -2,85 L 22,92 L 14,110" fill="none" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                      {/* Pés no chão */}
                      <ellipse cx="9" cy="111" rx="8" ry="3" fill="#F59E0B" />
                      <ellipse cx="17" cy="111" rx="8" ry="3" fill="#F59E0B" />

                      {/* Arco indicador de 90° no joelho */}
                      <circle cx="18" cy="92" r="10" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="16,30" />
                    </g>

                    {/* HUD Telemetria */}
                    <rect x="250" y="60" width="115" height="48" rx="8" fill="#0B132B" stroke="#F59E0B" strokeWidth="1" />
                    <text x="260" y="77" fill="#94A3B8" fontSize="9" fontWeight="800">ÂNGULO DO JOELHO</text>
                    <text x="260" y="98" fill="#F59E0B" fontSize="18" fontWeight="900">92.4°</text>

                    <rect x="250" y="116" width="115" height="24" rx="6" fill="rgba(245, 158, 11, 0.15)" stroke="#F59E0B" strokeWidth="1" />
                    <text x="260" y="132" fill="#F59E0B" fontSize="9" fontWeight="800">⚡ ENERGIA ELÁSTICA</text>
                  </g>
                )}

                {/* ── FASE 2: VOO MÁXIMO (PERNAS ESTICADAS NO AR) ── */}
                {animFrame === 2 && (
                  <g>
                    {/* Vetores de Força Vertical subindo do solo */}
                    <polygon points="182,180 198,180 194,125 186,125" fill="url(#cmjForceGrad)" />
                    <line x1="190" y1="180" x2="190" y2="120" stroke="#10B981" strokeWidth="2.5" />
                    <polygon points="185,124 195,124 190,115" fill="#10B981" />

                    {/* Silhueta no ápice do salto (elevada no ar) */}
                    <g transform="translate(190, -10)">
                      {/* Cabeça */}
                      <circle cx="0" cy="18" r="9" fill="#FFFFFF" />
                      {/* Tronco */}
                      <path d="M -8,29 L 8,29 L 9,70 L -9,70 Z" fill="#E2E8F0" />
                      {/* Mãos coladas na cintura */}
                      <path d="M -8,32 L -18,52 L -9,64" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M 8,32 L 18,52 L 9,64" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      {/* Shorts */}
                      <path d="M -10,70 L 10,70 L 11,92 L -11,92 Z" fill="#00E5FF" />
                      {/* Pernas 100% estendidas e pontas dos pés esticadas para baixo */}
                      <path d="M -6,92 L -6,145" fill="none" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
                      <path d="M 6,92 L 6,145" fill="none" stroke="#10B981" strokeWidth="6" strokeLinecap="round" />
                      {/* Pontas dos pés esticadas (plantarflexão) */}
                      <ellipse cx="-6" cy="148" rx="3.5" ry="7" fill="#10B981" />
                      <ellipse cx="6" cy="148" rx="3.5" ry="7" fill="#10B981" />
                    </g>

                    {/* Régua de Altura de Salto */}
                    <line x1="140" y1="180" x2="140" y2="138" stroke="#10B981" strokeWidth="1.5" />
                    <line x1="135" y1="138" x2="145" y2="138" stroke="#10B981" strokeWidth="2" />
                    <line x1="135" y1="180" x2="145" y2="180" stroke="#10B981" strokeWidth="2" />
                    <text x="130" y="162" fill="#10B981" fontSize="10" fontWeight="900" textAnchor="end">
                      h (voo)
                    </text>

                    {/* HUD Telemetria de Voo */}
                    <rect x="240" y="60" width="125" height="48" rx="8" fill="#0B132B" stroke="#10B981" strokeWidth="1" />
                    <text x="250" y="77" fill="#94A3B8" fontSize="9" fontWeight="800">PERNAS NO AR</text>
                    <text x="250" y="98" fill="#10B981" fontSize="16" fontWeight="900">100% RETAS</text>

                    <rect x="240" y="116" width="125" height="24" rx="6" fill="rgba(16, 185, 129, 0.15)" stroke="#10B981" strokeWidth="1" />
                    <text x="250" y="132" fill="#10B981" fontSize="9" fontWeight="800">✓ NÃO DOBRE OS JOELHOS</text>
                  </g>
                )}

                {/* ── FASE 3: POUSO SUAVE ── */}
                {animFrame === 3 && (
                  <g>
                    {/* Silhueta Amortecendo no solo */}
                    <g transform="translate(190, 48)">
                      <circle cx="0" cy="18" r="9" fill="#FFFFFF" />
                      <path d="M -7,28 L 7,28 L 8,68 L -8,68 Z" fill="#E2E8F0" />
                      <path d="M -7,30 L -17,50 L -8,62" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M 7,30 L 17,50 L 8,62" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M -9,68 L 9,68 L 8,88 L -8,88 Z" fill="#00E5FF" />
                      {/* Joelhos flexionam suavemente a ~130° para absorver impacto */}
                      <path d="M -7,88 L -12,108 L -7,130" fill="none" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M 7,88 L 12,108 L 7,130" fill="none" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                      <ellipse cx="-6" cy="132" rx="7" ry="2.5" fill="#10B981" />
                      <ellipse cx="8" cy="132" rx="7" ry="2.5" fill="#10B981" />
                    </g>

                    <rect x="245" y="70" width="120" height="42" rx="8" fill="#0B132B" stroke="#10B981" strokeWidth="1" />
                    <text x="255" y="87" fill="#94A3B8" fontSize="9" fontWeight="800">ABSORÇÃO</text>
                    <text x="255" y="104" fill="#10B981" fontSize="14" fontWeight="900">POUSO SUAVE</text>
                  </g>
                )}
              </svg>
            )}

            {/* ── CENA 3: SALTO SJ (SQUAT JUMP COM PAUSA DE 2S) ── */}
            {activeTab === 'sj' && (
              <svg width="100%" height="210" viewBox="0 0 380 210" style={{ display: 'block' }}>
                <line x1="40" y1="180" x2="340" y2="180" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

                {/* ── FASE 0 & 1: ISOMETRIA A 90° CONGELADO POR 2 SEGUNDOS ── */}
                {(animFrame === 0 || animFrame === 1) && (
                  <g>
                    <g transform="translate(190, 68)">
                      <circle cx="5" cy="16" r="9" fill="#FFFFFF" />
                      <path d="M -3,27 L 13,27 L 7,65 L -10,65 Z" fill="#E2E8F0" />
                      <path d="M -3,30 L -16,48 L -8,60" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M 13,30 L 22,48 L 10,60" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M -12,65 L 9,65 L 5,85 L -18,85 Z" fill="#A855F7" />
                      <path d="M -14,85 L 14,92 L 6,110" fill="none" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M -2,85 L 22,92 L 14,110" fill="none" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                      <ellipse cx="9" cy="111" rx="8" ry="3" fill="#A855F7" />
                      <ellipse cx="17" cy="111" rx="8" ry="3" fill="#A855F7" />
                    </g>

                    {/* HUD Contagem Regressiva Isométrica */}
                    <rect x="235" y="55" width="130" height="52" rx="8" fill="#0B132B" stroke="#A855F7" strokeWidth="1.5" />
                    <text x="245" y="73" fill="#C084FC" fontSize="9" fontWeight="800">
                      {animFrame === 0 ? 'CONGELE NA POSIÇÃO' : 'PAUSA ISOMÉTRICA'}
                    </text>
                    <text x="245" y="97" fill="#FFFFFF" fontSize="18" fontWeight="900">
                      {animFrame === 0 ? '⏱️ 2.0 SEG' : '⏱️ 1.0 SEG'}
                    </text>

                    <rect x="235" y="115" width="130" height="24" rx="6" fill="rgba(168, 85, 247, 0.15)" stroke="#A855F7" strokeWidth="1" />
                    <text x="245" y="131" fill="#C084FC" fontSize="9" fontWeight="800">ZERO CONTRAMOVIMENTO</text>
                  </g>
                )}

                {/* ── FASE 2: EXPLOSÃO PURA CONCÊNTRICA ── */}
                {animFrame === 2 && (
                  <g>
                    <line x1="190" y1="180" x2="190" y2="120" stroke="#A855F7" strokeWidth="3" />
                    <polygon points="184,124 196,124 190,114" fill="#A855F7" />

                    <g transform="translate(190, -10)">
                      <circle cx="0" cy="18" r="9" fill="#FFFFFF" />
                      <path d="M -8,29 L 8,29 L 9,70 L -9,70 Z" fill="#E2E8F0" />
                      <path d="M -8,32 L -18,52 L -9,64" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M 8,32 L 18,52 L 9,64" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M -10,70 L 10,70 L 11,92 L -11,92 Z" fill="#A855F7" />
                      <path d="M -6,92 L -6,145" fill="none" stroke="#A855F7" strokeWidth="6" strokeLinecap="round" />
                      <path d="M 6,92 L 6,145" fill="none" stroke="#A855F7" strokeWidth="6" strokeLinecap="round" />
                      <ellipse cx="-6" cy="148" rx="3.5" ry="7" fill="#A855F7" />
                      <ellipse cx="6" cy="148" rx="3.5" ry="7" fill="#A855F7" />
                    </g>

                    <rect x="235" y="60" width="130" height="48" rx="8" fill="#0B132B" stroke="#A855F7" strokeWidth="1" />
                    <text x="245" y="77" fill="#94A3B8" fontSize="9" fontWeight="800">POTÊNCIA PURA</text>
                    <text x="245" y="98" fill="#C084FC" fontSize="16" fontWeight="900">SEM IMPULSO</text>
                  </g>
                )}

                {/* ── FASE 3: POUSO SJ ── */}
                {animFrame === 3 && (
                  <g>
                    <g transform="translate(190, 48)">
                      <circle cx="0" cy="18" r="9" fill="#FFFFFF" />
                      <path d="M -7,28 L 7,28 L 8,68 L -8,68 Z" fill="#E2E8F0" />
                      <path d="M -7,30 L -17,50 L -8,62" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M 7,30 L 17,50 L 8,62" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M -9,68 L 9,68 L 8,88 L -8,88 Z" fill="#A855F7" />
                      <path d="M -7,88 L -12,108 L -7,130" fill="none" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M 7,88 L 12,108 L 7,130" fill="none" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                      <ellipse cx="-6" cy="132" rx="7" ry="2.5" fill="#A855F7" />
                      <ellipse cx="8" cy="132" rx="7" ry="2.5" fill="#A855F7" />
                    </g>
                  </g>
                )}
              </svg>
            )}

            {/* Badge de Tecnologia MoCap no topo do palco */}
            <View style={styles.videoOverlayBadge}>
              <Sparkles size={11} color={Colors.primary} />
              <Text style={styles.videoOverlayBadgeText}>
                {activeTab === 'setup'
                  ? (isPt ? 'ENQUADRAMENTO OBRIGATÓRIO (240 FPS)' : 'INQUADRATURA OBBLIGATORIA (240 FPS)')
                  : (isPt ? `FASE ${animFrame + 1} DE 4 • TELEMETRIA LOTURCO` : `FASE ${animFrame + 1} DI 4 • TELEMETRIA LOTURCO`)}
              </Text>
            </View>

            {/* Barra de Controle com Seletores de Fase */}
            {activeTab !== 'setup' && (
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

                {/* Botões diretos para clicar na fase desejada */}
                <View style={styles.phaseSelectorRow}>
                  {[0, 1, 2, 3].map((f) => (
                    <TouchableOpacity
                      key={f}
                      onPress={() => {
                        setIsPlaying(false);
                        setAnimFrame(f);
                      }}
                      style={[
                        styles.phaseDotBtn,
                        animFrame === f && styles.phaseDotBtnActive,
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.phaseDotNum, animFrame === f && styles.phaseDotNumActive]}>
                        {f + 1}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={() => {
                    setAnimFrame(0);
                    setIsPlaying(true);
                  }}
                  style={styles.replayMiniBtn}
                  activeOpacity={0.8}
                >
                  <RotateCcw size={12} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            )}
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
                  {animFrame === 0 && (isPt ? 'Fase 1: Postura Inicial Ereta' : 'Fase 1: Postura Iniziale')}
                  {animFrame === 1 && (isPt ? 'Fase 2: Contramovimento Rápido (~90°)' : 'Fase 2: Contromovimento Rapido')}
                  {animFrame === 2 && (isPt ? 'Fase 3: Voo Máximo com Pernas Retas' : 'Fase 3: Volo a Gambe Distese')}
                  {animFrame === 3 && (isPt ? 'Fase 4: Aterrissagem com Amortecimento' : 'Fase 4: Atterraggio Morbido')}
                </Text>
                <View style={styles.bulletItem}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>
                    <Text style={styles.boldWhite}>{isPt ? 'Mãos sempre na cintura' : 'Mani sui fianchi'}:</Text>{' '}
                    {isPt ? 'isole os braços para medir 100% da potência elástica das pernas.' : 'escludi le braccia.'}
                  </Text>
                </View>
                <View style={styles.bulletItem}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>
                    <Text style={styles.boldWhite}>{isPt ? 'Sem dobrar joelhos no ar' : 'Gambe tese in volo'}:</Text>{' '}
                    {isPt ? 'mantenha tornozelos e pernas estendidos como uma seta até tocar o solo.' : 'non flettere le ginocchia.'}
                  </Text>
                </View>
              </>
            )}

            {activeTab === 'sj' && (
              <>
                <Text style={styles.instructionTitle}>
                  {animFrame <= 1 && (isPt ? 'Fase 1 & 2: Pausa Isométrica de 2s a 90°' : 'Fase 1 & 2: Pausa Isometrica di 2s')}
                  {animFrame === 2 && (isPt ? 'Fase 3: Explosão Concêntrica Pura' : 'Fase 3: Esplosione Concentrica')}
                  {animFrame === 3 && (isPt ? 'Fase 4: Aterrissagem Controlada' : 'Fase 4: Atterraggio')}
                </Text>
                <View style={styles.bulletItem}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>
                    <Text style={styles.boldWhite}>{isPt ? 'Pausa total de 2 segundos' : 'Fermo per 2 secondi'}:</Text>{' '}
                    {isPt ? 'dissipa toda a elasticidade para medir força muscular pura.' : 'elimina l\'energia elastica.'}
                  </Text>
                </View>
                <View style={styles.bulletItem}>
                  <View style={styles.bulletDot} />
                  <Text style={styles.bulletText}>
                    <Text style={styles.boldWhite}>{isPt ? 'Zero contra-movimento' : 'Nessun contromovimento'}:</Text>{' '}
                    {isPt ? 'não desça mais antes de subir; salte direto para o teto.' : 'non scendere prima di spingere.'}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      )}

      {/* ══════════════════════════════════════════════════════════════
          GUIA VISUAL DE ERROS CRÍTICOS (CERTO vs. ERRADO)
      ══════════════════════════════════════════════════════════════ */}
      {viewMode === 'errors' && (
        <View style={styles.errorsContainer}>
          {/* Card 1: Mãos Livres vs Mãos na Cintura */}
          <View style={styles.errorCard}>
            <View style={styles.errorHeaderRow}>
              <View style={styles.wrongPill}>
                <XCircle size={13} color="#EF4444" />
                <Text style={styles.wrongPillText}>{isPt ? 'ERRADO' : 'ERRATO'}</Text>
              </View>
              <Text style={styles.errorCardTitle}>
                {isPt ? 'Balançar os braços para saltar' : 'Slanciare le braccia'}
              </Text>
            </View>
            <Text style={styles.errorCardDesc}>
              {isPt
                ? 'Usar os braços adiciona 12% a 15% de impulsão falsa, estragando o cálculo científico do seu perfil neural e da sua carga ótima (OPL).'
                : 'Usare le braccia aggiunge il 15% di spinta fittizia, invalidando il profilo di potenza neurale.'}
            </Text>
            <View style={styles.correctRow}>
              <CheckCircle2 size={13} color="#10B981" />
              <Text style={styles.correctRowText}>
                {isPt ? 'CORRETO: Mantenha as mãos firmes nos ossos do quadril (cristas ilíacas) o tempo todo.' : 'CORRETTO: Mani sempre incollate ai fianchi.'}
              </Text>
            </View>
          </View>

          {/* Card 2: Encolher Pernas no Ar */}
          <View style={styles.errorCard}>
            <View style={styles.errorHeaderRow}>
              <View style={styles.wrongPill}>
                <XCircle size={13} color="#EF4444" />
                <Text style={styles.wrongPillText}>{isPt ? 'ERRADO' : 'ERRATO'}</Text>
              </View>
              <Text style={styles.errorCardTitle}>
                {isPt ? 'Puxar os joelhos para o peito no ar' : 'Piegare le ginocchia in aria'}
              </Text>
            </View>
            <Text style={styles.errorCardDesc}>
              {isPt
                ? 'Dobrar os joelhos atrasa o toque dos pés no solo. A câmera mede a altura pela física do tempo de voo (h = g·t²/8); encolher as pernas gera um número mentiroso.'
                : 'Flettere le ginocchia ritarda il contatto al suolo e falsa la formula balistica del tempo di volo.'}
            </Text>
            <View style={styles.correctRow}>
              <CheckCircle2 size={13} color="#10B981" />
              <Text style={styles.correctRowText}>
                {isPt ? 'CORRETO: Voe com pernas e pontas dos pés estendidas para baixo até aterrissar.' : 'CORRETTO: Vola con gambe e caviglie completamente tese verso il basso.'}
              </Text>
            </View>
          </View>

          {/* Card 3: Mini-balanço no Squat Jump */}
          {activeTab === 'sj' && (
            <View style={styles.errorCard}>
              <View style={styles.errorHeaderRow}>
                <View style={styles.wrongPill}>
                  <XCircle size={13} color="#EF4444" />
                  <Text style={styles.wrongPillText}>{isPt ? 'ERRADO' : 'ERRATO'}</Text>
                </View>
                <Text style={styles.errorCardTitle}>
                  {isPt ? 'Dar um tranco ou descer mais antes de subir no SJ' : 'Fare un contromovimento nel Squat Jump'}
                </Text>
              </View>
              <Text style={styles.errorCardDesc}>
                {isPt
                  ? 'Se você agacha e desce mais 2cm antes de subir, você ativou o reflexo miotático elástico. O SJ precisa ser 100% concêntrico puro.'
                  : 'Scendere ulteriormente attiva il riflesso elastico. Il salto SJ deve essere concentrico puro.'}
              </Text>
              <View style={styles.correctRow}>
                <CheckCircle2 size={13} color="#10B981" />
                <Text style={styles.correctRowText}>
                  {isPt ? 'CORRETO: Agache a 90°, congele 2s imóvel como uma estátua e exploda direto para cima.' : 'CORRETTO: Rimani immobile per 2 secondi ed esplodi direttamente verso l\'alto.'}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#070A14',
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
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
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
  viewModeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  viewModeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  viewModeBtnActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  viewModeBtnActiveWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  viewModeBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.4,
  },
  viewModeBtnTextActive: {
    color: Colors.primary,
  },
  viewModeBtnTextActiveWarning: {
    color: '#F59E0B',
  },
  playerWrapper: {
    backgroundColor: '#040711',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  videoStage: {
    height: 210,
    backgroundColor: '#02040A',
    position: 'relative',
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
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
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
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  playMiniBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseSelectorRow: {
    flexDirection: 'row',
    gap: 6,
  },
  phaseDotBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseDotBtnActive: {
    backgroundColor: Colors.primary,
  },
  phaseDotNum: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94A3B8',
  },
  phaseDotNumActive: {
    color: '#000000',
  },
  replayMiniBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 12,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  instructionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    marginTop: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
  boldWhite: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  errorsContainer: {
    gap: 8,
  },
  errorCard: {
    backgroundColor: '#0A0F1D',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    gap: 6,
  },
  errorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wrongPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  wrongPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#EF4444',
  },
  errorCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
  },
  errorCardDesc: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
  correctRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 8,
    padding: 8,
    marginTop: 2,
  },
  correctRowText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#6EE7B7',
    lineHeight: 15,
  },
});
