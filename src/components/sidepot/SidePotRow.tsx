'use client';

import { parseNum } from '@/lib/calc/formatting';

interface SidePotRowProps {
  name: string;
  bet: string;
  won: number;
  deleteMode: boolean;
  onUpdateName: (v: string) => void;
  onUpdateBet: (v: string) => void;
  onDelete: () => void;
}

export function SidePotRow({
  name,
  bet,
  won,
  deleteMode,
  onUpdateName,
  onUpdateBet,
  onDelete,
}: SidePotRowProps) {
  const betVal = parseNum(bet);
  const wonStr = (Math.round(won * 100) / 100).toFixed(2).replace('-0.00', '0.00');

  return (
    <tr>
      <td>
        <div
          className={`name-cell-wrapper${
            deleteMode ? '' : ' hidden-delete-btns'
          }`}
        >
          <input
            className="input-field name-input"
            type="text"
            placeholder="Player"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            value={name}
            onChange={(e) => onUpdateName(e.target.value)}
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            type="button"
            className="delete-btn"
            aria-label="Delete player"
            onClick={onDelete}
          >
            🗑
          </button>
        </div>
      </td>
      <td>
        <input
          className={`input-field num-input${betVal === 0 ? ' zero-value' : ''}`}
          type="text"
          placeholder="0.00"
          inputMode="decimal"
          autoComplete="off"
          value={bet}
          onChange={(e) => onUpdateBet(e.target.value)}
          onClick={(e) => (e.target as HTMLInputElement).select()}
        />
      </td>
      <td className="payout">{wonStr}</td>
    </tr>
  );
}
