import { useCallback, useEffect, useRef } from "react";

/**
 * Menyediakan efek suara sederhana untuk keberhasilan dan kegagalan.
 */
export const useSoundEffects = (enabled: boolean) => {
  const contextRef = useRef<AudioContext | null>(null);

  const ensureContext = useCallback(async () => {
    if (typeof window === "undefined") return null;

    if (!contextRef.current) {
      contextRef.current = new AudioContext();
    }

    const context = contextRef.current;
    if (!context) return null;

    if (context.state === "suspended") {
      await context.resume();
    }

    return context;
  }, []);

  const playTone = useCallback(
    async (frequencies: number[], stepDuration: number) => {
      if (!enabled) return;

      const context = await ensureContext();
      if (!context) return;

      const now = context.currentTime;

      frequencies.forEach((frequency, index) => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        const startTime = now + index * stepDuration;
        const endTime = startTime + stepDuration;

        osc.type = "sine";
        osc.frequency.setValueAtTime(frequency, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

        osc.connect(gain);
        gain.connect(context.destination);

        osc.start(startTime);
        osc.stop(endTime + 0.05);

        osc.addEventListener("ended", () => {
          osc.disconnect();
          gain.disconnect();
        });
      });
    },
    [enabled, ensureContext],
  );

  const playSuccess = useCallback(() => {
    void playTone([523.25, 659.25, 784.0], 0.18);
  }, [playTone]);

  const playError = useCallback(() => {
    void playTone([196.0, 174.61], 0.22);
  }, [playTone]);

  useEffect(() => {
    const context = contextRef.current;
    if (!context) return;

    if (!enabled && context.state === "running") {
      void context.suspend();
    }
    if (enabled && context.state === "suspended") {
      void context.resume();
    }
  }, [enabled]);

  useEffect(() => {
    return () => {
      const context = contextRef.current;
      if (context && context.state !== "closed") {
        context.close().catch(() => void 0);
      }
      contextRef.current = null;
    };
  }, []);

  return { playSuccess, playError };
};
