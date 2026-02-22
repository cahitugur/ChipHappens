'use client';

import { CalculatedPot } from '@/lib/types';
import { fmt } from '@/lib/calc/formatting';

interface PotDisplayProps {
  pots: CalculatedPot[];
  boards: number;
  winnerSelections: Record<string, boolean>;
  onToggleWinner: (potIdx: number, boardNum: number, playerName: string) => void;
}

export function PotDisplay({
  pots,
  boards,
  winnerSelections,
  onToggleWinner,
}: PotDisplayProps) {
  if (pots.length === 0) return null;

  return (
    <div className="pot-display">
      {pots.map((pot, potIdx) => {
        const isSinglePlayer = pot.players.length === 1;

        return (
          <div className="pot-card" key={potIdx}>
            <div className="pot-header">
              <strong>{pot.name}</strong>
              <span className="muted-text">{fmt(pot.size)}</span>
            </div>
            {Array.from({ length: boards }, (_, boardNum) => (
              <div className="pot-board" key={boardNum}>
                {boards > 1 && (
                  <span className="board-label">Board {boardNum + 1}</span>
                )}
                <div className="pot-players">
                  {pot.players.map((playerName) => {
                    const key = `${potIdx}-${boardNum}-${playerName}`;
                    const isChecked = !!winnerSelections[key];
                    const isAutoSelected = isSinglePlayer;

                    return (
                      <label
                        key={playerName}
                        className={`pot-player${isChecked ? ' winner' : ''}${
                          isAutoSelected ? ' auto-winner' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isAutoSelected}
                          onChange={() =>
                            onToggleWinner(potIdx, boardNum, playerName)
                          }
                        />
                        <span className="player-name">{playerName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
