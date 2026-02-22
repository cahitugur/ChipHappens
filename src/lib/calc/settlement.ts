import { Transaction } from '../types';

/**
 * Greedy algorithm to minimise the number of transactions.
 * At each step, picks the largest remaining debtor and the largest remaining
 * creditor, transfers the minimum of their balances, and removes whichever
 * is fully settled. Re-sorts after every transfer so the next match is
 * always between the two biggest outstanding balances.
 */
export function computeGreedyTransactions(
  balances: { name: string; amount: number }[]
): Transaction[] {
  const creditors = balances
    .filter((b) => b.amount > 0.005)
    .map((b) => ({ ...b }));

  const debtors = balances
    .filter((b) => b.amount < -0.005)
    .map((b) => ({ name: b.name, amount: Math.abs(b.amount) }));

  const transactions: Transaction[] = [];

  while (creditors.length > 0 && debtors.length > 0) {
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    const c = creditors[0];
    const d = debtors[0];
    const transfer = Math.min(c.amount, d.amount);

    if (transfer > 0.005) {
      transactions.push({
        from: d.name,
        to: c.name,
        amount: Math.round(transfer * 100) / 100,
      });
    }

    c.amount -= transfer;
    d.amount -= transfer;

    if (c.amount < 0.005) creditors.shift();
    if (d.amount < 0.005) debtors.shift();
  }

  transactions.sort((a, b) =>
    a.from.localeCompare(b.from, undefined, { sensitivity: 'base' })
  );

  return transactions;
}
