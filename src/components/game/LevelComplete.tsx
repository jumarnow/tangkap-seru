import { Button } from "@/components/ui/button";
import { Star, ArrowRight, Home } from "lucide-react";

interface LevelCompleteProps {
  level: number;
  score: number;
  onNextLevel: () => void;
  onExit: () => void;
}

export const LevelComplete = ({ level, score, onNextLevel, onExit }: LevelCompleteProps) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-bounce-in p-4">
      <div className="bg-card rounded-3xl p-8 shadow-float max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <Star className="h-16 w-16 text-secondary fill-secondary animate-wiggle" />
        </div>
        
        <h2 className="text-4xl font-bold text-foreground mb-2">
          Level {level} Selesai!
        </h2>
        
        <p className="text-2xl text-primary font-bold mb-6">
          Skor: {score}
        </p>
        
        <div className="flex flex-col gap-3">
          <Button
            onClick={onNextLevel}
            size="lg"
            className="w-full text-lg"
          >
            Level Selanjutnya
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <Button
            variant="outline"
            onClick={onExit}
            size="lg"
            className="w-full"
          >
            <Home className="mr-2 h-5 w-5" />
            Kembali ke Menu
          </Button>
        </div>
      </div>
    </div>
  );
};
