
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface BalanceCreditsProps {
  balance: number;
  onRefresh: () => Promise<void>;
}

export function BalanceCredits({ balance, onRefresh }: BalanceCreditsProps) {
  const { t } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
      toast.success(t('balanceRefreshed'));
    } catch (error) {
      console.error('Error refreshing balance:', error);
      toast.error(t('failedToRefreshBalance') || 'Failed to refresh balance');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-violet-50 to-indigo-50 border-indigo-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-indigo-700 flex items-center justify-between">
          <span>{t('balanceCredits')}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            {t('refresh')}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-indigo-800">
          {formatCurrency(balance || 0)}
        </div>
        <p className="text-sm text-indigo-600 mt-1">
          {t('creditsEarned')}
        </p>
      </CardContent>
    </Card>
  );
}
