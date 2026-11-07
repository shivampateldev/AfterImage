import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Monitor, Volume2, Check } from 'lucide-react';
import { StorageService } from '../../services/storage/StorageService';
import { GameSettings } from '../../types';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const storage = StorageService.getInstance();
  const [settings, setSettings] = useState<GameSettings>(storage.getSettings());
  const [savedNotice, setSavedNotice] = useState(false);

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    storage.saveSettings(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1500);
  };

  const handleResetSave = () => {
    if (window.confirm('WARNING: Are you sure you want to reset all sector progression and XP? This action cannot be undone.')) {
      storage.resetAllProgress();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#090A0D]/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-facility-900 border border-facility-cyan/40 rounded-2xl max-w-xl w-full p-6 shadow-2xl glow-cyan max-h-[88vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-facility-800">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 bg-facility-800 hover:bg-facility-700 text-facility-cyan rounded-xl transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="text-xs uppercase font-mono tracking-widest text-[#D4A52C] font-bold">
                SYSTEM CONFIGURATION
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                SETTINGS & ACCESSIBILITY
              </h2>
            </div>
          </div>
          {savedNotice && (
            <span className="text-xs font-mono text-emerald-400 flex items-center space-x-1 animate-pulse">
              <Check className="w-4 h-4" />
              <span>SAVED</span>
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-6 pr-1 text-xs">
          {/* Audio Controls */}
          <div className="bg-facility-950/70 border border-facility-800 p-4 rounded-xl space-y-4">
            <div className="flex items-center space-x-2 text-facility-cyan font-bold uppercase tracking-wider font-mono">
              <Volume2 className="w-4 h-4" />
              <span>Audio Levels</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1 font-mono text-slate-300">
                  <span>Master Volume</span>
                  <span>{Math.round(settings.masterVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.masterVolume}
                  onChange={(e) => updateSetting('masterVolume', parseFloat(e.target.value))}
                  className="w-full accent-facility-cyan bg-facility-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1 font-mono text-slate-300">
                  <span>SFX / Spatial Resonance</span>
                  <span>{Math.round(settings.sfxVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) => updateSetting('sfxVolume', parseFloat(e.target.value))}
                  className="w-full accent-facility-cyan bg-facility-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-facility-800">
                <span className="font-mono text-slate-300">Mute All Audio</span>
                <input
                  type="checkbox"
                  checked={settings.muted}
                  onChange={(e) => updateSetting('muted', e.target.checked)}
                  className="w-4 h-4 accent-facility-cyan cursor-pointer rounded"
                />
              </div>
            </div>
          </div>

          {/* 2.5D Graphics & Visual Fidelity */}
          <div className="bg-facility-950/70 border border-facility-800 p-4 rounded-xl space-y-4">
            <div className="flex items-center space-x-2 text-facility-purple font-bold uppercase tracking-wider font-mono">
              <Monitor className="w-4 h-4" />
              <span>2.5D Visual Fidelity</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Volumetric Fog & Bloom</div>
                  <div className="text-[11px] text-slate-400">Atmospheric depth and glow rendering</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.particlesEnabled}
                  onChange={(e) => updateSetting('particlesEnabled', e.target.checked)}
                  className="w-4 h-4 accent-facility-purple cursor-pointer rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Screen Shake Feedback</div>
                  <div className="text-[11px] text-slate-400">Kinematic impulse on hazard collision</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.screenShake}
                  onChange={(e) => updateSetting('screenShake', e.target.checked)}
                  className="w-4 h-4 accent-facility-purple cursor-pointer rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">High Contrast HUD</div>
                  <div className="text-[11px] text-slate-400">Enhanced visual accessibility borders</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.highContrastHud}
                  onChange={(e) => updateSetting('highContrastHud', e.target.checked)}
                  className="w-4 h-4 accent-facility-purple cursor-pointer rounded"
                />
              </div>
            </div>
          </div>

          {/* Danger Zone: Reset Save Data */}
          <div className="bg-red-950/30 border border-red-500/40 p-4 rounded-xl flex items-center justify-between">
            <div>
              <div className="font-bold text-red-300">Reset Local Save Profile</div>
              <div className="text-[11px] text-red-200/70">Wipes completed sectors, high scores, and XP</div>
            </div>
            <button
              onClick={handleResetSave}
              className="px-3 py-1.5 bg-red-800/80 hover:bg-red-700 text-white font-mono rounded-lg transition"
            >
              Reset Data
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-facility-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-facility-cyan hover:bg-cyan-400 text-facility-950 font-bold rounded-xl transition"
          >
            Apply & Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
