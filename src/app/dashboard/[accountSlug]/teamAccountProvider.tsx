// TeamAccountProvider.tsx
'use client'; // Mark as client component

import { createContext, useContext } from 'react';
import type { Account } from '../../../../types/data-table';

const TeamAccountContext = createContext<Account | null>(null);

export const useTeamAccount = () => {
  const context = useContext(TeamAccountContext);
  if (context === null) {
    throw new Error('useTeamAccount must be used within a TeamAccountProvider');
  }
  return context;
};

export default function TeamAccountProvider({
  children,
  teamAccount,
}: {
  children: React.ReactNode;
  teamAccount: any; // Replace `any` with the actual type if available
}) {
  return (
    <TeamAccountContext.Provider value={teamAccount}>
      {children}
    </TeamAccountContext.Provider>
  );
}
