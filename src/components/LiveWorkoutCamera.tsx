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
  Camera,
  RefreshCw,
  Play,
  Square,
  AlertTriangle,
  Zap,
  Check,
  Volume2,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

interface LiveWorkoutCameraProps {
  currentSet: number;
  totalSets: number;
  prescribedLoadKg: number;
  onSetCompleted: (repsCount: number, avgHeightCm: number, finalLossPercent: number) => void;
  onCancel?: () => void;
}

export interface LiveRep {
  repNumber: number;
  heightCm: number;
  flightTimeMs: number;
  lossPercent: number;
  timestamp: number;
}

export const LiveWorkoutCamera: React.FC<LiveWorkoutCameraProps> = ({
  currentSet,
  totalSets,
  prescribedLoadKg,
  onSetCompleted,
  onCancel,
}) => {
  const { language } = useApp();
  const isPt = language === 'pt';

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);

  // Histórico de repetições da série ao vivo
  const [reps, setReps] = useState<LiveRep[]>([]);
  const [firstRepHeight, setFirstRepHeight] = useState<number | null>(null);
  const [currentLoss, setCurrentLoss] = useState<number>(0);
  const [isFatigueExceeded, setIsFatigueExceeded] = useState<boolean>(false);
  const [liveJumpState, setLiveJumpState] = useState<'ground' | 'air'>('ground');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Estado interno da máquina de estados do salto
  const stateRef = useRef<{
    inAir: boolean;
    takeoffTimestamp: number;
    baselineCentroidY: number;
    prevGray: Float32Array | null;
    stableFrames: number;
  }>({
    inAir: false,
    takeoffTimestamp: 0,
    baselineCentroidY: 0.65,
    prevGray: null,
    stableFrames: 0,
  });

  // Toca som curto via Web Audio API
  const playSound = (type: 'rep' | 'fatigue') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'rep') {
        osc.frequency.setValueAtTime(880, ctx.currentTime); // Tom alto confirmação
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } else {
        // Alerta de fadiga (tom duplo decrescente)
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(330, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {}
  };

  const startCamera = async (facing: 'environment' | 'user') => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }

      if (!navigator?.mediaDevices?.getUserMedia) {
        setCameraError(
          isPt
            ? 'Câmera não suportada neste navegador.'
            : 'Fotocamera non supportata su questo browser.'
        );
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 60, min: 30 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      setCameraError(
        isPt
          ? 'Permissão de câmera negada ou indisponível.'
          : 'Permesso fotocamera negato o non disponibile.'
      );
    }
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [facingMode]);

  const toggleFacingMode = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
  };

  // Processamento ao vivo de quadros
  const processLiveFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      animationFrameIdRef.current = requestAnimationFrame(processLiveFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      animationFrameIdRef.current = requestAnimationFrame(processLiveFrame);
      return;
    }

    const w = canvas.width;
    const h = canvas.height;
    ctx.drawImage(video, 0, 0, w, h);
    const frameData = ctx.getImageData(0, 0, w, h).data;
    const gray = new Float32Array(w * h);

    let motionSum = 0;
    let weightedY = 0;
    let activePixels = 0;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = y * w + x;
        const p = idx * 4;
        const g = 0.299 * frameData[p] + 0.587 * frameData[p + 1] + 0.114 * frameData[p + 2];
        gray[idx] = g;

        if (stateRef.current.prevGray) {
          const diff = Math.abs(g - stateRef.current.prevGray[idx]);
          if (diff > 25) {
            motionSum += diff;
            weightedY += y / h;
            activePixels++;
          }
        }
      }
    }

    const motion = motionSum / (w * h);
    const centroidY = activePixels > 10 ? weightedY / activePixels : 0.65;
    stateRef.current.prevGray = gray;

    const now = performance.now();

    // ── MÁQUINA DE ESTADOS DO SALTO EM TEMPO REAL ──
    if (!stateRef.current.inAir) {
      // Atleta no chão: calibra centroidY de repouso
      if (motion < 2.0) {
        stateRef.current.stableFrames++;
        if (stateRef.current.stableFrames > 15) {
          stateRef.current.baselineCentroidY =
            stateRef.current.baselineCentroidY * 0.9 + centroidY * 0.1;
        }
      }

      // Detecção de Decolagem: movimento brusco ascendente (centroidY sobe em relação à base)
      const isRising = centroidY < stateRef.current.baselineCentroidY - 0.08;
      if (motion > 4.5 && isRising) {
        stateRef.current.inAir = true;
        stateRef.current.takeoffTimestamp = now;
        setLiveJumpState('air');
      }
    } else {
      // Atleta no ar: monitora a aterrissagem
      const flightDurationSec = (now - stateRef.current.takeoffTimestamp) / 1000;

      // Pouso: centroidY volta perto da base ou movimento desacelera
      const returnedToFloor = centroidY >= stateRef.current.baselineCentroidY - 0.04;
      const isLanding = returnedToFloor && flightDurationSec >= 0.25;

      if (isLanding || flightDurationSec > 1.25) {
        stateRef.current.inAir = false;
        setLiveJumpState('ground');

        if (flightDurationSec >= 0.28 && flightDurationSec <= 1.05) {
          const jumpHeightCm = Math.max(
            10,
            Math.round(((9.81 * (flightDurationSec ** 2)) / 8) * 100 * 10) / 10
          );
          registerRep(jumpHeightCm, Math.round(flightDurationSec * 1000));
        }
      }
    }

    animationFrameIdRef.current = requestAnimationFrame(processLiveFrame);
  };

  const registerRep = (heightCm: number, flightMs: number) => {
    setReps((prev) => {
      const repNum = prev.length + 1;
      let benchmark = firstRepHeight;
      if (repNum === 1 || benchmark === null) {
        benchmark = heightCm;
        setFirstRepHeight(heightCm);
      }

      const loss =
        benchmark > 0
          ? Math.max(0, Math.round(((benchmark - heightCm) / benchmark) * 100 * 10) / 10)
          : 0;

      setCurrentLoss(loss);

      if (loss >= 10.0 && repNum > 1) {
        setIsFatigueExceeded(true);
        playSound('fatigue');
      } else {
        playSound('rep');
      }

      return [
        ...prev,
        {
          repNumber: repNum,
          heightCm,
          flightTimeMs: flightMs,
          lossPercent: loss,
          timestamp: Date.now(),
        },
      ];
    });
  };

  const toggleMonitoring = () => {
    if (isMonitoring) {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      setIsMonitoring(false);
    } else {
      setIsMonitoring(true);
      stateRef.current.inAir = false;
      stateRef.current.prevGray = null;
      animationFrameIdRef.current = requestAnimationFrame(processLiveFrame);
    }
  };

  const handleManualRep = () => {
    const defaultHeight = firstRepHeight ? Math.round((firstRepHeight * 0.96) * 10) / 10 : 42.5;
    registerRep(defaultHeight, 580);
  };

  const handleFinishSet = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    const count = reps.length;
    const avg =
      count > 0
        ? Math.round((reps.reduce((a, b) => a + b.heightCm, 0) / count) * 10) / 10
        : 0;
    onSetCompleted(count, avg, currentLoss);
  };

  const latestRep = reps.length > 0 ? reps[reps.length - 1] : null;

  return (
    <View style={styles.container}>
      {/* ── HEADER DA SÉRIE ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.setHeaderTitle}>
            {isPt ? `Série ${currentSet} de ${totalSets}` : `Serie ${currentSet} di ${totalSets}`}
          </Text>
          <Text style={styles.setHeaderSub}>
            {isPt
              ? `Carga Prescrita: ${prescribedLoadKg} kg (OPL)`
              : `Carico Prescritto: ${prescribedLoadKg} kg (OPL)`}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.facingToggleBtn}
          onPress={toggleFacingMode}
          activeOpacity={0.8}
        >
          <RefreshCw size={14} color={Colors.primary} />
          <Text style={styles.facingToggleText}>
            {isPt
              ? (facingMode === 'environment' ? 'Traseira' : 'Frontal')
              : (facingMode === 'environment' ? 'Posteriore' : 'Frontale')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── CÂMERA AO VIVO COM TELEMETRIA SOBREPOSTA ── */}
      <View style={styles.videoWrapper}>
        <video
          ref={videoRef as any}
          playsInline
          muted
          style={{
            width: '100%',
            height: 250,
            objectFit: 'cover',
            borderRadius: 16,
            backgroundColor: '#000000',
          }}
        />

        {/* Canvas de processamento oculto */}
        <canvas
          ref={canvasRef as any}
          width={96}
          height={72}
          style={{ display: 'none' }}
        />

        {/* Status Ao Vivo: Ar / Chão */}
        <View style={styles.livePill}>
          <View
            style={[
              styles.liveDot,
              liveJumpState === 'air' && { backgroundColor: Colors.primary },
            ]}
          />
          <Text style={styles.livePillText}>
            {isMonitoring
              ? (liveJumpState === 'air'
                  ? (isPt ? 'NO AR' : 'IN VOLO')
                  : (isPt ? 'MONITORANDO' : 'IN ASCOLTO'))
              : (isPt ? 'PAUSADO' : 'IN PAUSA')}
          </Text>
        </View>

        {/* Carga OPL no canto do vídeo */}
        <View style={styles.weightCornerBadge}>
          <Text style={styles.weightCornerText}>{prescribedLoadKg} kg</Text>
        </View>
      </View>

      {/* ── TELEMETRIA DA REPETIÇÃO AO VIVO (VISÍVEL DO CHÃO) ── */}
      <View style={styles.telemetryCard}>
        <View style={styles.telemetryCol}>
          <Text style={styles.telemetryLabel}>
            {isPt ? 'ÚLTIMO SALTO' : 'ULTIMO SALTO'}
          </Text>
          <Text style={styles.telemetryValue}>
            {latestRep ? `${latestRep.heightCm.toFixed(1)}` : '--'}
            <Text style={{ fontSize: 16, color: '#94A3B8' }}> cm</Text>
          </Text>
          <Text style={styles.telemetrySub}>
            {latestRep ? `${latestRep.flightTimeMs} ms` : (isPt ? 'Aguardando salto' : 'In attesa')}
          </Text>
        </View>

        <View style={styles.telemetryDivider} />

        <View style={styles.telemetryCol}>
          <Text style={styles.telemetryLabel}>
            {isPt ? 'PERDA DE VELOCIDADE' : 'PERDITA DI VELOCITÀ'}
          </Text>
          <Text
            style={[
              styles.telemetryValue,
              isFatigueExceeded && { color: '#EF4444' },
            ]}
          >
            {reps.length > 0 ? `-${currentLoss.toFixed(1)}%` : '0.0%'}
          </Text>
          <Text
            style={[
              styles.telemetrySub,
              isFatigueExceeded && { color: '#EF4444', fontWeight: '800' },
            ]}
          >
            {isFatigueExceeded
              ? (isPt ? '⚠️ LIMITE > 10% ATINGIDO' : '⚠️ SOGLIA > 10% RAGGIUNTA')
              : (isPt ? 'Limite ideal: < 10%' : 'Soglia ottimale: < 10%')}
          </Text>
        </View>

        <View style={styles.telemetryDivider} />

        <View style={styles.telemetryCol}>
          <Text style={styles.telemetryLabel}>
            {isPt ? 'REPS VÁLIDAS' : 'RIPETIZIONI'}
          </Text>
          <Text style={[styles.telemetryValue, { color: Colors.primary }]}>
            {reps.length}
          </Text>
          <Text style={styles.telemetrySub}>
            {firstRepHeight ? `1º: ${firstRepHeight} cm` : '--'}
          </Text>
        </View>
      </View>

      {/* ── ALERTA DE FADIGA NEURAL DE LOTURCO ── */}
      {isFatigueExceeded && (
        <View style={styles.fatigueBanner}>
          <AlertTriangle size={18} color="#FBBF24" />
          <View style={{ flex: 1 }}>
            <Text style={styles.fatigueBannerTitle}>
              {isPt
                ? 'Regra de Irineu Loturco: Perda ≥ 10%'
                : 'Regola di Irineu Loturco: Perdita ≥ 10%'}
            </Text>
            <Text style={styles.fatigueBannerBody}>
              {isPt
                ? 'Sua explosão começou a cair. Encerre esta série agora para treinar somente fibras rápidas e evitar fadiga crônica!'
                : 'La tua potenza sta calando. Termina questa serie ora per stimolare solo le fibre rapide ed evitare sovraccarico!'}
            </Text>
          </View>
        </View>
      )}

      {/* ── BOTÕES DE CONTROLE AO VIVO ── */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[
            styles.monitorActionBtn,
            isMonitoring && { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#EF4444' },
          ]}
          onPress={toggleMonitoring}
          activeOpacity={0.88}
        >
          {isMonitoring ? (
            <>
              <Square size={16} color="#EF4444" fill="#EF4444" />
              <Text style={[styles.monitorActionBtnText, { color: '#EF4444' }]}>
                {isPt ? 'PAUSAR CÂMERA' : 'METTI IN PAUSA'}
              </Text>
            </>
          ) : (
            <>
              <Play size={16} color="#000000" fill="#000000" />
              <Text style={styles.monitorActionBtnText}>
                {isPt ? 'INICIAR MONITORAMENTO AO VIVO' : 'AVVIA MONITORAGGIO LIVE'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Botão de Concluir Série */}
        <TouchableOpacity
          style={[
            styles.finishSetBtn,
            isFatigueExceeded && { backgroundColor: Colors.primary },
          ]}
          onPress={handleFinishSet}
          activeOpacity={0.88}
        >
          <Check size={18} color="#000000" strokeWidth={3} />
          <Text style={styles.finishSetBtnText}>
            {isFatigueExceeded
              ? (isPt ? 'ENCERRAR SÉRIE (LIMITE DE FADIGA)' : 'TERMINA SERIE (LIMITE FATICA)')
              : (isPt ? `CONCLUIR SÉRIE (${reps.length} REPS)` : `CONCLUDI SERIE (${reps.length} REPS)`)}
          </Text>
        </TouchableOpacity>

        {/* Botão de Repetição Manual (Fallback útil se luz ruim) */}
        <TouchableOpacity
          style={styles.manualRepBtn}
          onPress={handleManualRep}
          activeOpacity={0.8}
        >
          <Text style={styles.manualRepBtnText}>
            {isPt ? '+ Adicionar Salto Manualmente' : '+ Registra Salto Manualmente'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0D111F',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  setHeaderTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  setHeaderSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  facingToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  facingToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  videoWrapper: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  livePill: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  livePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  weightCornerBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  weightCornerText: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.primary,
  },
  telemetryCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  telemetryCol: {
    flex: 1,
    alignItems: 'center',
  },
  telemetryDivider: {
    width: 1,
    height: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  telemetryLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  telemetryValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  telemetrySub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  fatigueBanner: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    borderRadius: 14,
    padding: 12,
    alignItems: 'flex-start',
  },
  fatigueBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FDE68A',
  },
  fatigueBannerBody: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 16,
    marginTop: 2,
  },
  actionsContainer: {
    gap: 8,
  },
  monitorActionBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  monitorActionBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.4,
  },
  finishSetBtn: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  finishSetBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  manualRepBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  manualRepBtnText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
});
