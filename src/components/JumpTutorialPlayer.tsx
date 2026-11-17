import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Camera,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

interface JumpTutorialPlayerProps {
  initialTab?: 'setup' | 'cmj' | 'sj';
  onReadyToRecord?: () => void;
}

export const JumpTutorialPlayer: React.FC<JumpTutorialPlayerProps> = ({
  onReadyToRecord,
}) => {
  const { language } = useApp();
  const isPt = language === 'pt';

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const restartVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* ── HEADER DO TUTORIAL ── */}
      <View style={styles.headerRow}>
        <View style={styles.headerBadge}>
          <Sparkles size={13} color={Colors.primary} />
          <Text style={styles.headerBadgeText}>
            {isPt ? 'VÍDEO TUTORIAL OFICIAL' : 'VIDEO TUTORIAL UFFICIALE'}
          </Text>
        </View>
        <Text style={styles.headerSub}>
          {isPt ? 'Demonstração Prática de Gravação e Salto' : 'Dimostrazione Pratica di Registrazione'}
        </Text>
      </View>

      {/* ── PLAYER DE VÍDEO REAL ── */}
      <View style={styles.videoPlayerContainer}>
        {Platform.OS === 'web' ? (
          <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', backgroundColor: '#000000', borderRadius: 16, overflow: 'hidden' }}>
            <video
              ref={videoRef}
              src="/assets/tutorial-video.mp4"
              playsInline
              autoPlay
              loop
              muted={isMuted}
              controls
              style={{
                width: '100%',
                maxHeight: '460px',
                borderRadius: '16px',
                objectFit: 'contain',
                backgroundColor: '#000000',
              }}
            />
          </div>
        ) : (
          <View style={styles.mobilePlaceholder}>
            <Camera size={36} color={Colors.primary} />
            <Text style={styles.mobilePlaceholderText}>
              {isPt ? 'Vídeo tutorial carregado' : 'Video tutorial pronto'}
            </Text>
          </View>
        )}

        {/* ── BARRA DE CONTROLES RÁPIDOS ── */}
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.controlBtn} onPress={togglePlay} activeOpacity={0.8}>
            {isPlaying ? <Pause size={16} color="#FFFFFF" /> : <Play size={16} color="#FFFFFF" />}
            <Text style={styles.controlBtnText}>{isPlaying ? (isPt ? 'Pausar' : 'Pausa') : (isPt ? 'Reproduzir' : 'Riproduci')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={toggleMute} activeOpacity={0.8}>
            {isMuted ? <VolumeX size={16} color="#94A3B8" /> : <Volume2 size={16} color={Colors.primary} />}
            <Text style={[styles.controlBtnText, !isMuted && { color: Colors.primary }]}>
              {isMuted ? (isPt ? 'Ativar Áudio' : 'Attiva Audio') : (isPt ? 'Áudio Ativado' : 'Audio Attivo')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtnIconOnly} onPress={restartVideo} activeOpacity={0.8}>
            <RotateCcw size={16} color="#CBD5E1" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── PONTOS CHAVE DEMONSTRADOS NO VÍDEO ── */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>
          {isPt ? 'O QUE OBSERVAR NO VÍDEO:' : 'COSA OSSERVARE NEL VIDEO:'}
        </Text>

        <View style={styles.tipCard}>
          <View style={styles.tipNumberCircle}>
            <Text style={styles.tipNumber}>1</Text>
          </View>
          <View style={styles.tipTextWrap}>
            <Text style={styles.tipHeadline}>
              {isPt ? 'Celular apoiado no chão a 2 metros' : 'Smartphone appoggiato a terra a 2 metri'}
            </Text>
            <Text style={styles.tipDesc}>
              {isPt
                ? 'Note como o celular fica levemente inclinado para cima captando todo o corpo, dos pés à cabeça.'
                : 'Nota come lo smartphone è inclinato verso l\'alto inquadrando tutto il corpo, dai piedi alla testa.'}
            </Text>
          </View>
        </View>

        <View style={styles.tipCard}>
          <View style={styles.tipNumberCircle}>
            <Text style={styles.tipNumber}>2</Text>
          </View>
          <View style={styles.tipTextWrap}>
            <Text style={styles.tipHeadline}>
              {isPt ? 'Mãos firmes na cintura em todo o movimento' : 'Mani ben salde sui fianchi'}
            </Text>
            <Text style={styles.tipDesc}>
              {isPt
                ? 'As mãos não saem da cintura nem na subida nem na aterrissagem, isolando 100% da força das pernas.'
                : 'Le mani restano fisse sui fianchi durante tutto il salto e atterraggio, isolando la forza delle gambe.'}
            </Text>
          </View>
        </View>

        <View style={styles.tipCard}>
          <View style={styles.tipNumberCircle}>
            <Text style={styles.tipNumber}>3</Text>
          </View>
          <View style={styles.tipTextWrap}>
            <Text style={styles.tipHeadline}>
              {isPt ? 'Pernas esticadas durante a fase aérea' : 'Gambe distese durante il volo'}
            </Text>
            <Text style={styles.tipDesc}>
              {isPt
                ? 'Não dobre os joelhos no ar. A extensão completa garante a medição exata do tempo de voo.'
                : 'Non piegare le ginocchia in aria. L\'estensione completa garantisce la misura esatta del tempo di volo.'}
            </Text>
          </View>
        </View>
      </View>

      {/* Botão de ação opcional se passado callback */}
      {onReadyToRecord && (
        <TouchableOpacity
          style={styles.readyBtn}
          onPress={onReadyToRecord}
          activeOpacity={0.88}
        >
          <Text style={styles.readyBtnText}>
            {isPt ? 'ENTENDI, INICIAR TESTES NA CÂMERA' : 'HO CAPITO, APRI FOTOCAMERA'}
          </Text>
          <ArrowRight size={18} color="#000000" strokeWidth={3} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#090D1A',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    gap: 16,
  },
  headerRow: {
    gap: 4,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 0.8,
  },
  headerSub: {
    fontSize: 13,
    color: '#CBD5E1',
    fontWeight: '600',
    marginTop: 2,
  },
  videoPlayerContainer: {
    backgroundColor: '#000000',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  mobilePlaceholder: {
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  mobilePlaceholderText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#0D111F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  controlBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  controlBtnIconOnly: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsContainer: {
    gap: 10,
  },
  tipsTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 0.8,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  tipNumberCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  tipNumber: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.primary,
  },
  tipTextWrap: {
    flex: 1,
    gap: 2,
  },
  tipHeadline: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tipDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  readyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 6,
  },
  readyBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
});
