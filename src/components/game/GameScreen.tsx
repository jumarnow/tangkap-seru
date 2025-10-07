import { useState, useEffect, useCallback, useRef } from "react";
import type { FormEvent } from "react";
import { FloatingObject } from "./FloatingObject";
import { GameHUD } from "./GameHUD";
import { LevelComplete } from "./LevelComplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home } from "lucide-react";
import { toast } from "sonner";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useSoundEffects } from "@/hooks/useSoundEffects";

export type ObjectType = "fruit" | "number" | "letter" | "shape";
export type GameMode = "timed" | "untimed";

export interface GameObject {
  id: string;
  type: ObjectType;
  value: string;
  color: string;
  x: number;
  y: number;
  speed: number;
  emoji: string;
}

interface GameScreenProps {
  mode: GameMode;
  onExit: () => void;
}

const GAME_DURATION = 60; // base seconds for timed mode level 1
const MIN_GAME_DURATION = 20;
const GAME_DURATION_STEP = 5;
const OBJECTS_PER_LEVEL = 10;

const getDurationForLevel = (level: number) =>
  Math.max(MIN_GAME_DURATION, GAME_DURATION - (level - 1) * GAME_DURATION_STEP);

const fruitData = [
  { emoji: "🍎", value: "apel", color: "red" },
  { emoji: "🍌", value: "pisang", color: "yellow" },
  { emoji: "🍊", value: "jeruk", color: "orange" },
  { emoji: "🍇", value: "anggur", color: "purple" },
  { emoji: "🍓", value: "stroberi", color: "red" },
  { emoji: "🍉", value: "semangka", color: "red" },
  { emoji: "🥝", value: "kiwi", color: "green" },
  { emoji: "🍑", value: "persik", color: "orange" },
];

const numberData = Array.from({ length: 10 }, (_, i) => ({
  emoji: `${i}`,
  value: i.toString(),
  color: i % 2 === 0 ? "even" : "odd",
}));

const letterData = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => ({
  emoji: letter,
  value: letter,
  color: "AEIOU".includes(letter) ? "vowel" : "consonant",
}));

const shapeData = [
  { emoji: "🔴", value: "lingkaran", color: "red" },
  { emoji: "🔵", value: "lingkaran", color: "blue" },
  { emoji: "🟢", value: "lingkaran", color: "green" },
  { emoji: "🟡", value: "lingkaran", color: "yellow" },
  { emoji: "🟣", value: "lingkaran", color: "purple" },
  { emoji: "🟠", value: "lingkaran", color: "orange" },
];

export const GameScreen = ({ mode, onExit }: GameScreenProps) => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(mode === "timed" ? getDurationForLevel(1) : 0);
  const timeLeftRef = useRef(timeLeft);
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [currentObjectType, setCurrentObjectType] = useState<ObjectType>("fruit");
  const [targetInstruction, setTargetInstruction] = useState("");
  const [targetColor, setTargetColor] = useState("");
  const [caught, setCaught] = useState(0);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const spawnedCorrectCount = useRef(0);
  const spawnedTotalCount = useRef(0);
  const requiresName = mode === "timed";
  const { entries, addEntry, savedName, storeName, reset } = useLeaderboard(mode);
  const [playerName, setPlayerName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [isNameConfirmed, setIsNameConfirmed] = useState(!requiresName);
  const hasRecordedScoreRef = useRef(false);
  const lastRecordedEntryIdRef = useRef<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  useBackgroundMusic(soundEnabled && (!requiresName || isNameConfirmed));
  const { playSuccess, playError } = useSoundEffects(soundEnabled && (!requiresName || isNameConfirmed));

  useEffect(() => {
    if (!requiresName) return;
    if (!savedName) return;

    setPlayerName(prev => (prev ? prev : savedName));
    setNameInput(prev => (prev ? prev : savedName));
  }, [requiresName, savedName]);

  const generateInstruction = useCallback((type: ObjectType, level: number) => {
    switch (type) {
      case "fruit":
        const colors = ["red", "yellow", "orange", "purple", "green"];
        const color = colors[Math.floor(Math.random() * colors.length)];
        setTargetColor(color);
        return `Tangkap buah berwarna ${color === "red" ? "merah" : color === "yellow" ? "kuning" : color === "orange" ? "oranye" : color === "purple" ? "ungu" : "hijau"}!`;
      case "number":
        const isEven = Math.random() > 0.5;
        setTargetColor(isEven ? "even" : "odd");
        return `Tangkap angka ${isEven ? "genap" : "ganjil"}!`;
      case "letter":
        const isVowel = Math.random() > 0.5;
        setTargetColor(isVowel ? "vowel" : "consonant");
        return `Tangkap huruf ${isVowel ? "vokal" : "konsonan"}!`;
      case "shape":
        const shapeColors = ["red", "blue", "green", "yellow", "purple", "orange"];
        const shapeColor = shapeColors[Math.floor(Math.random() * shapeColors.length)];
        setTargetColor(shapeColor);
        return `Tangkap lingkaran ${shapeColor === "red" ? "merah" : shapeColor === "blue" ? "biru" : shapeColor === "green" ? "hijau" : shapeColor === "yellow" ? "kuning" : shapeColor === "purple" ? "ungu" : "oranye"}!`;
    }
  }, []);

  const getObjectData = useCallback((type: ObjectType) => {
    switch (type) {
      case "fruit": return fruitData;
      case "number": return numberData;
      case "letter": return letterData;
      case "shape": return shapeData;
    }
  }, []);

  const spawnObject = useCallback(() => {
    const data = getObjectData(currentObjectType);
    
    // Ensure at least 40% of spawned objects are correct
    const correctRatio = spawnedTotalCount.current > 0 
      ? spawnedCorrectCount.current / spawnedTotalCount.current 
      : 0.5;
    
    const shouldSpawnCorrect = correctRatio < 0.4 || Math.random() > 0.5;
    
    let randomItem;
    if (shouldSpawnCorrect) {
      // Spawn a correct object
      const correctItems = data.filter(item => item.color === targetColor);
      randomItem = correctItems.length > 0 
        ? correctItems[Math.floor(Math.random() * correctItems.length)]
        : data[Math.floor(Math.random() * data.length)];
      
      if (randomItem.color === targetColor) {
        spawnedCorrectCount.current++;
      }
    } else {
      // Spawn random object (might be correct or wrong)
      randomItem = data[Math.floor(Math.random() * data.length)];
      if (randomItem.color === targetColor) {
        spawnedCorrectCount.current++;
      }
    }
    
    spawnedTotalCount.current++;
    
    const newObject: GameObject = {
      id: Math.random().toString(36).substr(2, 9),
      type: currentObjectType,
      value: randomItem.value,
      color: randomItem.color,
      emoji: randomItem.emoji,
      x: Math.random() * 80 + 10,
      y: -10,
      speed: 1 + level * 0.2,
    };

    setObjects(prev => [...prev, newObject]);
  }, [currentObjectType, level, getObjectData, targetColor]);

  const startLevel = useCallback(() => {
    const types: ObjectType[] = ["fruit", "number", "letter", "shape"];
    const availableTypes = types.slice(0, Math.min(level, 4));
    const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    
    setCurrentObjectType(randomType);
    setTargetInstruction(generateInstruction(randomType, level));
    setCaught(0);
    setObjects([]);
    setShowLevelComplete(false);
    spawnedCorrectCount.current = 0;
    spawnedTotalCount.current = 0;
  }, [level, generateInstruction]);

  const handleConfirmName = useCallback(
    (event?: FormEvent<HTMLFormElement>) => {
      if (event) {
        event.preventDefault();
      }

      const trimmed = nameInput.trim();
      if (!trimmed) {
        toast.error("Nama pemain tidak boleh kosong");
        return;
      }

      setPlayerName(trimmed);
      setIsNameConfirmed(true);
      storeName(trimmed);

      setScore(0);
      setLevel(1);
      setCaught(0);
      setObjects([]);
      setShowLevelComplete(false);

      const initialDuration = getDurationForLevel(1);
      setTimeLeft(initialDuration);
      timeLeftRef.current = initialDuration;
      hasRecordedScoreRef.current = false;
      lastRecordedEntryIdRef.current = null;

      startLevel();
    },
    [nameInput, storeName, startLevel],
  );

  useEffect(() => {
    if (requiresName && !isNameConfirmed) return;
    startLevel();
  }, [level, startLevel, requiresName, isNameConfirmed]);

  useEffect(() => {
    if (mode !== "timed") return;
    if (!isNameConfirmed) return;
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          toast.error("Waktu habis!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, timeLeft, isNameConfirmed]);
  
  // Keep latest timeLeft in a ref to avoid resetting spawn interval each second
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);
  
  useEffect(() => {
    if (mode !== "timed") return;
    if (!isNameConfirmed) return;
    if (timeLeft !== 0) return;
    if (!playerName) return;
    if (hasRecordedScoreRef.current) return;

    const entry = addEntry({ name: playerName, score, level });
    lastRecordedEntryIdRef.current = entry.id;
    hasRecordedScoreRef.current = true;
  }, [mode, timeLeft, isNameConfirmed, playerName, score, level, addEntry]);

  useEffect(() => {
    if (requiresName && !isNameConfirmed) return;

    // Spawn more frequently in timed mode to ensure enough correct objects
    const spawnInterval = mode === "timed" 
      ? Math.max(1000 - level * 50, 500) // Faster spawn in timed mode (500ms - 1000ms)
      : Math.max(2000 - level * 100, 1000); // Normal spawn in untimed mode
    
    const interval = setInterval(() => {
      if (!showLevelComplete && (mode === "untimed" || timeLeftRef.current > 0)) {
        spawnObject();
      }
    }, spawnInterval);
    return () => clearInterval(interval);
  }, [spawnObject, showLevelComplete, mode, level, requiresName, isNameConfirmed]);

  const handleCatch = useCallback((object: GameObject) => {
    const isCorrect = object.color === targetColor;
    
    if (isCorrect) {
      playSuccess();
      setScore(prev => prev + 10);
      setCaught(prev => {
        const newCaught = prev + 1;
        if (newCaught >= OBJECTS_PER_LEVEL) {
          setShowLevelComplete(true);
          toast.success("Level selesai!");
        }
        return newCaught;
      });
      toast.success("Benar! +10");
    } else {
      toast.error("Salah!");
      playError();
    }

    setObjects(prev => prev.filter(obj => obj.id !== object.id));
  }, [targetColor, playSuccess, playError]);

  const handleMiss = useCallback((id: string) => {
    setObjects(prev => prev.filter(obj => obj.id !== id));
  }, []);

  const handleNextLevel = () => {
    setLevel(prev => {
      const nextLevel = prev + 1;
      if (mode === "timed") {
        const nextDuration = getDurationForLevel(nextLevel);
        setTimeLeft(nextDuration);
        timeLeftRef.current = nextDuration;
      }
      return nextLevel;
    });
  };

  if (mode === "timed" && timeLeft === 0) {
    const topEntries = entries.slice(0, 5);
    const highlightId = lastRecordedEntryIdRef.current;
    const playerRank = highlightId ? entries.findIndex(entry => entry.id === highlightId) : -1;
    const totalPlayers = entries.length;
    const playerRankDisplay = playerRank >= 0 ? playerRank + 1 : null;
    const playerEntry = playerRank >= 0 ? entries[playerRank] : null;
    const isPlayerInTop = !!highlightId && topEntries.some(entry => entry.id === highlightId);

    return (
      <div className="min-h-screen bg-gradient-sky flex items-center justify-center p-4">
        <div className="bg-card rounded-3xl p-8 shadow-float max-w-2xl w-full">
          <div className="text-center mb-6">
            <h2 className="text-4xl font-bold text-foreground mb-2">Permainan Selesai!</h2>
            {playerName && (
              <p className="text-xl text-muted-foreground">Kerja bagus, {playerName}!</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-primary/10 rounded-2xl p-6 text-center">
              <p className="text-muted-foreground text-sm">Skor Akhir</p>
              <p className="text-4xl font-extrabold text-primary">{score}</p>
            </div>
            <div className="bg-secondary/10 rounded-2xl p-6 text-center">
              <p className="text-muted-foreground text-sm">Level Tertinggi</p>
              <p className="text-4xl font-extrabold text-secondary">{level}</p>
            </div>
          </div>

          <div className="bg-background/70 rounded-2xl p-6 shadow-inner mb-6">
            <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-foreground">🏆 Papan Peringkat</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    reset();
                    hasRecordedScoreRef.current = false;
                    lastRecordedEntryIdRef.current = null;
                    toast.success("Leaderboard berhasil direset");
                  }}
                >
                  Reset
                </Button>
              </div>
              {playerRankDisplay && (
                <span className="text-sm font-medium text-muted-foreground">
                  Peringkat kamu: #{playerRankDisplay} dari {totalPlayers} pemain
                </span>
              )}
            </div>

            {topEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada catatan skor. Jadilah yang pertama!
              </p>
            ) : (
              <div className="space-y-2">
                {topEntries.map((entry, index) => {
                  const rank = index + 1;
                  const isHighlight = entry.id === highlightId;
                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 border ${
                        isHighlight
                          ? "border-primary/60 bg-primary/15 text-primary-foreground"
                          : "border-border/40 bg-card/60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-primary">#{rank}</span>
                        <div>
                          <p className="font-semibold text-foreground">{entry.name}</p>
                          <p className="text-xs text-muted-foreground">Level {entry.level}</p>
                        </div>
                      </div>
                      <span className="font-bold text-foreground">{entry.score} pts</span>
                    </div>
                  );
                })}
              </div>
            )}

            {playerEntry && !isPlayerInTop && (
              <div className="mt-4 border-t border-dashed border-border/40 pt-4">
                <div className="flex items-center justify-between rounded-xl bg-primary/10 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-primary">#{playerRankDisplay}</span>
                    <div>
                      <p className="font-semibold text-foreground">{playerEntry.name}</p>
                      <p className="text-xs text-muted-foreground">Level {playerEntry.level}</p>
                    </div>
                  </div>
                  <span className="font-bold text-foreground">{playerEntry.score} pts</span>
                </div>
              </div>
            )}
          </div>

          <Button onClick={onExit} size="lg" className="w-full">
            Kembali ke Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-sky relative overflow-hidden">
      <GameHUD
        score={score}
        level={level}
        timeLeft={mode === "timed" ? timeLeft : undefined}
        instruction={targetInstruction}
        caught={caught}
        total={OBJECTS_PER_LEVEL}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />

      <Button
        variant="secondary"
        size="icon"
        className="absolute top-4 right-4 z-10 rounded-full shadow-playful"
        onClick={onExit}
      >
        <Home className="h-5 w-5" />
      </Button>

      {mode === "timed" && !isNameConfirmed && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-background/90 backdrop-blur">
          <form
            onSubmit={handleConfirmName}
            className="bg-card rounded-3xl p-8 shadow-float max-w-md w-full"
          >
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-foreground mb-2">Siap Bermain?</h2>
              <p className="text-muted-foreground">
                Masukkan nama kamu untuk masuk ke papan peringkat.
              </p>
            </div>

            <div className="space-y-4">
              <Input
                value={nameInput}
                onChange={event => setNameInput(event.target.value)}
                placeholder="Nama pemain"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Nama minimal 2 karakter dan akan disimpan di perangkat ini.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button type="submit" size="lg" disabled={nameInput.trim().length < 2}>
                Mulai
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={onExit}>
                Kembali
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none">
        {objects.map(object => (
          <FloatingObject
            key={object.id}
            object={object}
            onCatch={handleCatch}
            onMiss={handleMiss}
          />
        ))}
      </div>

      {showLevelComplete && (
        <LevelComplete
          level={level}
          score={score}
          onNextLevel={handleNextLevel}
          onExit={onExit}
        />
      )}
    </div>
  );
};
