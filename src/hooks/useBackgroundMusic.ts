import { useEffect, useRef } from "react";

/**
 * Mengatur musik latar sederhana menggunakan Web Audio API.
 * Musik akan diputar berulang selama flag `isPlaying` bernilai true.
 */
export const useBackgroundMusic = (isPlaying: boolean) => {
  const contextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const loopTimeoutRef = useRef<number>();

  const clearLoop = () => {
    if (loopTimeoutRef.current !== undefined) {
      window.clearTimeout(loopTimeoutRef.current);
      loopTimeoutRef.current = undefined;
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!isPlaying) {
      clearLoop();
      const context = contextRef.current;
      if (context && context.state === "running") {
        void context.suspend();
      }
      return;
    }

    // Pastikan AudioContext tersedia.
    if (!contextRef.current) {
      const ctx = new AudioContext();
      const gain = ctx.createGain();
      gain.gain.value = 0.05;
      gain.connect(ctx.destination);
      contextRef.current = ctx;
      masterGainRef.current = gain;
    }

    const context = contextRef.current;
    const masterGain = masterGainRef.current;
    if (!context || !masterGain) return;

    const scheduleLoop = () => {
      const now = context.currentTime;
      const pattern: Array<[number, number]> = [
        [261.63, 0],
        [329.63, 0.64],
        [392.0, 1.28],
        [523.25, 1.92],
        [392.0, 2.56],
        [329.63, 3.2],
        [293.66, 3.84],
        [349.23, 4.48],
      ];

      pattern.forEach(([frequency, offset]) => {
        const osc = context.createOscillator();
        const gain = context.createGain();

        const startTime = now + offset;
        const endTime = startTime + 0.7;

        osc.type = "triangle";
        osc.frequency.setValueAtTime(frequency, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.15, startTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, endTime);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(startTime);
        osc.stop(endTime + 0.05);

        osc.addEventListener("ended", () => {
          osc.disconnect();
          gain.disconnect();
        });
      });

      // Jadwalkan ulang loop ketika pattern selesai (sekitar 5 detik).
      loopTimeoutRef.current = window.setTimeout(scheduleLoop, 5000);
    };

    void context.resume().then(() => {
      clearLoop();
      scheduleLoop();
    });

    return () => {
      clearLoop();
    };
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      clearLoop();
      const context = contextRef.current;
      if (context && context.state !== "closed") {
        context.close().catch(() => void 0);
      }
      contextRef.current = null;
      masterGainRef.current = null;
    };
  }, []);
};
