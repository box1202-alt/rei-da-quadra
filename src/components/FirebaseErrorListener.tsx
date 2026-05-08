
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      console.error('Firebase Permission Error:', error);
      toast({
        variant: "destructive",
        title: "ERRO DE PERMISSÃO",
        description: `NÃO FOI POSSÍVEL EXECUTAR: ${error.context.operation.toUpperCase()} EM ${error.context.path}`,
      });
      // Em desenvolvimento, isso ajudará a identificar o erro rapidamente
      if (process.env.NODE_ENV === 'development') {
        throw error;
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
