'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../../../services/auth.service';
import { tokenStore } from '../../../services/api/axios';

// 30 minutes idle timeout (29 mins active + 1 min warning modal)
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const WARNING_DURATION_SECONDS = 60;
const WARNING_THRESHOLD_MS = IDLE_TIMEOUT_MS - (WARNING_DURATION_SECONDS * 1000);

export function useIdleTimeout() {
  const { user, logout } = useAuth();
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(WARNING_DURATION_SECONDS);

  const lastActivityRef = useRef<number>(Date.now());
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset user activity on mouse/keyboard/touch events
  const recordActivity = useCallback(() => {
    // If warning modal is already open, do not silently dismiss - require deliberate user action
    if (!isWarningOpen) {
      lastActivityRef.current = Date.now();
    }
  }, [isWarningOpen]);

  // Stay logged in action triggered from custom modal
  const stayLoggedIn = useCallback(async () => {
    lastActivityRef.current = Date.now();
    setIsWarningOpen(false);
    setSecondsRemaining(WARNING_DURATION_SECONDS);

    // Silently refresh the token to keep backend session alive
    try {
      const refreshToken = tokenStore.getRefreshToken();
      if (refreshToken) {
        await authService.refresh(refreshToken);
      }
    } catch (e) {
      console.warn('Silent refresh during keepalive:', e);
    }
  }, []);

  // Perform logout when timer expires
  const handleTimeoutLogout = useCallback(() => {
    setIsWarningOpen(false);
    logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login?reason=expired';
    }
  }, [logout]);

  useEffect(() => {
    // Only track idle timeout if user is authenticated
    if (!user) {
      setIsWarningOpen(false);
      return;
    }

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    
    // Throttle listener to avoid high CPU usage
    let throttled = false;
    const handleEvent = () => {
      if (!throttled) {
        recordActivity();
        throttled = true;
        setTimeout(() => {
          throttled = false;
        }, 1000);
      }
    };

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleEvent, { passive: true });
    });

    // Check idle status every 5 seconds
    checkIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivityRef.current;

      if (elapsed >= IDLE_TIMEOUT_MS) {
        handleTimeoutLogout();
      } else if (elapsed >= WARNING_THRESHOLD_MS && !isWarningOpen) {
        const remainingSec = Math.max(1, Math.ceil((IDLE_TIMEOUT_MS - elapsed) / 1000));
        setSecondsRemaining(remainingSec);
        setIsWarningOpen(true);
      }
    }, 5000);

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleEvent);
      });
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [user, isWarningOpen, recordActivity, handleTimeoutLogout]);

  // Handle live 1-second countdown when warning modal is visible
  useEffect(() => {
    if (isWarningOpen) {
      countdownIntervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current as NodeJS.Timeout);
            handleTimeoutLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      setSecondsRemaining(WARNING_DURATION_SECONDS);
    }

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isWarningOpen, handleTimeoutLogout]);

  return {
    isWarningOpen,
    secondsRemaining,
    stayLoggedIn,
    logOutNow: handleTimeoutLogout,
  };
}
