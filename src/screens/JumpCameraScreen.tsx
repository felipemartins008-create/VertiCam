import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import {
  Camera,
  RefreshCw,
  Play,
  RotateCcw,
  CheckCircle,
  Video,
  Sliders,
  ChevronRight,
  Flame,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useApp } from '../context/AppContext';
import { t } from '../services/i18n';
import { calculateJumpHeight } from '../utils/jumpPhysics';

const { width, height } = Dimensions.get('window');

type CameraState = 'idle' | 'countdown' | 'recording' | 'analyzing' | 'scrubbing';

export const JumpCameraScreen: React.FC = () => {
  const { navigate, saveNewJump } = useApp();

  const [state, setState] = useState<CameraState>('idle');
  const [countdown, setCountdown] = useState<number>(3);
  const [recordProgress, setRecordProgress] = useState<number>(0);
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('front');

  // Parametry analizy lotu (Takeoff i Landing)
  const [takeoffSec, setTakeoffSec] = useState<number>(1.85);
  const [landingSec, setLandingSec] = useState<number>(2.56);
  const [calculatedFlightTime, setCalculatedFlightTime] = useState<number>(0.71); // 2.56 - 1.85 = 0.71s
  const [calculatedHeight, setCalculatedHeight] = useState<number>(61.8);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const flight = Math.max(0, Math.round((landingSec - takeoffSec) * 100) / 100);
    setCalculatedFlightTime(flight);
    setCalculatedHeight(calculateJumpHeight(flight));
  }, [takeoffSec, landingSec]);

  // Efekt pulsowania dla wskaźnika nagrywania
  useEffect(() => {
    if (state === 'recording') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [state]);

  const startCountdown = () => {
    setState('countdown');
    setCountdown(3);

    let current = 3;
    const interval = setInterval(() => {
      current -= 1;
      if (current > 0) {
        setCountdown(current);
      } else {
        clearInterval(interval);
        startRecording();
      }
    }, 1000);
  };

  const startRecording = () => {
    setState('recording');
    setRecordProgress(0);

    let progress = 0;
    const recordInterval = setInterval(() => {
      progress += 0.2;
      setRecordProgress(progress);

      if (progress >= 5.0) {
        clearInterval(recordInterval);
        finishRecording();
      }
    }, 200);
  };

  const finishRecording = () => {
    setState('analyzing');
    setTimeout(() => {
      // Automatyczne wykrycie momentu wybicia i lądowania (z próby 5 sekund)
      setTakeoffSec(1.82);
      setLandingSec(2.53); // ~0.71s flight time (~62 cm)
      setState('scrubbing');
    }, 1200);
  };

  const handleSelectFromGallery = () => {
    // Symulacja załadowania wideo 60 FPS z galerii
    setState('analyzing');
    setTimeout(() => {
      setTakeoffSec(1.40);
      setLandingSec(2.14); // 0.74s -> 67 cm
      setState('scrubbing');
    }, 1000);
  };

  const handleConfirmResult = async () => {
    await saveNewJump(calculatedFlightTime);
    navigate('JumpResult');
  };

  const resetCapture = () => {
    setState('idle');
    setRecordProgress(0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        showBack
        onBack={() => navigate('JumpInstruction')}
        title="Test Elevazione (AI Camera)"
        rightAction={
          state === 'idle' ? (
            <TouchableOpacity
              onPress={() => setCameraFacing(f => f === 'front' ? 'back' : 'front')}
              style={styles.headerBtn}
            >
              <RefreshCw size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      <View style={styles.cameraViewport}>
        {/* Symulacja tła kadru kamery (parkiet siatkarski z siatką) */}
        <View style={styles.courtBackground}>
          <View style={styles.volleyballNetLine} />
          <View style={styles.floorLine} />

          {/* Nakładka Sylwetki Zawodnika (Body Frame Guide) */}
          <View style={styles.silhouetteOverlay}>
            <View style={styles.silhouetteHead} />
            <View style={styles.silhouetteTorso} />
            <View style={styles.silhouetteLegs} />
            
            {/* Linie kalibracji odrywu od podłogi */}
            <View style={styles.floorSensorLine}>
              <Text style={styles.floorSensorText}>LIVELLO DEL SUOLO [STACCO / ATTERRAGGIO]</Text>
            </View>
          </View>
        </View>

        {/* 1. Stan: IDLE */}
        {state === 'idle' && (
          <View style={styles.overlayIdle}>
            <View style={styles.instructionPill}>
              <Text style={styles.instructionPillText}>
                Posizionati a 2m e rimani all'interno della sagoma
              </Text>
            </View>

            <View style={styles.idleBottomActions}>
              <TouchableOpacity
                onPress={handleSelectFromGallery}
                style={styles.galleryButton}
                activeOpacity={0.8}
              >
                <Video size={18} color={Colors.textPrimary} />
                <Text style={styles.galleryButtonText}>{t('camera.galleryOption')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={startCountdown}
                style={styles.shutterButton}
                activeOpacity={0.85}
              >
                <View style={styles.shutterInner}>
                  <Flame size={28} color="#0F172A" />
                </View>
              </TouchableOpacity>

              <Text style={styles.shutterLabel}>Tocca per avviare il conto alla rovescia</Text>
            </View>
          </View>
        )}

        {/* 2. Stan: COUNTDOWN */}
        {state === 'countdown' && (
          <View style={styles.overlayCountdown}>
            <Text style={styles.countdownNumber}>{countdown}</Text>
            <Text style={styles.countdownSubText}>PREPARATI AL SALTO!</Text>
          </View>
        )}

        {/* 3. Stan: RECORDING */}
        {state === 'recording' && (
          <View style={styles.overlayRecording}>
            <View style={styles.recordingBadge}>
              <Animated.View style={[styles.recordingDot, { transform: [{ scale: pulseAnim }] }]} />
              <Text style={styles.recordingText}>
                {t('camera.recording')} ({(5.0 - recordProgress).toFixed(1)}s)
              </Text>
            </View>

            <View style={styles.jumpNowBadge}>
              <Flame size={24} color="#0F172A" />
              <Text style={styles.jumpNowText}>SALTA AL MASSIMO VERSO L'ALTO!</Text>
            </View>
          </View>
        )}

        {/* 4. Stan: ANALYZING */}
        {state === 'analyzing' && (
          <View style={styles.overlayAnalyzing}>
            <View style={styles.analyzingCard}>
              <RefreshCw size={36} color={Colors.primary} style={{ alignSelf: 'center', marginBottom: 12 }} />
              <Text style={styles.analyzingTitle}>{t('camera.processing')}</Text>
              <Text style={styles.analyzingSub}>
                Rilevamento punto di stacco (Takeoff) e primo contatto (Landing)...
              </Text>
            </View>
          </View>
        )}

        {/* 5. Stan: SCRUBBING / KOREKTOR KLATKOWY (PRECYZJA 0.01s) */}
        {state === 'scrubbing' && (
          <View style={styles.overlayScrubbing}>
            <View style={styles.scrubberCard}>
              <View style={styles.scrubberHeader}>
                <Sliders size={20} color={Colors.primary} />
                <Text style={styles.scrubberTitle}>Regolazione Fotogramma per Fotogramma</Text>
              </View>

              <Text style={styles.scrubberDesc}>
                L'algoritmo ha calcolato il tempo di volo. Puoi regolare il momento esatto di stacco e atterraggio:
              </Text>

              {/* Wynik w czasie rzeczywistym */}
              <View style={styles.liveResultRow}>
                <View style={styles.metricBlock}>
                  <Text style={styles.metricLabel}>{t('results.flightTime')}</Text>
                  <Text style={styles.metricValue}>{calculatedFlightTime.toFixed(2)} s</Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricBlock}>
                  <Text style={styles.metricLabel}>{t('results.jumpHeight')}</Text>
                  <Text style={[styles.metricValue, { color: Colors.primary }]}>
                    {calculatedHeight.toFixed(1)} cm
                  </Text>
                </View>
              </View>

              {/* Kontrolki Takeoff & Landing */}
              <View style={styles.adjustSection}>
                <View style={styles.adjustRow}>
                  <Text style={styles.adjustLabel}>Stacco (Takeoff):</Text>
                  <View style={styles.adjustButtons}>
                    <TouchableOpacity
                      onPress={() => setTakeoffSec(prev => Math.max(0.5, prev - 0.02))}
                      style={styles.stepBtn}
                    >
                      <Text style={styles.stepBtnText}>-0.02s</Text>
                    </TouchableOpacity>
                    <Text style={styles.adjustVal}>{takeoffSec.toFixed(2)}s</Text>
                    <TouchableOpacity
                      onPress={() => setTakeoffSec(prev => Math.min(landingSec - 0.2, prev + 0.02))}
                      style={styles.stepBtn}
                    >
                      <Text style={styles.stepBtnText}>+0.02s</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.adjustRow}>
                  <Text style={styles.adjustLabel}>Atterraggio (Landing):</Text>
                  <View style={styles.adjustButtons}>
                    <TouchableOpacity
                      onPress={() => setLandingSec(prev => Math.max(takeoffSec + 0.2, prev - 0.02))}
                      style={styles.stepBtn}
                    >
                      <Text style={styles.stepBtnText}>-0.02s</Text>
                    </TouchableOpacity>
                    <Text style={styles.adjustVal}>{landingSec.toFixed(2)}s</Text>
                    <TouchableOpacity
                      onPress={() => setLandingSec(prev => Math.min(4.5, prev + 0.02))}
                      style={styles.stepBtn}
                    >
                      <Text style={styles.stepBtnText}>+0.02s</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Akcje podsumowujące */}
              <View style={styles.scrubberActions}>
                <TouchableOpacity onPress={resetCapture} style={styles.retryBtn}>
                  <RotateCcw size={16} color={Colors.textSecondary} />
                  <Text style={styles.retryText}>Ripeti</Text>
                </TouchableOpacity>

                <Button
                  title="Conferma e Calcola"
                  variant="primary"
                  size="medium"
                  onPress={handleConfirmResult}
                  style={styles.confirmBtn}
                  icon={<CheckCircle size={18} color="#0F172A" />}
                />
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: Colors.cardBackground,
  },
  cameraViewport: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  courtBackground: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  volleyballNetLine: {
    position: 'absolute',
    top: '30%',
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  floorLine: {
    position: 'absolute',
    bottom: 80,
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(245, 158, 11, 0.5)',
  },
  silhouetteOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.28,
  },
  silhouetteHead: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: 8,
  },
  silhouetteTorso: {
    width: 100,
    height: 140,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 20,
    marginBottom: 8,
  },
  silhouetteLegs: {
    width: 70,
    height: 150,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 14,
  },
  floorSensorLine: {
    marginTop: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  floorSensorText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  overlayIdle: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    padding: 20,
  },
  instructionPill: {
    alignSelf: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  instructionPillText: {
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  idleBottomActions: {
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.cardBackground,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  galleryButtonText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  shutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  overlayCountdown: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownNumber: {
    fontSize: 120,
    fontWeight: '900',
    color: Colors.primary,
  },
  countdownSubText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 1.5,
    marginTop: 10,
  },
  overlayRecording: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
    padding: 24,
  },
  recordingBadge: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.white,
  },
  recordingText: {
    color: Colors.white,
    fontWeight: '900',
    fontSize: 13,
  },
  jumpNowBadge: {
    alignSelf: 'center',
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginBottom: 40,
  },
  jumpNowText: {
    color: '#0F172A',
    fontWeight: '900',
    fontSize: 16,
  },
  overlayAnalyzing: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  analyzingCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  analyzingTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  analyzingSub: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  overlayScrubbing: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    padding: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  scrubberCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  scrubberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  scrubberTitle: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  scrubberDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 14,
  },
  liveResultRow: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  metricBlock: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    backgroundColor: Colors.cardBorder,
  },
  metricLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  metricValue: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  adjustSection: {
    gap: 10,
    marginBottom: 16,
  },
  adjustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adjustLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  adjustButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  stepBtnText: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  adjustVal: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 13,
    minWidth: 42,
    textAlign: 'center',
  },
  scrubberActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  retryText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 1,
  },
});
