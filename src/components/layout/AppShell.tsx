'use client';

import { APP_VERSION } from '@/lib/constants';
import { SettingsModal } from '../settings/SettingsModal';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <footer className="text-center text-muted text-xs py-5">
        {APP_VERSION}
      </footer>
      <SettingsModal />
    </>
  );
}
