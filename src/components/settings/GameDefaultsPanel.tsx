'use client';

import { useState, useEffect } from 'react';
import { KNOWN_CURRENCIES } from '@/lib/constants';
import { useSettings } from '@/hooks/useSettings';

export function GameDefaultsPanel() {
  const { settings, closeSettingsModal, setActivePanel, updateGameSettings } = useSettings();
  const [currency, setCurrency] = useState('EUR');
  const [customCurrency, setCustomCurrency] = useState('');
  const [defaultBuyIn, setDefaultBuyIn] = useState('30');
  const [settlementMode, setSettlementMode] = useState<'banker' | 'greedy'>('banker');

  useEffect(() => {
    const gs = settings.gameSettings;
    const cur = gs.currency ?? 'EUR';
    if (KNOWN_CURRENCIES.includes(cur)) {
      setCurrency(cur);
      setCustomCurrency('');
    } else {
      setCurrency('Other');
      setCustomCurrency(cur);
    }
    setDefaultBuyIn(gs.defaultBuyIn ?? '30');
    setSettlementMode(gs.settlementMode ?? 'banker');
  }, [settings.gameSettings]);

  const handleSave = async () => {
    let finalCurrency = currency;
    if (currency === 'Other') {
      finalCurrency = customCurrency.trim() || 'EUR';
    }
    const ok = await updateGameSettings({
      currency: finalCurrency,
      defaultBuyIn: defaultBuyIn.trim() || '30',
      settlementMode,
    });
    if (ok) closeSettingsModal();
  };

  return (
    <div className="modal active" role="dialog" aria-modal="true">
      <div className="modal-overlay" onClick={closeSettingsModal} />
      <div className="modal-content" role="document">
        <div className="modal-header">
          <button
            className="modal-back"
            onClick={() => setActivePanel('hub')}
            aria-label="Back to settings"
          >
            <svg className="modal-back-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <h2 className="modal-title">Game Defaults</h2>
          <button className="modal-close" onClick={closeSettingsModal} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="modal-body">
          <p className="muted-text">Default values for new games.</p>
          <div className="settings-section">
            <label className="settings-field">
              <span className="settings-label">Currency</span>
              <select
                className="select-field"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="BTC">BTC</option>
                <option value="Other">Other</option>
              </select>
            </label>
            {currency === 'Other' && (
              <label className="settings-field">
                <span className="settings-label">Custom Currency</span>
                <input
                  className="input-field"
                  type="text"
                  placeholder="e.g. GBP"
                  maxLength={10}
                  value={customCurrency}
                  onChange={(e) => setCustomCurrency(e.target.value)}
                />
              </label>
            )}
            <label className="settings-field">
              <span className="settings-label">Buy-In</span>
              <input
                className="input-field"
                type="text"
                inputMode="numeric"
                placeholder="e.g. 30"
                value={defaultBuyIn}
                onChange={(e) => setDefaultBuyIn(e.target.value)}
              />
            </label>
            <label className="settings-field">
              <span className="settings-label">Settlement Mode</span>
              <select
                className="select-field"
                value={settlementMode}
                onChange={(e) => setSettlementMode(e.target.value as 'banker' | 'greedy')}
              >
                <option value="banker">Banker (collect &amp; distribute)</option>
                <option value="greedy">Peer-to-peer (fewer transactions)</option>
              </select>
            </label>
          </div>
          <div className="settings-actions">
            <button className="btn btn-primary" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
