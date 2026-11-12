export interface DetectedJump {
  id: number;
  takeoffTime: number; // segundos no relógio do vídeo
  landingTime: number; // segundos no relógio do vídeo
  flightTimeSec: number; // tempo real de voo já corrigido pelo fator slow-mo
  heightCm: number;
}

export type RecordingSpeedMode = 'normal' | 'slow120' | 'slow240';

export function getSlowMoFactor(mode: RecordingSpeedMode): number {
  if (mode === 'slow240') return 8; // 240fps reproduzido a 30fps = 8x mais lento
  if (mode === 'slow120') return 4; // 120fps reproduzido a 30fps = 4x mais lento
  return 1;
}

export function calculateJumpHeightCm(flightTimeSec: number): number {
  if (flightTimeSec <= 0) return 0;
  return Math.max(0, Math.round(((9.81 * (flightTimeSec ** 2)) / 8) * 100 * 10) / 10);
}

/**
 * Analisa um arquivo/URL de vídeo frame a frame no Canvas (sem dependências externas)
 * para detectar automaticamente decolagens e pousos de saltos verticais.
 */
export async function analyzeJumpVideo(
  videoUrl: string,
  speedMode: RecordingSpeedMode,
  onProgress?: (percent: number) => void
): Promise<{ duration: number; jumps: DetectedJump[] }> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    const cleanup = () => {
      video.removeAttribute('src');
      video.load();
    };

    video.onerror = () => {
      cleanup();
      resolve({ duration: 5.0, jumps: [] });
    };

    video.onloadedmetadata = async () => {
      const duration = isFinite(video.duration) && video.duration > 0 ? video.duration : 5.0;
      const width = 128;
      const height = 96;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) {
        cleanup();
        resolve({ duration, jumps: [] });
      }

      // Amostragem adaptativa: ~150 amostras no máximo para manter a análise rápida (< 3s)
      const totalSamples = Math.min(180, Math.max(40, Math.floor(duration * 15)));
      const step = duration / totalSamples;

      const samples: { time: number; motion: number; centroidY: number }[] = [];
      let prevGray: Float32Array | null = null;

      const seekTo = (t: number) =>
        new Promise<void>((res) => {
          const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked);
            res();
          };
          video.addEventListener('seeked', onSeeked);
          video.currentTime = Math.min(duration - 0.01, Math.max(0, t));
        });

      for (let i = 0; i < totalSamples; i++) {
        const t = i * step;
        await seekTo(t);
        ctx!.drawImage(video, 0, 0, width, height);
        const img = ctx!.getImageData(0, 0, width, height).data;
        const gray = new Float32Array(width * height);

        let motionSum = 0;
        let weightedY = 0;
        let activePixels = 0;

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            const p = idx * 4;
            const g = 0.299 * img[p] + 0.587 * img[p + 1] + 0.114 * img[p + 2];
            gray[idx] = g;

            if (prevGray) {
              const diff = Math.abs(g - prevGray[idx]);
              if (diff > 22) {
                motionSum += diff;
                weightedY += y / height;
                activePixels++;
              }
            }
          }
        }

        const motion = motionSum / (width * height);
        const centroidY = activePixels > 12 ? weightedY / activePixels : 0.6;
        samples.push({ time: t, motion, centroidY });
        prevGray = gray;

        if (onProgress) {
          onProgress(Math.round(((i + 1) / totalSamples) * 100));
        }
      }

      // Detecta janelas de movimento vertical compatíveis com saltos
      const factor = getSlowMoFactor(speedMode);
      const motionValues = samples.map((s) => s.motion);
      const avgMotion = motionValues.reduce((a, b) => a + b, 0) / (motionValues.length || 1);
      const motionThreshold = Math.max(1.2, avgMotion * 1.45);

      const jumps: DetectedJump[] = [];
      let inEvent = false;
      let eventStart = 0;
      let minCentroidY = 1;

      for (let i = 1; i < samples.length; i++) {
        const s = samples[i];
        if (!inEvent && s.motion > motionThreshold) {
          inEvent = true;
          eventStart = s.time;
          minCentroidY = s.centroidY;
        } else if (inEvent) {
          if (s.centroidY < minCentroidY) minCentroidY = s.centroidY;

          // Fim do evento quando movimento cai abaixo do limiar por 2 amostras ou fim do vídeo
          const nextLow = i + 1 >= samples.length || samples[i + 1].motion < motionThreshold * 0.75;
          if (s.motion < motionThreshold * 0.75 && nextLow) {
            inEvent = false;
            const eventEnd = s.time;
            const rawDt = eventEnd - eventStart;

            // Tempo real de voo estimado (descontando ~25% de agachamento/aterrissagem no evento total)
            const estimatedFlightVideo = rawDt * 0.72;
            const flightReal = estimatedFlightVideo / factor;
            const heightCm = calculateJumpHeightCm(flightReal);

            // Filtra apenas saltos humanos plausíveis (12 cm a 110 cm) e com elevação real
            if (heightCm >= 12 && heightCm <= 110 && minCentroidY < 0.72) {
              const takeoffTime = Math.round((eventStart + rawDt * 0.18) * 100) / 100;
              const landingTime = Math.round((eventEnd - rawDt * 0.10) * 100) / 100;
              const exactFlight = Math.max(0, (landingTime - takeoffTime) / factor);
              const exactHeight = calculateJumpHeightCm(exactFlight);

              if (exactHeight >= 12 && exactHeight <= 110) {
                jumps.push({
                  id: jumps.length + 1,
                  takeoffTime,
                  landingTime,
                  flightTimeSec: Math.round(exactFlight * 1000) / 1000,
                  heightCm: exactHeight,
                });
              }
            }
          }
        }
      }

      cleanup();
      resolve({ duration, jumps: jumps.slice(0, 3) });
    };
  });
}
