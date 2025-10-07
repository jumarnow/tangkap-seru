import { Button } from "@/components/ui/button";
import { Clock, Infinity } from "lucide-react";
import { GameMode } from "./GameScreen";

interface ModeSelectionProps {
  onSelectMode: (mode: GameMode) => void;
}

export const ModeSelection = ({ onSelectMode }: ModeSelectionProps) => {
  return (
    <div className="min-h-screen bg-gradient-sky flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-foreground mb-4 animate-bounce-in">
            🎮 Tangkap Benda!
          </h1>
          <p className="text-xl text-muted-foreground">
            Pilih mode permainan
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => onSelectMode("timed")}
            className="group bg-card hover:bg-card/80 rounded-3xl p-8 shadow-playful hover:shadow-float transition-all transform hover:scale-105"
          >
            <div className="flex justify-center mb-4">
              <div className="bg-accent/10 p-6 rounded-2xl group-hover:bg-accent/20 transition-colors">
                <Clock className="h-16 w-16 text-accent" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Mode Waktu
            </h2>
            <p className="text-muted-foreground mb-4">
              Tangkap sebanyak mungkin dalam waktu terbatas!
            </p>
            <div className="bg-accent/5 rounded-xl p-3">
              <p className="text-sm font-semibold text-accent">⏱️ 60 detik per level</p>
            </div>
          </button>

          <button
            onClick={() => onSelectMode("untimed")}
            className="group bg-card hover:bg-card/80 rounded-3xl p-8 shadow-playful hover:shadow-float transition-all transform hover:scale-105"
          >
            <div className="flex justify-center mb-4">
              <div className="bg-success/10 p-6 rounded-2xl group-hover:bg-success/20 transition-colors">
                <Infinity className="h-16 w-16 text-success" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Mode Santai
            </h2>
            <p className="text-muted-foreground mb-4">
              Bermain tanpa tekanan waktu, santai saja!
            </p>
            <div className="bg-success/5 rounded-xl p-3">
              <p className="text-sm font-semibold text-success">♾️ Tanpa batas waktu</p>
            </div>
          </button>
        </div>

        <div className="mt-8 bg-card/50 backdrop-blur-sm rounded-2xl p-6">
          <h3 className="font-bold text-foreground mb-3 text-lg">Cara Bermain:</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">1.</span>
              <span>Baca instruksi yang muncul di atas layar</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">2.</span>
              <span>Klik/tap benda yang sesuai dengan instruksi</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">3.</span>
              <span>Tangkap 10 benda yang benar untuk naik level!</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
