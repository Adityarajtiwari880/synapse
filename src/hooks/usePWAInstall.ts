import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isIPad, setIsIPad] = useState(false);

  useEffect(() => {
    // 1. Detect if currently running in standalone (installed) mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsInstalled(isStandalone);

    // 2. Detect iOS / iPadOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    const isMacTouch = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1; // iPadOS 13+
    const isTablet = isIOSDevice || isMacTouch;

    setIsIOS(isTablet);
    setIsIPad(/ipad/.test(ua) || isMacTouch);

    // 3. Listen for Chrome / Edge / Android install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = useCallback(async (): Promise<'prompted' | 'show-guide' | 'installed'> => {
    if (isInstalled) {
      return 'installed';
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
        return 'prompted';
      } catch (err) {
        console.warn('Install prompt error:', err);
        return 'show-guide';
      }
    }

    // On iOS/iPadOS Safari or browsers without beforeinstallprompt
    return 'show-guide';
  }, [deferredPrompt, isInstalled]);

  return {
    isInstallable: !isInstalled,
    isInstalled,
    isIOS,
    isIPad,
    triggerInstall,
    hasNativePrompt: Boolean(deferredPrompt),
  };
}
