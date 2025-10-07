import { useState } from "react";
import { ModeSelection } from "@/components/game/ModeSelection";
import { GameScreen, GameMode } from "@/components/game/GameScreen";

const Index = () => {
  const [gameMode, setGameMode] = useState<GameMode | null>(null);

  const handleStartGame = (mode: GameMode) => {
    setGameMode(mode);
  };

  const handleExitGame = () => {
    setGameMode(null);
  };

  if (gameMode) {
    return <GameScreen mode={gameMode} onExit={handleExitGame} />;
  }

  return <ModeSelection onSelectMode={handleStartGame} />;
};

export default Index;
