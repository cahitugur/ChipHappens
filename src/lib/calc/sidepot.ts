import { CalculatedPot } from '../types';

export interface SidePotInput {
  name: string;
  bet: number;
}

/**
 * Calculate side pots from a list of players sorted by bet size.
 * The initialPot is added to the main pot.
 */
export function calculateSidePots(
  players: SidePotInput[],
  initialPot: number
): CalculatedPot[] {
  const validPlayers = players.filter((p) => p.bet > 0);
  if (validPlayers.length === 0) return [];

  validPlayers.sort((a, b) => a.bet - b.bet);

  const pots: CalculatedPot[] = [];
  let prevBet = 0;
  let remainingPlayers = validPlayers.length;

  for (let i = 0; i < validPlayers.length; i++) {
    const currentBet = validPlayers[i].bet;
    if (currentBet > prevBet) {
      const potSize = (currentBet - prevBet) * remainingPlayers;
      const potPlayers = validPlayers.slice(i).map((p) => p.name);
      const potName =
        pots.length === 0 ? 'Main Pot' : `Side Pot ${pots.length}`;

      let finalPotSize = potSize;
      if (pots.length === 0 && initialPot > 0) {
        finalPotSize += initialPot;
      }

      pots.push({
        name: potName,
        size: finalPotSize,
        players: potPlayers,
      });
    }
    remainingPlayers--;
    prevBet = currentBet;
  }

  return pots;
}

/**
 * Calculate winnings per player based on pots, board count, and winner selections.
 * winnerSelections is keyed by `${potIdx}-${boardNum}-${playerName}`.
 */
export function calculateWinnings(
  pots: CalculatedPot[],
  boards: number,
  winnerSelections: Record<string, boolean>
): { playerWinnings: Record<string, number>; totalWon: number } {
  const playerWinnings: Record<string, number> = {};

  for (let potIdx = 0; potIdx < pots.length; potIdx++) {
    const pot = pots[potIdx];
    const potSizePerBoard = pot.size / boards;

    for (let boardNum = 0; boardNum < boards; boardNum++) {
      const winners: string[] = [];
      for (const playerName of pot.players) {
        const key = `${potIdx}-${boardNum}-${playerName}`;
        if (winnerSelections[key]) {
          winners.push(playerName);
        }
      }

      if (winners.length > 0) {
        const winPerWinner = potSizePerBoard / winners.length;
        for (const name of winners) {
          playerWinnings[name] = (playerWinnings[name] || 0) + winPerWinner;
        }
      }
    }
  }

  const totalWon = Object.values(playerWinnings).reduce(
    (sum, v) => sum + v,
    0
  );

  return { playerWinnings, totalWon };
}
