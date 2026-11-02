/**
 * CORE CAPITAL V3 — Indicateur de Synchronisation IndexedDB & Bannière PWA
 */

import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Wifi, WifiOff, Download, Smartphone, X, CheckCircle2 } from 'lucide-react';

export const OfflineStatusBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissPwa, setDismissPwa] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {/* 1. Alerte Hors-Ligne */}
      {!isOnline && (
        <div className="bg-amber-950/90 border-b border-amber-800 text-amber-200 px-4 py-2 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <p>
              <strong>Mode Hors-ligne Actif :</strong> Aucune connexion internet détectée. Vos données financières sont lues et sauvegardées localement en continu via <strong>IndexedDB</strong>.
            </p>
          </div>
        </div>
      )}

      {/* 2. Bannière Installation PWA (si disponible et non installée) */}
      {!isInstalled && !dismissPwa && (isInstallable || isIOS) && (
        <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-slate-950 border-b border-blue-900/40 px-4 py-2 text-xs text-slate-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/core-capital-icon.png"
                alt="CORE CAPITAL"
                className="w-6 h-6 rounded-lg object-contain shadow-sm shrink-0"
              />
              <p className="line-clamp-1">
                <strong className="text-white font-semibold">Installer l'application CORE CAPITAL</strong> sur votre écran d'accueil pour une expérience rapide et hors-ligne.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isInstallable && (
                <button
                  onClick={install}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Installer</span>
                </button>
              )}

              {isIOS && (
                <button
                  onClick={() => setShowIOSModal(true)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Sur iPhone</span>
                </button>
              )}

              <button
                onClick={() => setDismissPwa(true)}
                className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                aria-label="Fermer la suggestion"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Guide iOS */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <img src="/core-capital-icon.png" alt="Icon" className="w-8 h-8 rounded-xl" />
                <h3 className="font-bold text-white text-sm">Installer sur iPhone</h3>
              </div>
              <button onClick={() => setShowIOSModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-2.5 text-slate-300">
              <p>
                1. Dans <strong>Safari</strong>, appuyez sur le bouton de <strong>Partage</strong> en bas de l'écran (carré avec flèche vers le haut).
              </p>
              <p>
                2. Faites défiler et touchez <strong>« Sur l'écran d'accueil »</strong>.
              </p>
              <p>
                3. Touchez <strong>Ajouter</strong> en haut à droite. L'icône officielle CORE CAPITAL apparaîtra sur votre bureau !
              </p>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </>
  );
};
