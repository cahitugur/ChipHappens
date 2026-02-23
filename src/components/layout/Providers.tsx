'use client';


import { ToastProvider } from '@/hooks/useToast';
import { SettingsProvider } from '@/hooks/useSettings';
import { AppShell } from './AppShell';
import { AuthProvider } from '@/lib/auth/AuthProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <SettingsProvider>
          <AppShell>{children}</AppShell>
        </SettingsProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
