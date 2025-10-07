import { useState, useEffect, useCallback } from "react";
import { FloatingObject } from "./FloatingObject";
import { GameHUD } from "./GameHUD";
import { LevelComplete } from "./LevelComplete";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { toast } from "sonner";

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

const GAME_DURATION = 60; // seconds for timed mode
const OBJECTS_PER_LEVEL = 10;

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
  const [timeLeft, setTimeLeft] = useState(mode === "timed" ? GAME_DURATION : 0);
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [currentObjectType, setCurrentObjectType] = useState<ObjectType>("fruit");
  const [targetInstruction, setTargetInstruction] = useState("");
  const [targetColor, setTargetColor] = useState("");
  const [caught, setCaught] = useState(0);
  const [showLevelComplete, setShowLevelComplete] = useState(false);

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
    const randomItem = data[Math.floor(Math.random() * data.length)];
    
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
  }, [currentObjectType, level, getObjectData]);

  const startLevel = useCallback(() => {
    const types: ObjectType[] = ["fruit", "number", "letter", "shape"];
    const availableTypes = types.slice(0, Math.min(level, 4));
    const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    
    setCurrentObjectType(randomType);
    setTargetInstruction(generateInstruction(randomType, level));
    setCaught(0);
    setObjects([]);
    setShowLevelComplete(false);
  }, [level, generateInstruction]);

  useEffect(() => {
    startLevel();
  }, [level, startLevel]);

  useEffect(() => {
    if (mode === "timed" && timeLeft > 0) {
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
    }
  }, [mode, timeLeft]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!showLevelComplete && (mode === "untimed" || timeLeft > 0)) {
        spawnObject();
      }
    }, 2000 - level * 100);

    return () => clearInterval(interval);
  }, [spawnObject, showLevelComplete, mode, timeLeft, level]);

  const handleCatch = useCallback((object: GameObject) => {
    const isCorrect = object.color === targetColor;
    
    if (isCorrect) {
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
    }

    setObjects(prev => prev.filter(obj => obj.id !== object.id));
  }, [targetColor]);

  const handleMiss = useCallback((id: string) => {
    setObjects(prev => prev.filter(obj => obj.id !== id));
  }, []);

  const handleNextLevel = () => {
    setLevel(prev => prev + 1);
    if (mode === "timed") {
      setTimeLeft(GAME_DURATION);
    }
  };

  if (mode === "timed" && timeLeft === 0) {
    return (
      <div className="min-h-screen bg-gradient-sky flex items-center justify-center p-4">
        <div className="bg-card rounded-3xl p-8 shadow-float text-center max-w-md w-full">
          <h2 className="text-4xl font-bold text-foreground mb-4">Permainan Selesai!</h2>
          <p className="text-2xl text-primary mb-2">Skor Akhir: {score}</p>
          <p className="text-xl text-muted-foreground mb-6">Level: {level}</p>
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
      />

      <Button
        variant="secondary"
        size="icon"
        className="absolute top-4 right-4 z-10 rounded-full shadow-playful"
        onClick={onExit}
      >
        <Home className="h-5 w-5" />
      </Button>

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
