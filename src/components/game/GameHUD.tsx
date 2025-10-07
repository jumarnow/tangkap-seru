import { Trophy, Clock, Target, Volume2, VolumeX } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface GameHUDProps {
  score: number;
  level: number;
  timeLeft?: number;
  instruction: string;
  caught: number;
  total: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const GameHUD = ({
  score,
  level,
  timeLeft,
  instruction,
  caught,
  total,
  soundEnabled,
  onToggleSound,
}: GameHUDProps) => {
  const progress = (caught / total) * 100;

  return (
    <div className="absolute top-0 left-0 right-0 z-10 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card/90 backdrop-blur-sm rounded-3xl p-4 shadow-playful">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <Trophy className="h-5 w-5 text-primary" />
                <span className="font-bold text-foreground">{score}</span>
              </div>
              <div className="bg-secondary/20 px-4 py-2 rounded-full">
                <span className="font-bold text-foreground">Level {level}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {timeLeft !== undefined && (
                <div className="flex items-center gap-2 bg-accent/10 px-4 py-2 rounded-full">
                  <Clock className="h-5 w-5 text-accent" />
                  <span className="font-bold text-foreground">{timeLeft}s</span>
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleSound}
                aria-label={soundEnabled ? "Matikan suara" : "Nyalakan suara"}
                className="rounded-full"
              >
                {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          <div className="bg-primary/5 rounded-2xl p-4 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-primary" />
              <p className="font-bold text-foreground text-lg">{instruction}</p>
            </div>
            <div className="flex items-center gap-3">
              <Progress value={progress} className="flex-1" />
              <span className="text-sm font-semibold text-muted-foreground min-w-[50px]">
                {caught}/{total}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
