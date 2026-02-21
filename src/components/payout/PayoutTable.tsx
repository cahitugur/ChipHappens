'use client';

import { useState } from 'react';
import { usePayoutCalculator } from '@/hooks/usePayoutCalculator';
import { NavMenu } from '@/components/layout/NavMenu';
import { PayoutRow } from './PayoutRow';
import { SettlementPanel } from './SettlementPanel';
import { useToast } from '@/hooks/useToast';
import { fmt, fmtInt } from '@/lib/calc/formatting';

export function PayoutTable() {
  const calc = usePayoutCalculator();
  const { showToast } = useToast();

  if (!calc.initialized) return null;

  const handleShare = async () => {
    try {
      const url = await calc.getShareUrl();
      if (navigator.clipboard?.write) {
        const html = `<a href="${url}">Poker Payout Share</a>`;
        const item = new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([url], { type: 'text/plain' }),
        });
        await navigator.clipboard.write([item]);
        showToast('Share link copied to clipboard!');
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        showToast('Share link copied to clipboard!');
      } else {
        fallbackCopy(url);
      }
    } catch {
      showToast('Error copying share link');
    }
  };

  const fallbackCopy = (text: string) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-999999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast(ok ? 'Share link copied to clipboard!' : 'Failed to copy link');
    } catch {
      showToast('Failed to copy link');
    }
  };

  return (
    <div className="wrap">
      <h1 className="page-title">Payout Calculator</h1>
      <div className="card">
        {/* Toolbar */}
        <div className="toolbar">
          <NavMenu activePage="payout" playerNames={calc.getPlayerNames()} />
          <span className="toolbar-icon" aria-hidden="true" title="Poker">
            <svg width="22" height="22" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img">
              <title>Spade</title>
              <path
                fill="#d4a832"
                d="M32 6C20 18 8 26 8 36c0 6 5 11 11 11 4 0 8-2 10-5-1 5-3 9-8 12h22c-5-3-7-7-8-12 2 3 6 5 10 5 6 0 11-5 11-11 0-10-12-18-24-30z"
              />
            </svg>
          </span>
          <div
            className={`status ${calc.isBalanced ? 'ok' : 'warn'}`}
            aria-live="polite"
          >
            <span className="dot" />
            <span className="status-text">
              {calc.isBalanced ? 'Balanced' : 'Unbalanced'}
            </span>
          </div>
          <span className="spacer" />
          <OptionsDropdown onShare={handleShare} />
        </div>

        {/* Table */}
        <div className="table-wrap">
          <form onSubmit={(e) => e.preventDefault()}>
            <table className="page-payout-table">
              <colgroup>
                <col className="col-name" />
                <col className="col-step" />
                <col className="col-in" />
                <col className="col-step" />
                <col className="col-out" />
                <col className="col-payout" />
              </colgroup>
              <thead>
                <tr>
                  <th className="controls-cell" colSpan={6}>
                    <div className="controls">
                      <button
                        className="btn btn-secondary"
                        type="button"
                        disabled={calc.tableLocked || calc.rows.length >= 32}
                        onClick={() => calc.addRow()}
                      >
                        ➕ Add
                      </button>
                      <button
                        className="btn btn-secondary"
                        type="button"
                        disabled={calc.tableLocked || calc.rows.length <= 0}
                        onClick={calc.toggleDeleteMode}
                        style={{ opacity: 1 }}
                      >
                        ➖ Delete
                      </button>
                      <button
                        className="btn btn-secondary"
                        type="button"
                        disabled={calc.tableLocked}
                        onClick={calc.clearTable}
                      >
                        🧹 Clear
                      </button>
                      <div className="spacer" />
                      <div className="buyin-container">
                        <label className="buyin-label" htmlFor="buyInInput">
                          Buy-In
                        </label>
                        <input
                          id="buyInInput"
                          className="input-field buyin-input"
                          type="text"
                          inputMode="numeric"
                          value={calc.buyIn}
                          disabled={calc.tableLocked}
                          onChange={(e) => calc.setBuyIn(e.target.value)}
                          onClick={(e) =>
                            (e.target as HTMLInputElement).select()
                          }
                        />
                      </div>
                    </div>
                  </th>
                </tr>
                <tr>
                  <th>Name</th>
                  <th aria-label="decrement"></th>
                  <th>In</th>
                  <th aria-label="increment"></th>
                  <th>Out</th>
                  <th>Payout</th>
                </tr>
              </thead>
              <tbody>
                {calc.rows.map((row, i) => (
                  <PayoutRow
                    key={row.id}
                    name={row.name}
                    buyIn={row.buyIn}
                    cashOut={row.cashOut}
                    settled={row.settled}
                    payout={calc.payouts[i] ?? 0}
                    deleteMode={calc.deleteMode}
                    checkboxesVisible={calc.checkboxesVisible}
                    tableLocked={calc.tableLocked}
                    onUpdateName={(v) => calc.updateRow(i, 'name', v)}
                    onUpdateBuyIn={(v) => calc.updateRow(i, 'buyIn', v)}
                    onUpdateCashOut={(v) => calc.updateRow(i, 'cashOut', v)}
                    onUpdateSettled={(v) => calc.updateRow(i, 'settled', v)}
                    onAdjust={(delta) => calc.adjustBuyIn(i, delta)}
                    onDelete={() => calc.removeRow(i)}
                  />
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th>Total</th>
                  <th></th>
                  <th className="payout">{fmtInt(calc.totalIn)}</th>
                  <th></th>
                  <th className="payout">{fmt(calc.totalOut)}</th>
                  <th className="payout">{fmt(calc.totalPayout)}</th>
                </tr>
              </tfoot>
            </table>
          </form>
        </div>

        {/* Action Row */}
        <div className="action-row">
          <div className="action-buttons">
            <button
              className="btn btn-secondary btn-wide"
              type="button"
              disabled={calc.tableLocked}
              onClick={calc.toggleSuspects}
            >
              👥 Usual Suspects
            </button>
            <button
              className="btn btn-secondary btn-wide"
              type="button"
              onClick={calc.toggleSettle}
              style={{ opacity: 1 }}
            >
              ✔ Settle
            </button>
          </div>

          {/* Settlement Panel */}
          <SettlementPanel
            visible={calc.checkboxesVisible}
            rows={calc.rows}
            settlementMode={calc.settlementMode}
            currency={calc.currency}
            transactions={calc.transactions}
          />

          {/* Usual Suspects */}
          {calc.showSuspects && (
            <div className="suspects-list" style={{ display: 'flex' }}>
              {calc.availableSuspects.map((name) => (
                <span
                  key={name}
                  className="player-chip"
                  onClick={() => calc.addSuspectToRow(name)}
                >
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Options dropdown (share) ── */

function OptionsDropdown({ onShare }: { onShare: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="options-btn"
        aria-label="Options"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        ⋮
      </button>
      {open && (
        <div className="options-dropdown active">
          <button
            className="options-item"
            type="button"
            onClick={() => {
              setOpen(false);
              onShare();
            }}
          >
            ↗️ Share
          </button>
        </div>
      )}
    </div>
  );
}
