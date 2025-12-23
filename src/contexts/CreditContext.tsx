'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CreditStatus {
  balance: number;
  hasLowCredits: boolean;
  hasNoCredits: boolean;
  shouldShowReminder: boolean;
}

interface CreditContextType {
  credits: CreditStatus | null;
  isLoading: boolean;
  error: string | null;
  refreshCredits: () => Promise<void>;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export function CreditProvider({ children }: { children: ReactNode }) {
  const [credits, setCredits] = useState<CreditStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkCredits = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch('/api/profile/credits/check', {
        cache: 'no-store', // Always fetch fresh data
      });
      
      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // If we get HTML (error page), return default values
        console.warn('[CreditContext] Received non-JSON response, using defaults');
        setCredits({
          balance: 0,
          hasLowCredits: false,
          hasNoCredits: true,
          shouldShowReminder: false,
        });
        return;
      }
      
      if (!res.ok) {
        throw new Error(`Failed to fetch credits: ${res.status}`);
      }
      
      const data = await res.json();
      setCredits(data);
    } catch (err) {
      console.error('[CreditContext] Error checking credits:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Set default values on error
      setCredits({
        balance: 0,
        hasLowCredits: false,
        hasNoCredits: true,
        shouldShowReminder: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    checkCredits();
    
    // Poll every 5 minutes
    const interval = setInterval(checkCredits, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <CreditContext.Provider value={{ credits, isLoading, error, refreshCredits: checkCredits }}>
      {children}
    </CreditContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditProvider');
  }
  return context;
}


