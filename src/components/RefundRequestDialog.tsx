
import { useState } from 'react';
import { useRefundRequests } from '../hooks/useRefundRequests';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from './ui/alert-dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface RefundRequestDialogProps {
  orderId: string;
  onSuccess?: () => void;
  disabled?: boolean;
}

export function RefundRequestDialog({ orderId, onSuccess, disabled = false }: RefundRequestDialogProps) {
  const { t } = useLanguage();
  const { createRefundRequest } = useRefundRequests();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    
    setIsSubmitting(true);
    try {
      const result = await createRefundRequest(orderId, reason);
      if (result) {
        setOpen(false);
        setReason('');
        if (onSuccess) onSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-red-200 text-red-700 hover:bg-red-50"
          disabled={disabled}
        >
          {t('requestRefund')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('requestRefund')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('refundRequestDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Textarea
            placeholder={t('refundReasonPlaceholder')}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="w-full"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            disabled={isSubmitting || !reason.trim()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('submitting')}
              </>
            ) : (
              t('submitRequest')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
