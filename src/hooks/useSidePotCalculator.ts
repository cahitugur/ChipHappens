'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { SidePotPlayerData, CalculatedPot } from '@/lib/types';
import { parseNum, fmt, fmtInt } from '@/lib/calc/formatting';
import { calculateSidePots, calculateWinnings } from '@/lib/calc/sidepot';
import { encodeSidePotShareData, decodeSidePotShareData } from '@/lib/sharing/sidepot-share';
import { getLocalStorage, setLocalStorage, removeLocalStorage } from '@/lib/storage/local-storage';
import { SIDEPOT_STORAGE_KEY, MAX_ROWS } from '@/lib/constants';
import { useSettings } from './useSettings';

export function useSidePotCalculator() {
  const { settings } = useSettings();

  const [rows, setRows] = useState<SidePotPlayerData[]>([]);
  const [initialPot, setInitialPot] = useState('');
  const [boards, setBoards] = useState(1);
  const [deleteMode, setDeleteMode] = useState(false);
  const [showSuspects, setShowSuspects] = useState(false);
  const [winnerSelections, setWinnerSelections] = useState<Record<string, boolean>>({});
  const [initialized, setInitialized] = useState(false);

  const nextId = useRef(0);
  const generateId = () => `srow-${nextId.current++}`;

  // Derived calculations
  const totalBet = useMemo(() => {
    let total = parseNum(initialPot);
    for (const row of rows) {
      total += parseNum(row.bet);
    }
    return total;
  }, [rows, initialPot]);

  const pots = useMemo((): CalculatedPot[] => {
    const players = rows
      .filter((r) => r.name.trim())
      .map((r) => ({ name: r.name.trim() || '(no name)', bet: parseNum(r.bet) }));
    return calculateSidePots(players, parseNum(initialPot));
  }, [rows, initialPot]);

  // Auto-select single-player pots
  const effectiveWinnerSelections = useMemo(() => {
    const selections = { ...winnerSelections };
    for (let potIdx = 0; potIdx < pots.length; potIdx++) {
      const pot = pots[potIdx];
      if (pot.players.length === 1) {
        for (let boardNum = 0; boardNum < boards; boardNum++) {
          const key = `${potIdx}-${boardNum}-${pot.players[0]}`;
          selections[key] = true;
        }
      }
    }
    return selections;
  }, [winnerSelections, pots, boards]);

  const { playerWinnings, totalWon } = useMemo(
    () => calculateWinnings(pots, boards, effectiveWinnerSelections),
    [pots, boards, effectiveWinnerSelections]
  );

  const isBalanced = useMemo(
    () => Math.abs(Math.round((totalWon - totalBet) * 100)) === 0,
    [totalWon, totalBet]
  );

  const allSuspects = useMemo(
    () => settings.usualSuspects.map((s) => s.name),
    [settings.usualSuspects]
  );

  const availableSuspects = useMemo(() => {
    const usedNames = new Set(rows.map((r) => r.name.trim()).filter(Boolean));
    return allSuspects.filter((name) => !usedNames.has(name));
  }, [allSuspects, rows]);

  // Initialize from share URL, transferred names, or localStorage
  useEffect(() => {
    const init = async () => {
      const params = new URLSearchParams(window.location.search);
      const shareData = params.get('s') || params.get('share');
      const transferredNames = params.get('names');

      if (shareData) {
        try {
          const data = await decodeSidePotShareData(shareData);
          if (data?.rows) {
            if (data.boards) setBoards(Math.max(1, Math.min(2, parseInt(data.boards) || 1)));
            setInitialPot(data.initialPot || '');
            setRows(
              data.rows.map((r) => ({
                id: generateId(),
                name: r.name ?? '',
                bet: r.bet ?? '',
              }))
            );
            setInitialized(true);
            return;
          }
        } catch {
          /* ignore bad share data */
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const saved = getLocalStorage<any>(SIDEPOT_STORAGE_KEY);

      // Transferred names from payout calculator take priority over localStorage
      if (transferredNames) {
        const names = transferredNames.split(',').filter((n) => n.trim());
        if (names.length > 0) {
          setRows(
            names.map((name) => ({
              id: generateId(),
              name: name.trim(),
              bet: '',
            }))
          );
          // Preserve boards/initialPot from localStorage if available
          if (saved?.boards) setBoards(Math.max(1, Math.min(2, parseInt(saved.boards) || 1)));
          if (saved?.initialPot) setInitialPot(saved.initialPot);
          setInitialized(true);
          return;
        }
      }

      if (saved?.rows && Array.isArray(saved.rows)) {
        if (saved.boards) setBoards(Math.max(1, Math.min(2, parseInt(saved.boards) || 1)));
        setInitialPot(saved.initialPot || '');
        setRows(
          saved.rows.map((r: Record<string, string>) => ({
            id: generateId(),
            name: r.name ?? '',
            bet: r.bet ?? '',
          }))
        );
        setInitialized(true);
        return;
      }

      // Default: 2 empty rows
      setRows([
        { id: generateId(), name: '', bet: '' },
        { id: generateId(), name: '', bet: '' },
      ]);
      setInitialized(true);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!initialized) return;
    setLocalStorage(SIDEPOT_STORAGE_KEY, {
      rows: rows.map((r) => ({ name: r.name, bet: r.bet })),
      boards: String(boards),
      initialPot,
    });
  }, [rows, boards, initialPot, initialized]);

  // Methods
  const addRow = useCallback((values?: Partial<SidePotPlayerData>) => {
    setRows((prev) => {
      if (prev.length >= MAX_ROWS) return prev;
      return [
        ...prev,
        {
          id: generateId(),
          name: values?.name ?? '',
          bet: values?.bet ?? '',
        },
      ];
    });
  }, []);

  const removeRow = useCallback((index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateRow = useCallback(
    (index: number, field: keyof SidePotPlayerData, value: string) => {
      setRows((prev) =>
        prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
      );
    },
    []
  );

  const setBoardsValue = useCallback((n: number) => {
    setBoards(Math.max(1, Math.min(2, n)));
  }, []);

  const clearTable = useCallback(() => {
    nextId.current = 0;
    setRows([
      { id: generateId(), name: '', bet: '' },
      { id: generateId(), name: '', bet: '' },
    ]);
    setInitialPot('');
    setBoards(1);
    setDeleteMode(false);
    setShowSuspects(false);
    setWinnerSelections({});
    removeLocalStorage(SIDEPOT_STORAGE_KEY);
  }, []);

  const toggleDeleteMode = useCallback(() => {
    setDeleteMode((prev) => !prev);
  }, []);

  const toggleSuspects = useCallback(() => {
    setShowSuspects((prev) => !prev);
  }, []);

  const toggleWinner = useCallback(
    (potIdx: number, boardNum: number, playerName: string) => {
      setWinnerSelections((prev) => {
        const key = `${potIdx}-${boardNum}-${playerName}`;
        const isChecked = !prev[key];
        const next = { ...prev, [key]: isChecked };

        // Cascade: if checking/unchecking a winner, do the same in higher pots
        for (let pi = potIdx + 1; pi < pots.length; pi++) {
          if (pots[pi].players.includes(playerName)) {
            const cascadeKey = `${pi}-${boardNum}-${playerName}`;
            next[cascadeKey] = isChecked;
          }
        }

        return next;
      });
    },
    [pots]
  );

  const addSuspectToRow = useCallback((name: string) => {
    setRows((prev) => {
      const emptyIdx = prev.findIndex((r) => !r.name.trim());
      if (emptyIdx >= 0) {
        return prev.map((row, i) =>
          i === emptyIdx ? { ...row, name } : row
        );
      }
      if (prev.length >= MAX_ROWS) return prev;
      return [
        ...prev,
        { id: generateId(), name, bet: '' },
      ];
    });
  }, []);

  const getShareUrl = useCallback(async () => {
    const shareData = {
      rows: rows.map((r) => ({ name: r.name, bet: r.bet })),
      boards: String(boards),
      initialPot,
    };
    const encoded = await encodeSidePotShareData(shareData);
    return window.location.href.split('?')[0] + '?s=' + encoded;
  }, [rows, boards, initialPot]);

  return {
    rows,
    initialPot,
    setInitialPot,
    boards,
    setBoards: setBoardsValue,
    totalBet,
    totalWon,
    isBalanced,
    pots,
    playerWinnings,
    winnerSelections: effectiveWinnerSelections,
    toggleWinner,
    addRow,
    removeRow,
    updateRow,
    clearTable,
    deleteMode,
    toggleDeleteMode,
    showSuspects,
    toggleSuspects,
    availableSuspects,
    addSuspectToRow,
    getShareUrl,
    initialized,
    fmt,
    fmtInt,
    parseNum,
  };
}
