import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { Header } from './components/layout/Header';
import { TabletWorkspace } from './components/tablet/TabletWorkspace';
import { DesktopWorkspace } from './components/desktop/DesktopWorkspace';
import { DocumentLibrary } from './components/library/DocumentLibrary';
import { SynthesisMatrix } from './components/matrix/SynthesisMatrix';
import { AdminPortal } from './components/admin/AdminPortal';
import { AuthModal } from './components/auth/AuthModal';
import { SystemDebugger } from './components/debugger/SystemDebugger';
import { CommandPalette } from './components/palette/CommandPalette';
import { AskLibraryDrawer } from './components/ai/AskLibraryDrawer';
import { SettingsModal } from './components/settings/SettingsModal';
import { ShareModal } from './components/collaboration/ShareModal';
import { QuickSettingsPopover } from './components/settings/QuickSettingsPopover';
import { BeginnerGuideModal } from './components/onboarding/BeginnerGuideModal';
import { ExecutiveReportModal } from './components/export/ExecutiveReportModal';

// Enterprise Platform Pages
import { LoadingScreen } from './components/common/LoadingScreen';
import { LandingPage } from './components/landing/LandingPage';
import { AuthPage } from './components/auth/AuthPage';
import { PersonalizedDashboard } from './components/dashboard/PersonalizedDashboard';

import { TrustCenter } from './components/trust/TrustCenter';
import { DocsPage } from './components/docs/DocsPage';
import { PricingPage } from './components/pricing/PricingPage';

const MainWorkspaceContent: React.FC = () => {
  const { activeView, isTabletLayout, appSettings } = useWorkspace();

  const [isBooting, setIsBooting] = useState(() => {
    return !sessionStorage.getItem('synapse_booted');
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [isDebuggerOpen, setIsDebuggerOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const handleBootComplete = () => {
    sessionStorage.setItem('synapse_booted', 'true');
    setIsBooting(false);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        setIsDebuggerOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        setIsChatOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        setIsSettingsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync theme class to <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (appSettings.theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
  }, [appSettings.theme]);

  // Theme Styles
  const getThemeBackground = () => {
    switch (appSettings.theme) {
      case 'sepia':
        return 'bg-[#1b1712] text-[#f4ecd8]';
      case 'midnight':
        return 'bg-[#000000] text-slate-100';
      case 'light':
        return 'bg-[#f5f5f7] text-slate-900';
      case 'dark':
      default:
        return 'bg-[#0c0d14] text-slate-100';
    }
  };

  const getFontFamilyClass = () => {
    switch (appSettings.fontFamily) {
      case 'serif':
        return 'font-serif';
      case 'dyslexic':
        return 'tracking-wide font-sans';
      case 'sans':
      default:
        return 'font-sans';
    }
  };

  // 1. Apple-Style Boot Loading Screen
  if (isBooting) {
    return <LoadingScreen onComplete={handleBootComplete} />;
  }

  // 2. Full-Page Enterprise Standalone Views
  if (activeView === 'landing') {
    return (
      <div className={`min-h-screen w-screen overflow-x-hidden ${getThemeBackground()} ${getFontFamilyClass()}`}>
        <LandingPage />
        <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} onToggleDebugger={() => setIsDebuggerOpen(prev => !prev)} />
        <SystemDebugger isOpen={isDebuggerOpen} onClose={() => setIsDebuggerOpen(false)} />
      </div>
    );
  }

  if (activeView === 'auth') {
    return (
      <div className={`min-h-screen w-screen overflow-x-hidden ${getThemeBackground()} ${getFontFamilyClass()}`}>
        <AuthPage />
      </div>
    );
  }

  if (activeView === 'dashboard') {
    return (
      <div className={`min-h-screen w-screen overflow-x-hidden ${getThemeBackground()} ${getFontFamilyClass()}`}>
        <PersonalizedDashboard />
        <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} onToggleDebugger={() => setIsDebuggerOpen(prev => !prev)} />
        <SystemDebugger isOpen={isDebuggerOpen} onClose={() => setIsDebuggerOpen(false)} />
      </div>
    );
  }


  if (activeView === 'trust') {
    return (
      <div className={`min-h-screen w-screen overflow-x-hidden ${getThemeBackground()} ${getFontFamilyClass()}`}>
        <TrustCenter />
        <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} onToggleDebugger={() => setIsDebuggerOpen(prev => !prev)} />
      </div>
    );
  }

  if (activeView === 'docs') {
    return (
      <div className={`min-h-screen w-screen overflow-x-hidden ${getThemeBackground()} ${getFontFamilyClass()}`}>
        <DocsPage />
        <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} onToggleDebugger={() => setIsDebuggerOpen(prev => !prev)} />
      </div>
    );
  }

  if (activeView === 'pricing') {
    return (
      <div className={`min-h-screen w-screen overflow-x-hidden ${getThemeBackground()} ${getFontFamilyClass()}`}>
        <PricingPage />
        <CommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} onToggleDebugger={() => setIsDebuggerOpen(prev => !prev)} />
      </div>
    );
  }

  // 3. Application Workbench Shell (Workspace, Library, Matrix, Admin)
  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden select-none antialiased ${getThemeBackground()} ${getFontFamilyClass()}`}>
      {/* Top Glass Navigation Bar */}
      <Header
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCommandPalette={() => setIsCmdOpen(true)}
        onToggleDebugger={() => setIsDebuggerOpen(prev => !prev)}
        onToggleChat={() => setIsChatOpen(prev => !prev)}
        onOpenQuickSettings={() => setIsQuickSettingsOpen(prev => !prev)}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenExecutiveReport={() => setIsReportOpen(true)}
        isDebuggerOpen={isDebuggerOpen}
        isChatOpen={isChatOpen}
      />

      {/* Main View Portals */}
      <main className="flex-1 relative overflow-hidden flex">
        {activeView === 'workspace' && (
          isTabletLayout ? (
            /* DEDICATED TABLET / TOUCH LAYOUT */
            <TabletWorkspace
              onOpenChat={() => setIsChatOpen(true)}
              onOpenShare={() => setIsShareOpen(true)}
              onOpenQuickSettings={() => setIsQuickSettingsOpen(true)}
              onOpenGuide={() => setIsGuideOpen(true)}
            />
          ) : (
            /* DEDICATED MACBOOK / WINDOWS WORKBENCH */
            <DesktopWorkspace
              onOpenChat={() => setIsChatOpen(true)}
              onOpenShare={() => setIsShareOpen(true)}
              onOpenGuide={() => setIsGuideOpen(true)}
              onOpenExecutiveReport={() => setIsReportOpen(true)}
              onOpenQuickSettings={() => setIsQuickSettingsOpen(true)}
            />
          )
        )}

        {activeView === 'library' && <DocumentLibrary />}
        {activeView === 'matrix' && <SynthesisMatrix />}
        {activeView === 'admin' && <AdminPortal />}

        {/* Ask Library Grounded AI Assistant Drawer */}
        <AskLibraryDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </main>

      {/* MODALS & OVERLAYS */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <CommandPalette
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        onToggleDebugger={() => setIsDebuggerOpen(prev => !prev)}
      />
      <SystemDebugger isOpen={isDebuggerOpen} onClose={() => setIsDebuggerOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
      <QuickSettingsPopover
        isOpen={isQuickSettingsOpen}
        onClose={() => setIsQuickSettingsOpen(false)}
      />
      <BeginnerGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <ExecutiveReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
    </div>
  );
};


export function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <MainWorkspaceContent />
      </WorkspaceProvider>
    </AuthProvider>
  );
}


export default App;
