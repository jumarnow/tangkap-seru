import { useEffect, useState } from "react";
import { GameObject } from "./GameScreen";

interface FloatingObjectProps {
  object: GameObject;
  onCatch: (object: GameObject) => void;
  onMiss: (id: string) => void;
}

export const FloatingObject = ({ object, onCatch, onMiss }: FloatingObjectProps) => {
  const [position, setPosition] = useState({ x: object.x, y: object.y });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => {
        const newY = prev.y + object.speed;
        if (newY > 110) {
          onMiss(object.id);
          return prev;
        }
        return { ...prev, y: newY };
      });
    }, 50);

    return () => clearInterval(interval);
  }, [object, onMiss]);

  const handleClick = () => {
    setIsVisible(false);
    onCatch(object);
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={handleClick}
      className="absolute cursor-pointer transform transition-all duration-300 hover:scale-110 animate-float pointer-events-auto"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
    >
      <div className="bg-card rounded-2xl p-4 shadow-playful hover:shadow-float transition-all">
        <span className="text-5xl">{object.emoji}</span>
      </div>
    </button>
  );
};
