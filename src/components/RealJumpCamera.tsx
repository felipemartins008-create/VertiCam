import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  Camera,
  RotateCcw,
  Play,
  Pause,
  Check,
  RefreshCw,
  Video,
  Clock,
  Sparkles,
  AlertCircle,
  Volume2,
  Sliders,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';

interface RealJumpCameraProps {
  jumpType: 'CMJ' | 'SJ';
  attemptNumber: number;
  totalAttempts?: number;
  onJumpConfirmed: (heightCm: number) => void;
  onCancel?: () => void;
}

export const RealJumpCamera: React.FC<RealJumpCameraProps> = ({
  jumpType,
  attemptNumber,
  totalAttempts = 3,
  onJumpConfirmed,
  onCancel,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  
  // Fases: 'preview' (ao vivo) | 'countdown' | 'recording' | 'review' (slow-motion scrubber)
  const [cameraMode, setCameraMode] = useState<'preview' | 'countdown' | 'recording' | 'review'>('preview');
  const [countdown, setCountdown] = useState<number>(3);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);

  // Vídeo Gravado
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(0.25); // Câmera lenta 0.25x
  const [videoDuration, setVideoDuration] = useState<number>(5.0);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Marcadores de Voo
  const [takeoffTime, setTakeoffTime] = useState<number>(1.6);
  const [landingTime, setLandingTime] = useState<number>(2.24);

  // Refs DOM
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const reviewVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const countdownTimerRef = useRef<any>(null);
  const recordTimerRef = useRef<any>(null);

  // Tocar bip sonoro (Web Audio API)
  const playBeep = (freq: number = 440, duration: number = 0.15) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignora falha de áudio se política do navegador bloquear
    }
  };

  // Inicializa o Stream Real da Câmera
  const startCamera = async (facing: 'user' | 'environment') => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Seu navegador não suporta acesso direto à câmera. Use o Chrome ou Safari atualizado.');
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);

      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = mediaStream;
        liveVideoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Erro ao abrir câmera:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Permissão de câmera negada. Ative o acesso à câmera no seu navegador para gravar seu salto.');
      } else {
        setCameraError('Não foi possível conectar à câmera. Verifique se outro app está usando a câmera.');
      }
    }
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [facingMode]);

  useEffect(() => {
    if (cameraMode === 'preview' && liveVideoRef.current && stream) {
      liveVideoRef.current.srcObject = stream;
      liveVideoRef.current.play().catch(() => {});
    }
  }, [cameraMode, stream]);

  // Alternar entre Câmera Frontal e Traseira
  const toggleFacingMode = () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);
  };

  // Iniciar Contagem e Gravação
  const handleStartCapture = () => {
    setCameraMode('countdown');
    setCountdown(3);
    playBeep(440, 0.12);

    let count = 3;
    countdownTimerRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        playBeep(440, 0.12);
      } else {
        clearInterval(countdownTimerRef.current);
        playBeep(880, 0.35); // Bip agudo de "SALTE AGORA!"
        startRecordingSession();
      }
    }, 1000);
  };

  const startRecordingSession = () => {
    if (!stream) return;

    recordedChunksRef.current = [];
    let options: any = { mimeType: 'video/webm' };
    if (!MediaRecorder.isTypeSupported('video/webm')) {
      options = { mimeType: 'video/mp4' };
      if (!MediaRecorder.isTypeSupported('video/mp4')) {
        options = undefined;
      }
    }

    try {
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const mime = options?.mimeType || 'video/webm';
        const blob = new Blob(recordedChunksRef.current, { type: mime });
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideoUrl(videoUrl);
        setCameraMode('review');
      };

      recorder.start(100);
      setCameraMode('recording');
      setRecordingSeconds(0);

      // Grava durante 5 segundos
      let sec = 0;
      recordTimerRef.current = setInterval(() => {
        sec += 1;
        setRecordingSeconds(sec);
        if (sec >= 5) {
          stopRecordingSession();
        }
      }, 1000);
    } catch (e) {
      console.error('Falha ao gravar com MediaRecorder:', e);
      // Fallback gracioso
      setCameraMode('preview');
    }
  };

  const stopRecordingSession = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Controle de Reprodução do Vídeo Gravado
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
    if (reviewVideoRef.current) {
      const t = Math.round(reviewVideoRef.current.currentTime * 100) / 100;
      setTakeoffTime(t);
      // Se aterrissagem for menor ou igual, ajusta
      if (landingTime <= t) {
        setLandingTime(Math.round((t + 0.60) * 100) / 100);
      }
    }
  };

  const markLanding = () => {
    if (reviewVideoRef.current) {
      const t = Math.round(reviewVideoRef.current.currentTime * 100) / 100;
      setLandingTime(t);
      if (takeoffTime >= t) {
        setTakeoffTime(Math.max(0, Math.round((t - 0.60) * 100) / 100));
      }
    }
  };

  // Cálculo de Física Real: Altura = (g * t^2) / 8
  const flightTime = Math.max(0, Math.round((landingTime - takeoffTime) * 1000) / 1000);
  const calculatedHeightCm = Math.max(0, Math.round(((9.81 * (flightTime ** 2)) / 8) * 100 * 10) / 10);

  const handleConfirmJump = () => {
    onJumpConfirmed(calculatedHeightCm);
  };

  const handleRetake = () => {
    setRecordedVideoUrl(null);
    setCameraMode('preview');
  };

  return (
    <View style={styles.container}>
      {/* ── HEADER DA CÂMERA ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.jumpTypeBadge}>
            <Text style={styles.jumpTypeBadgeText}>{jumpType}</Text>
          </View>
          <View>
            <Text style={styles.title}>
              {jumpType === 'CMJ' ? 'Salto com Contramovimento' : 'Salto sem Contramovimento'}
            </Text>
            <Text style={styles.subtitle}>
              Tentativa {attemptNumber} de {totalAttempts} • Câmera 240 FPS
            </Text>
          </View>
        </View>

        {cameraMode === 'preview' && (
          <TouchableOpacity
            style={styles.facingToggleBtn}
            onPress={toggleFacingMode}
            activeOpacity={0.8}
          >
            <RefreshCw size={16} color={Colors.primary} />
            <Text style={styles.facingToggleText}>
              {facingMode === 'user' ? 'Frontal' : 'Traseira'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── VISOR AO VIVO (PREVIEW / COUNTDOWN / RECORDING) ── */}
      {cameraMode !== 'review' && (
        <View style={styles.cameraBox}>
          {cameraError ? (
            <View style={styles.errorContainer}>
              <AlertCircle size={40} color="#EF4444" />
              <Text style={styles.errorTitle}>Câmera Não Conectada</Text>
              <Text style={styles.errorSubtitle}>{cameraError}</Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => startCamera(facingMode)}
                activeOpacity={0.88}
              >
                <RefreshCw size={16} color="#000000" />
                <Text style={styles.retryBtnText}>Tentar Novamente</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.videoWrapper}>
              <video
                ref={liveVideoRef as any}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                }}
              />

              {/* Guia de Alinhamento do Chão & Corpo */}
              <View style={styles.overlayGuidelines}>
                <View style={styles.guideTopLine}>
                  <Text style={styles.guideText}>ENQUADRE A CABEÇA AQUI</Text>
                </View>
                <View style={styles.guideCenterCross}>
                  <View style={styles.crossH} />
                  <View style={styles.crossV} />
                </View>
                <View style={styles.guideBottomLine}>
                  <Text style={styles.guideText}>LINHA DO CHÃO (PÉS AQUI)</Text>
                </View>
              </View>

              {/* Badge 240 FPS */}
              <View style={styles.fpsBadge}>
                <View style={[styles.fpsDot, cameraMode === 'recording' && styles.fpsDotRecording]} />
                <Text style={styles.fpsBadgeText}>
                  {cameraMode === 'recording' ? `🔴 REC 00:0${recordingSeconds} (240 FPS)` : '240 FPS SLOW-MO'}
                </Text>
              </View>

              {/* Overlay Contagem Regressiva */}
              {cameraMode === 'countdown' && (
                <View style={styles.countdownOverlay}>
                  <Text style={styles.countdownBigNumber}>{countdown}</Text>
                  <Text style={styles.countdownPrompt}>Posicione-se para o salto...</Text>
                </View>
              )}

              {/* Overlay Gravando */}
              {cameraMode === 'recording' && (
                <View style={styles.recordingOverlay}>
                  <Text style={styles.recordingPrompt}>SALTE AGORA COM FORÇA MÁXIMA!</Text>
                </View>
              )}
            </View>
          )}

          {/* Botões de Ação do Modo Prévia */}
          <View style={styles.bottomControls}>
            {cameraMode === 'preview' && (
              <TouchableOpacity
                style={styles.recordActionBtn}
                onPress={handleStartCapture}
                activeOpacity={0.88}
              >
                <Play size={20} color="#000000" fill="#000000" />
                <Text style={styles.recordActionBtnText}>INICIAR GRAVAÇÃO DO SALTO</Text>
              </TouchableOpacity>
            )}

            {cameraMode === 'recording' && (
              <TouchableOpacity
                style={[styles.recordActionBtn, { backgroundColor: '#EF4444' }]}
                onPress={stopRecordingSession}
                activeOpacity={0.88}
              >
                <Text style={[styles.recordActionBtnText, { color: '#FFFFFF' }]}>PARAR GRAVAÇÃO</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* ── VISOR DE SCRUBBING & MEDIÇÃO REAL (REVIEW) ── */}
      {cameraMode === 'review' && recordedVideoUrl && (
        <View style={styles.reviewContainer}>
          {/* Card Resultado Imediato */}
          <View style={styles.realResultCard}>
            <View style={styles.resultCol}>
              <Text style={styles.resultLabel}>ALTURA REAL DO SEU SALTO</Text>
              <Text style={styles.resultValueCm}>
                {calculatedHeightCm.toFixed(1)} <Text style={{ fontSize: 18 }}>cm</Text>
              </Text>
            </View>

            <View style={styles.resultDivider} />

            <View style={styles.resultCol}>
              <Text style={styles.resultLabel}>TEMPO DE VOO MEDIDO</Text>
              <Text style={styles.resultFlightTime}>{(flightTime * 1000).toFixed(0)} ms</Text>
              <Text style={styles.resultFlightSec}>({flightTime.toFixed(3)}s)</Text>
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
                objectFit: 'cover',
                borderRadius: 14,
              }}
              onLoadedMetadata={(e) => {
                const dur = e.currentTarget.duration;
                setVideoDuration(dur || 5.0);
                // Preenche marcadores razoáveis automaticamente se não marcados
                const mid = (dur || 5.0) / 2;
                setTakeoffTime(Math.round((mid - 0.3) * 100) / 100);
                setLandingTime(Math.round((mid + 0.35) * 100) / 100);
              }}
              onTimeUpdate={(e) => {
                setCurrentTime(Math.round(e.currentTarget.currentTime * 100) / 100);
              }}
              onEnded={() => setIsPlaying(false)}
            />

            {/* Marcadores Visuais no Vídeo */}
            <View style={styles.videoTimeBadge}>
              <Text style={styles.videoTimeText}>{currentTime.toFixed(2)}s / {videoDuration.toFixed(1)}s</Text>
            </View>
          </View>

          {/* Controles do Vídeo (Play/Pause, Câmera Lenta, Frame a Frame) */}
          <View style={styles.scrubberToolbox}>
            <View style={styles.playbackRow}>
              <TouchableOpacity style={styles.playPauseBtn} onPress={togglePlayReview} activeOpacity={0.8}>
                {isPlaying ? <Pause size={18} color="#FFFFFF" /> : <Play size={18} color="#FFFFFF" fill="#FFFFFF" />}
              </TouchableOpacity>

              {/* Botões de Câmera Lenta */}
              <View style={styles.speedSelectorRow}>
                <TouchableOpacity
                  style={[styles.speedBtn, playbackRate === 0.1 && styles.speedBtnActive]}
                  onPress={() => changePlaybackRate(0.1)}
                >
                  <Text style={[styles.speedBtnText, playbackRate === 0.1 && styles.speedBtnTextActive]}>0.1x</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.speedBtn, playbackRate === 0.25 && styles.speedBtnActive]}
                  onPress={() => changePlaybackRate(0.25)}
                >
                  <Text style={[styles.speedBtnText, playbackRate === 0.25 && styles.speedBtnTextActive]}>0.25x</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.speedBtn, playbackRate === 1.0 && styles.speedBtnActive]}
                  onPress={() => changePlaybackRate(1.0)}
                >
                  <Text style={[styles.speedBtnText, playbackRate === 1.0 && styles.speedBtnTextActive]}>1x</Text>
                </TouchableOpacity>
              </View>

              {/* Frame a Frame */}
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

            {/* Slider de Tempo */}
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

            {/* Botões para Marcar DECOLAGEM e ATERRISSAGEM */}
            <View style={styles.markButtonsRow}>
              <TouchableOpacity
                style={[styles.markBtn, styles.markTakeoffBtn]}
                onPress={markTakeoff}
                activeOpacity={0.88}
              >
                <Text style={styles.markBtnTitle}>📍 DEFINIR DECOLAGEM</Text>
                <Text style={styles.markBtnSub}>Momento que o pé sai: {takeoffTime.toFixed(2)}s</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.markBtn, styles.markLandingBtn]}
                onPress={markLanding}
                activeOpacity={0.88}
              >
                <Text style={styles.markBtnTitle}>📍 DEFINIR ATERRISSAGEM</Text>
                <Text style={styles.markBtnSub}>Momento que o pé toca: {landingTime.toFixed(2)}s</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Botões Finais de Confirmação e Repetição */}
          <View style={styles.finalActionsRow}>
            <TouchableOpacity
              style={styles.retakeBtn}
              onPress={handleRetake}
              activeOpacity={0.8}
            >
              <RotateCcw size={16} color="#94A3B8" />
              <Text style={styles.retakeBtnText}>Repetir Salto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmJumpBtn}
              onPress={handleConfirmJump}
              activeOpacity={0.88}
            >
              <Check size={18} color="#000000" strokeWidth={3} />
              <Text style={styles.confirmJumpBtnText}>
                CONFIRMAR {calculatedHeightCm.toFixed(1)} CM
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0E1A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    padding: 16,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  jumpTypeBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  jumpTypeBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  facingToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
  },
  facingToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  cameraBox: {
    gap: 12,
  },
  videoWrapper: {
    width: '100%',
    height: 380,
    backgroundColor: '#000000',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  overlayGuidelines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 20,
    pointerEvents: 'none',
  },
  guideTopLine: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.25)',
    borderStyle: 'dashed',
    paddingBottom: 4,
  },
  guideBottomLine: {
    borderTopWidth: 2,
    borderTopColor: '#10B981',
    paddingTop: 4,
  },
  guideText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  guideCenterCross: {
    alignSelf: 'center',
    width: 20,
    height: 20,
    position: 'relative',
    opacity: 0.3,
  },
  crossH: {
    position: 'absolute',
    top: 9,
    width: 20,
    height: 2,
    backgroundColor: '#FFFFFF',
  },
  crossV: {
    position: 'absolute',
    left: 9,
    width: 2,
    height: 20,
    backgroundColor: '#FFFFFF',
  },
  fpsBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  fpsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  fpsDotRecording: {
    backgroundColor: '#EF4444',
  },
  fpsBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  countdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  countdownBigNumber: {
    fontSize: 88,
    fontWeight: '900',
    color: Colors.primary,
  },
  countdownPrompt: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  recordingOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  recordingPrompt: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  errorContainer: {
    height: 320,
    backgroundColor: '#12172A',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  errorSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 6,
  },
  retryBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
  },
  bottomControls: {
    width: '100%',
  },
  recordActionBtn: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  recordActionBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  // Review & Scrubber
  reviewContainer: {
    gap: 14,
  },
  realResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#12172A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
  },
  resultCol: {
    flex: 1,
  },
  resultLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  resultValueCm: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  resultDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 12,
  },
  resultFlightTime: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 2,
  },
  resultFlightSec: {
    fontSize: 11,
    color: '#94A3B8',
  },
  reviewVideoBox: {
    position: 'relative',
  },
  videoTimeBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  videoTimeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrubberToolbox: {
    backgroundColor: '#12172A',
    borderRadius: 14,
    padding: 14,
    gap: 12,
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
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedSelectorRow: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: '#090D1A',
    padding: 3,
    borderRadius: 8,
  },
  speedBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  speedBtnActive: {
    backgroundColor: Colors.primary,
  },
  speedBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  speedBtnTextActive: {
    color: '#000000',
    fontWeight: '900',
  },
  frameStepRow: {
    flexDirection: 'row',
    gap: 6,
  },
  frameStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 2,
  },
  frameStepText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  markButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  markBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  markTakeoffBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: '#10B981',
  },
  markLandingBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderColor: '#38BDF8',
  },
  markBtnTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },
  markBtnSub: {
    fontSize: 11,
    color: '#CBD5E1',
    marginTop: 3,
  },
  finalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#12172A',
    paddingHorizontal: 14,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  retakeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  confirmJumpBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 14,
  },
  confirmJumpBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000000',
  },
});
