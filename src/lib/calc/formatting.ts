/**
 * Format a number to 2 decimal places. Converts -0.00 to 0.00.
 */
export function fmt(n: number): string {
  return (Math.round(n * 100) / 100).toFixed(2).replace('-0.00', '0.00');
}

/**
 * Format a number to an integer string. Converts -0 to 0.
 */
export function fmtInt(n: number): string {
  return Math.round(n).toString().replace('-0', '0');
}

/**
 * Parse a locale-aware numeric string. Handles both 1,000.00 and 1.000,00 formats.
 */
export function parseNum(v: string | number | null | undefined): number {
  if (!v && v !== 0) return 0;
  let str = String(v).trim();
  if (str === '') return 0;

  // Handle mixed separators
  if (str.includes(',') && str.includes('.')) {
    if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      str = str.replace(/,/g, '');
    }
  } else if (str.includes(',')) {
    str = str.replace(/\./g, '').replace(',', '.');
  }

  const num = parseFloat(str.replace(/[^0-9+\-.]/g, ''));
  return Number.isFinite(num) ? num : 0;
}
