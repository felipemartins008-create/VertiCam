import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  Camera,
  RotateCcw,
  Play,
  Pause,
  Check,
  Video,
  Sparkles,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Upload,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import {
  analyzeJumpVideo,
  calculateJumpHeightCm,
  DetectedJump,
  getSlowMoFactor,
  RecordingSpeedMode,
} from '../utils/jumpVideoAnalyzer';
import { JumpTutorialPlayer } from './JumpTutorialPlayer';

interface RealJumpCameraProps {
  jumpType: 'CMJ' | 'SJ';
  attemptNumber: number;
  totalAttempts?: number;
  onJumpConfirmed: (heightCm: number) => void;
  onBatchJumpsConfirmed?: (heightsCm: number[]) => void;
  onCancel?: () => void;
}

export const RealJumpCamera: React.FC<RealJumpCameraProps> = ({
  jumpType,
  attemptNumber,
  totalAttempts = 3,
  onJumpConfirmed,
  onBatchJumpsConfirmed,
}) => {
  const { language } = useApp();
  const isPt = language === 'pt';

  // Fases: 'tutorial' (instruções + upload) | 'analyzing' (visão computacional) | 'review' (conferência)
  const [cameraMode, setCameraMode] = useState<'tutorial' | 'analyzing' | 'review'>('tutorial');
  const [speedMode, setSpeedMode] = useState<RecordingSpeedMode>('slow240');
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [showTutorialPlayer, setShowTutorialPlayer] = useState<boolean>(false);

  // Vídeo enviado
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(0.25);
  const [videoDuration, setVideoDuration] = useState<number>(5.0);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Saltos detectados automaticamente + seleção atual
  const [detectedJumps, setDetectedJumps] = useState<DetectedJump[]>([]);
  const [selectedJumpIdx, setSelectedJumpIdx] = useState<number>(0);
  const [takeoffTime, setTakeoffTime] = useState<number | null>(null);
  const [landingTime, setLandingTime] = useState<number | null>(null);
  const [noJumpWarning, setNoJumpWarning] = useState<boolean>(false);

  const reviewVideoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const slowMoFactor = getSlowMoFactor(speedMode);

  const handleVideoFileSelected = async (event: any) => {
    const file = event?.target?.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setRecordedVideoUrl(url);
    setCameraMode('analyzing');
    setAnalysisProgress(0);
    setNoJumpWarning(false);

    const { duration, jumps } = await analyzeJumpVideo(url, speedMode, (pct) => {
      setAnalysisProgress(pct);
    });

    setVideoDuration(duration);
    setDetectedJumps(jumps);

    if (jumps.length > 0) {
      setSelectedJumpIdx(0);
      setTakeoffTime(jumps[0].takeoffTime);
      setLandingTime(jumps[0].landingTime);
      setCurrentTime(jumps[0].takeoffTime);
      setNoJumpWarning(false);
    } else {
      setTakeoffTime(null);
      setLandingTime(null);
      setNoJumpWarning(true);
    }

    setCameraMode('review');
  };

  const selectDetectedJump = (idx: number) => {
    const jump = detectedJumps[idx];
    if (!jump) return;
    setSelectedJumpIdx(idx);
    setTakeoffTime(jump.takeoffTime);
    setLandingTime(jump.landingTime);
    setCurrentTime(jump.takeoffTime);
    if (reviewVideoRef.current) {
      reviewVideoRef.current.pause();
      setIsPlaying(false);
      reviewVideoRef.current.currentTime = jump.takeoffTime;
    }
  };

  const togglePlayReview = () => {
    if (!reviewVideoRef.current) return;
    if (isPlaying) {
      reviewVideoRef.current.pause();
      setIsPlaying(false);
    } else {
      reviewVideoRef.current.playbackRate = playbackRate;
      reviewVideoRef.current.play();
      setIsPlaying(true);
    }
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (reviewVideoRef.current) {
      reviewVideoRef.current.playbackRate = rate;
    }
  };

  const stepFrame = (deltaSeconds: number) => {
    if (!reviewVideoRef.current) return;
    reviewVideoRef.current.pause();
    setIsPlaying(false);
    const newTime = Math.max(0, Math.min(videoDuration, reviewVideoRef.current.currentTime + deltaSeconds));
    reviewVideoRef.current.currentTime = newTime;
    setCurrentTime(Math.round(newTime * 100) / 100);
  };

  const markTakeoff = () => {
    if (!reviewVideoRef.current) return;
    reviewVideoRef.current.pause();
    setIsPlaying(false);
    const t = Math.round(reviewVideoRef.current.currentTime * 100) / 100;
    setTakeoffTime(t);
    setNoJumpWarning(false);
  };

  const markLanding = () => {
    if (!reviewVideoRef.current) return;
    reviewVideoRef.current.pause();
    setIsPlaying(false);
    const t = Math.round(reviewVideoRef.current.currentTime * 100) / 100;
    setLandingTime(t);
    setNoJumpWarning(false);
  };

  const hasValidMarkers = takeoffTime !== null && landingTime !== null && landingTime > takeoffTime;
  const rawDeltaSec = hasValidMarkers ? Math.max(0, landingTime - takeoffTime) : 0;
  const flightTime = Math.round((rawDeltaSec / slowMoFactor) * 1000) / 1000;
  const calculatedHeightCm = hasValidMarkers ? calculateJumpHeightCm(flightTime) : 0;

  const handleConfirmSingle = () => {
    if (!hasValidMarkers || calculatedHeightCm <= 0) return;
    onJumpConfirmed(calculatedHeightCm);
  };

  const handleConfirmAllBatch = () => {
    if (detectedJumps.length === 0) return;
    if (onBatchJumpsConfirmed) {
      onBatchJumpsConfirmed(detectedJumps.map((j) => j.heightCm));
    } else {
      onJumpConfirmed(detectedJumps[0].heightCm);
    }
  };

  const handleResetToTutorial = () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
    }
    setRecordedVideoUrl(null);
    setDetectedJumps([]);
    setTakeoffTime(null);
    setLandingTime(null);
    setNoJumpWarning(false);
    setCameraMode('tutorial');
  };

  return (
    <View style={styles.container}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.jumpTypeBadge}>
            <Text style={styles.jumpTypeBadgeText}>{jumpType}</Text>
          </View>
          <View>
            <Text style={styles.title}>
              {isPt
                ? (jumpType === 'CMJ' ? 'Salto com Contramovimento' : 'Salto sem Contramovimento')
                : (jumpType === 'CMJ' ? 'Salto con Contromovimento' : 'Salto senza Contromovimento')}
            </Text>
            <Text style={styles.subtitle}>
              {isPt
                ? `Tentativa ${attemptNumber} de ${totalAttempts} • Câmera Lenta Nativa`
                : `Tentativo ${attemptNumber} di ${totalAttempts} • Slow Motion Nativo`}
            </Text>
          </View>
        </View>
      </View>

      {/* ══════════════════════════════════════════════════════════════
          FASE 1: TELA BÁSICA (BOTÃO TUTORIAL + BOTÃO IMPORTAR VÍDEO)
      ══════════════════════════════════════════════════════════════ */}
      {cameraMode === 'tutorial' && (
        <View style={styles.cleanTutorialContainer}>
          {/* Botão de Tutorial (abre o GIF/Vídeo do salto) */}
          <TouchableOpacity
            style={[styles.cleanTutorialBtn, showTutorialPlayer && styles.cleanTutorialBtnOpen]}
            onPress={() => setShowTutorialPlayer(!showTutorialPlayer)}
            activeOpacity={0.85}
          >
            <Video size={18} color={showTutorialPlayer ? '#FFFFFF' : Colors.primary} />
            <Text style={[styles.cleanTutorialBtnText, showTutorialPlayer && { color: '#FFFFFF' }]}>
              {showTutorialPlayer
                ? (isPt ? 'FECHAR VÍDEO TUTORIAL' : 'CHIUDI VIDEO TUTORIAL')
                : (isPt ? '▶ ASSISTIR VÍDEO TUTORIAL' : '▶ GUARDA VIDEO TUTORIAL')}
            </Text>
          </TouchableOpacity>

          {showTutorialPlayer && (
            <View style={styles.tutorialPlayerWrapper}>
              <JumpTutorialPlayer initialTab={jumpType === 'CMJ' ? 'cmj' : 'sj'} />
            </View>
          )}

          {/* Input oculto para selecionar vídeo do salto */}
          <input
            ref={fileInputRef as any}
            type="file"
            accept="video/*"
            onChange={handleVideoFileSelected}
            style={{ display: 'none' }}
          />

          {/* Botão Principal: IMPORTAR VÍDEO */}
          <TouchableOpacity
            style={styles.cleanUploadBtn}
            onPress={() => fileInputRef.current?.click()}
            activeOpacity={0.88}
          >
            <Upload size={22} color="#000000" strokeWidth={2.5} />
            <Text style={styles.cleanUploadBtnText}>
              {isPt ? 'IMPORTAR VÍDEO DO SALTO' : 'IMPORTA VIDEO DEL SALTO'}
            </Text>
          </TouchableOpacity>

          {/* Seletor Discreto de 1 Linha (Modo Câmera Lenta) */}
          <View style={styles.cleanFpsRow}>
            <Text style={styles.cleanFpsLabel}>{isPt ? 'Taxa de quadros:' : 'Framerate:'}</Text>
            <TouchableOpacity
              onPress={() => setSpeedMode('slow240')}
              style={[styles.cleanFpsPill, speedMode === 'slow240' && styles.cleanFpsPillActive]}
            >
              <Text style={[styles.cleanFpsPillText, speedMode === 'slow240' && styles.cleanFpsPillTextActive]}>
                240 fps (Slow-mo)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSpeedMode('slow120')}
              style={[styles.cleanFpsPill, speedMode === 'slow120' && styles.cleanFpsPillActive]}
            >
              <Text style={[styles.cleanFpsPillText, speedMode === 'slow120' && styles.cleanFpsPillTextActive]}>
                120 fps
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSpeedMode('normal')}
              style={[styles.cleanFpsPill, speedMode === 'normal' && styles.cleanFpsPillActive]}
            >
              <Text style={[styles.cleanFpsPillText, speedMode === 'normal' && styles.cleanFpsPillTextActive]}>
                30 / 60 fps
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ══════════════════════════════════════════════════════════════
          FASE 2: ANÁLISE AUTOMÁTICA DE DECOLAGEM E POUSO
      ══════════════════════════════════════════════════════════════ */}
      {cameraMode === 'analyzing' && (
        <View style={styles.analyzingBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.analyzingTitle}>
            {isPt ? 'Detectando decolagem e pouso...' : 'Rilevamento stacco e atterraggio...'}
          </Text>
          <Text style={styles.analyzingSub}>
            {isPt
              ? `Analisando quadros do vídeo (${analysisProgress}%)`
              : `Analisi fotogrammi del video (${analysisProgress}%)`}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${analysisProgress}%` }]} />
          </View>
        </View>
      )}

      {/* ══════════════════════════════════════════════════════════════
          FASE 3: RESULTADO AUTOMÁTICO + CONFERÊNCIA OPCIONAL NO VÍDEO
      ══════════════════════════════════════════════════════════════ */}
      {cameraMode === 'review' && recordedVideoUrl && (
        <View style={styles.reviewContainer}>
          {/* Alerta se não detectou salto */}
          {noJumpWarning && (
            <View style={styles.noJumpBanner}>
              <AlertCircle size={18} color="#F59E0B" />
              <Text style={styles.noJumpText}>
                {isPt
                  ? 'Nenhum salto detectado automaticamente neste vídeo. Envie outro vídeo ou marque Decolagem e Pouso manualmente abaixo.'
                  : 'Nessun salto rilevato automaticamente. Carica un altro video o segna manualmente Stacco e Atterraggio qui sotto.'}
              </Text>
            </View>
          )}

          {/* Lista de saltos detectados automaticamente */}
          {detectedJumps.length > 0 && (
            <View style={styles.detectedRow}>
              {detectedJumps.map((j, idx) => (
                <TouchableOpacity
                  key={j.id}
                  style={[styles.detectedPill, selectedJumpIdx === idx && styles.detectedPillActive]}
                  onPress={() => selectDetectedJump(idx)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.detectedPillLabel, selectedJumpIdx === idx && { color: '#000000' }]}>
                    {isPt ? `Salto ${idx + 1}` : `Salto ${idx + 1}`}
                  </Text>
                  <Text style={[styles.detectedPillVal, selectedJumpIdx === idx && { color: '#000000' }]}>
                    {j.heightCm.toFixed(1)} cm
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Card Resultado */}
          <View style={styles.realResultCard}>
            <View style={styles.resultCol}>
              <Text style={styles.resultLabel}>
                {isPt ? 'ALTURA DO SALTO' : 'ALTEZZA DEL SALTO'}
              </Text>
              <Text style={styles.resultValueCm}>
                {hasValidMarkers ? calculatedHeightCm.toFixed(1) : '--'}{' '}
                <Text style={{ fontSize: 18 }}>cm</Text>
              </Text>
            </View>

            <View style={styles.resultDivider} />

            <View style={styles.resultCol}>
              <Text style={styles.resultLabel}>
                {isPt ? 'TEMPO DE VOO REAL' : 'TEMPO DI VOLO REALE'}
              </Text>
              <Text style={styles.resultFlightTime}>
                {hasValidMarkers ? `${(flightTime * 1000).toFixed(0)} ms` : '-- ms'}
              </Text>
              <Text style={styles.resultFlightSec}>
                {hasValidMarkers
                  ? `(${flightTime.toFixed(3)}s${slowMoFactor > 1 ? ` • ${slowMoFactor}x` : ''})`
                  : (isPt ? '(marque os 2 pontos)' : '(segna i 2 punti)')}
              </Text>
            </View>
          </View>

          {/* Vídeo Gravado */}
          <View style={styles.reviewVideoBox}>
            <video
              ref={reviewVideoRef as any}
              src={recordedVideoUrl}
              playsInline
              style={{
                width: '100%',
                height: 240,
                objectFit: 'contain',
                backgroundColor: '#000000',
                borderRadius: 14,
              }}
              onLoadedMetadata={(e) => {
                const dur = e.currentTarget.duration;
                if (isFinite(dur) && dur > 0) setVideoDuration(dur);
              }}
              onTimeUpdate={(e) => {
                setCurrentTime(Math.round(e.currentTarget.currentTime * 100) / 100);
              }}
              onEnded={() => setIsPlaying(false)}
            />
            <View style={styles.videoTimeBadge}>
              <Text style={styles.videoTimeText}>
                {currentTime.toFixed(2)}s / {videoDuration.toFixed(1)}s
              </Text>
            </View>
          </View>

          {/* Controles Finos (Conferência / Ajuste Opcional) */}
          <View style={styles.scrubberToolbox}>
            <View style={styles.playbackRow}>
              <TouchableOpacity style={styles.playPauseBtn} onPress={togglePlayReview} activeOpacity={0.8}>
                {isPlaying ? <Pause size={18} color="#FFFFFF" /> : <Play size={18} color="#FFFFFF" fill="#FFFFFF" />}
              </TouchableOpacity>

              <View style={styles.speedSelectorRow}>
                {[0.1, 0.25, 1.0].map((rate) => (
                  <TouchableOpacity
                    key={rate}
                    style={[styles.speedBtn, playbackRate === rate && styles.speedBtnActive]}
                    onPress={() => changePlaybackRate(rate)}
                  >
                    <Text style={[styles.speedBtnText, playbackRate === rate && styles.speedBtnTextActive]}>
                      {rate}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.frameStepRow}>
                <TouchableOpacity style={styles.frameStepBtn} onPress={() => stepFrame(-0.03)} activeOpacity={0.7}>
                  <ChevronLeft size={16} color="#FFFFFF" />
                  <Text style={styles.frameStepText}>-1F</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.frameStepBtn} onPress={() => stepFrame(0.03)} activeOpacity={0.7}>
                  <Text style={styles.frameStepText}>+1F</Text>
                  <ChevronRight size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            <input
              type="range"
              min="0"
              max={videoDuration}
              step="0.02"
              value={currentTime}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setCurrentTime(val);
                if (reviewVideoRef.current) {
                  reviewVideoRef.current.currentTime = val;
                }
              }}
              style={{
                width: '100%',
                accentColor: Colors.primary,
                cursor: 'pointer',
                margin: '8px 0',
              }}
            />

            <View style={styles.markButtonsRow}>
              <TouchableOpacity style={[styles.markBtn, styles.markTakeoffBtn]} onPress={markTakeoff} activeOpacity={0.88}>
                <Text style={styles.markBtnTitle}>
                  {isPt ? '📍 AJUSTAR DECOLAGEM' : '📍 REGOLA STACCO'}
                </Text>
                <Text style={styles.markBtnSub}>
                  {takeoffTime !== null ? `${takeoffTime.toFixed(2)}s` : (isPt ? 'não marcado' : 'non segnato')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.markBtn, styles.markLandingBtn]} onPress={markLanding} activeOpacity={0.88}>
                <Text style={styles.markBtnTitle}>
                  {isPt ? '📍 AJUSTAR POUSO' : '📍 REGOLA ATTERRAGGIO'}
                </Text>
                <Text style={styles.markBtnSub}>
                  {landingTime !== null ? `${landingTime.toFixed(2)}s` : (isPt ? 'não marcado' : 'non segnato')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Ações Finais */}
          {detectedJumps.length >= 2 && onBatchJumpsConfirmed ? (
            <View style={styles.finalActionsRow}>
              <TouchableOpacity style={styles.retakeBtn} onPress={handleResetToTutorial} activeOpacity={0.8}>
                <RotateCcw size={16} color="#94A3B8" />
                <Text style={styles.retakeBtnText}>{isPt ? 'Outro Vídeo' : 'Altro Video'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.confirmJumpBtn} onPress={handleConfirmAllBatch} activeOpacity={0.88}>
                <Check size={18} color="#000000" strokeWidth={3} />
                <Text style={styles.confirmJumpBtnText}>
                  {isPt
                    ? `CONFIRMAR ${detectedJumps.length} SALTOS`
                    : `CONFERMA ${detectedJumps.length} SALTI`}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.finalActionsRow}>
              <TouchableOpacity style={styles.retakeBtn} onPress={handleResetToTutorial} activeOpacity={0.8}>
                <RotateCcw size={16} color="#94A3B8" />
                <Text style={styles.retakeBtnText}>{isPt ? 'Outro Vídeo' : 'Altro Video'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmJumpBtn, !hasValidMarkers && { opacity: 0.4 }]}
                onPress={handleConfirmSingle}
                disabled={!hasValidMarkers}
                activeOpacity={0.88}
              >
                <Check size={18} color="#000000" strokeWidth={3} />
                <Text style={styles.confirmJumpBtnText}>
                  {hasValidMarkers
                    ? (isPt ? `CONFIRMAR ${calculatedHeightCm.toFixed(1)} CM` : `CONFERMA ${calculatedHeightCm.toFixed(1)} CM`)
                    : (isPt ? 'MARQUE DECOLAGEM E POUSO' : 'SEGNA STACCO E ATTERRAGGIO')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0E1A',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  jumpTypeBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  jumpTypeBadgeText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 11,
  },
  tutorialContainer: {
    gap: 14,
  },
  cleanTutorialContainer: {
    gap: 16,
    paddingTop: 8,
  },
  cleanTutorialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
  },
  cleanTutorialBtnOpen: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cleanTutorialBtnText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tutorialPlayerWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cleanUploadBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  cleanUploadBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.6,
  },
  cleanFpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  cleanFpsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  cleanFpsPill: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cleanFpsPillActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    borderColor: Colors.primary,
  },
  cleanFpsPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  cleanFpsPillTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  analyzingBox: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  analyzingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  analyzingSub: {
    fontSize: 13,
    color: '#94A3B8',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginTop: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  reviewContainer: {
    gap: 12,
  },
  noJumpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    borderRadius: 14,
    padding: 12,
  },
  noJumpText: {
    flex: 1,
    fontSize: 12,
    color: '#FDE68A',
    lineHeight: 17,
  },
  detectedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  detectedPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
  },
  detectedPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  detectedPillLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  detectedPillVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  realResultCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  resultCol: {
    flex: 1,
    alignItems: 'center',
  },
  resultDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  resultLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  resultValueCm: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  resultFlightTime: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primary,
  },
  resultFlightSec: {
    fontSize: 11,
    color: '#94A3B8',
  },
  reviewVideoBox: {
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  videoTimeBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  videoTimeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  scrubberToolbox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 8,
  },
  playbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  playPauseBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedSelectorRow: {
    flexDirection: 'row',
    gap: 4,
  },
  speedBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  speedBtnActive: {
    backgroundColor: Colors.primary,
  },
  speedBtnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
  },
  speedBtnTextActive: {
    color: '#000000',
  },
  frameStepRow: {
    flexDirection: 'row',
    gap: 4,
  },
  frameStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  frameStepText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  markButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  markBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  markTakeoffBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  markLandingBtn: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderColor: 'rgba(0, 229, 255, 0.35)',
  },
  markBtnTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  markBtnSub: {
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 2,
  },
  finalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  retakeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  retakeBtnText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '700',
  },
  confirmJumpBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.primary,
  },
  confirmJumpBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '900',
  },
});
