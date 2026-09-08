import React, { createContext, useState, useCallback, useRef } from 'react';

export const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Processing request...');
  const [toast, setToast] = useState({ show: false, type: 'info', title: '', message: '' });
  
  const timerRef = useRef(null);
  const loadingStartTimeRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  const showLoading = useCallback((text = 'Processing request...') => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setLoadingText(text);
    loadingStartTimeRef.current = Date.now();
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    const elapsed = Date.now() - (loadingStartTimeRef.current || 0);
    const minDuration = 650; // Guaranteed visible duration (ms)
    const remaining = Math.max(0, minDuration - elapsed);

    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

    hideTimeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      hideTimeoutRef.current = null;
    }, remaining);
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  const showSuccess = useCallback((message, title = 'Success') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ show: true, type: 'success', title, message });
    timerRef.current = setTimeout(() => {
      hideToast();
    }, 3500);
  }, [hideToast]);

  const showError = useCallback((message, title = 'Action Failed') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ show: true, type: 'error', title, message });
    timerRef.current = setTimeout(() => {
      hideToast();
    }, 4500);
  }, [hideToast]);

  return (
    <UIContext.Provider value={{
      isLoading,
      loadingText,
      toast,
      showLoading,
      hideLoading,
      showSuccess,
      showError,
      hideToast
    }}>
      {children}
    </UIContext.Provider>
  );
};
