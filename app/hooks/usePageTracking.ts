// app/hooks/usePageTracking.ts
import { useEffect, useRef } from 'react';

export function usePageTracking(userId?: string | null, userName?: string | null, userRole?: string | null) {
  const sessionId = useRef<string>('');
  const lastTrackedPath = useRef<string>('');
  
  useEffect(() => {
    // Generate or retrieve session ID
    let storedSessionId = localStorage.getItem('trackingSessionId');
    if (!storedSessionId) {
      storedSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('trackingSessionId', storedSessionId);
    }
    sessionId.current = storedSessionId;
  }, []);
  
  useEffect(() => {
    const trackPageView = async () => {
      const currentPath = window.location.pathname;
      
      // Avoid duplicate tracking for same page within 1 second
      if (lastTrackedPath.current === currentPath) {
        return;
      }
      
      lastTrackedPath.current = currentPath;
      
      try {
        await fetch('/api/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: currentPath,
            userId: userId || null,
            userName: userName || null,
            userRole: userRole || null,
            sessionId: sessionId.current,
          }),
        });
      } catch (error) {
        console.error('Failed to track page view:', error);
      }
    };
    
    // Track initial page view
    trackPageView();
    
    // Track route changes (for client-side navigation)
    const handleRouteChange = () => {
      setTimeout(trackPageView, 100);
    };
    
    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', handleRouteChange);
    
    // Monkey patch pushState and replaceState to track navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleRouteChange();
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      handleRouteChange();
    };
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [userId, userName, userRole]);
}