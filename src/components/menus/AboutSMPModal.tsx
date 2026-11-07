import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Sparkles, Terminal } from 'lucide-react';
import { SMPLogo } from '../branding/SMPLogo';

interface AboutSMPModalProps {
  onClose: () => void;
}

export const AboutSMPModal: React.FC<AboutSMPModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-[#090A0D]/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-facility-900 border border-[#D4A52C]/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-facility-800">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 bg-facility-800 hover:bg-facility-700 text-[#D4A52C] rounded-xl transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="text-xs uppercase font-mono tracking-widest text-[#D4A52C] font-bold">
                AN SMP ORIGINAL
              </div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                ABOUT & OFFICIAL CREDITS
              </h2>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-facility-950 px-2.5 py-1 rounded-lg border border-facility-800">
            v1.2.0 • 2.5D EDITION
          </span>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-6 pr-1 leading-relaxed text-sm text-slate-300">
          {/* SMP Identity & Attribution */}
          <div className="bg-facility-950/80 border border-[#D4A52C]/30 p-5 rounded-2xl text-center flex flex-col items-center">
            <SMPLogo size="lg" showTagline={true} />
            <div className="mt-4 max-w-lg text-xs text-slate-400 leading-normal">
              <span className="text-white font-bold">AFTERIMAGE – THE LAST ECHO</span> is created and owned exclusively by <span className="text-[#D4A52C] font-bold">SMP</span>. Built with the belief that perseverance, intellect, and precision turn the impossible into reality.
            </div>
            <div className="mt-3 text-[11px] font-mono text-[#D4A52C] italic">
              "1% CHANCE. 99% FAITH."
            </div>
          </div>

          {/* Game Core Philosophy */}
          <div className="bg-facility-950/60 border border-facility-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center space-x-2 text-facility-cyan font-bold text-xs uppercase tracking-wider font-mono">
              <Sparkles className="w-4 h-4" />
              <span>Core Game Philosophy</span>
            </div>
            <p className="text-xs text-slate-300">
              <span className="text-facility-cyan font-semibold">"Your past self becomes your greatest teammate."</span> AFTERIMAGE is engineered to bridge cinematic puzzle adventure with computational thinking, sequential logic, pattern recognition, and algorithm education without ads, paywalls, or forced delays.
            </p>
          </div>

          {/* Technology & Engineering Credits */}
          <div className="bg-facility-950/60 border border-facility-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center space-x-2 text-facility-purple font-bold text-xs uppercase tracking-wider font-mono">
              <Terminal className="w-4 h-4" />
              <span>Engine & Technology Stack</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-facility-900 p-2 rounded-lg border border-facility-800">
                <span className="text-slate-400">Rendering:</span> <span className="text-white font-semibold">Three.js 2.5D WebGL</span>
              </div>
              <div className="bg-facility-900 p-2 rounded-lg border border-facility-800">
                <span className="text-slate-400">Application:</span> <span className="text-white font-semibold">React 18 & TypeScript</span>
              </div>
              <div className="bg-facility-900 p-2 rounded-lg border border-facility-800">
                <span className="text-slate-400">Motion UI:</span> <span className="text-white font-semibold">Tailwind & Framer Motion</span>
              </div>
              <div className="bg-facility-900 p-2 rounded-lg border border-facility-800">
                <span className="text-slate-400">Audio Engine:</span> <span className="text-white font-semibold">Web Audio API Synthesis</span>
              </div>
            </div>
          </div>

          {/* Third-Party Licensing & Legal */}
          <div className="bg-facility-950/60 border border-facility-800 p-4 rounded-xl space-y-2 text-xs text-slate-400">
            <div className="flex items-center space-x-2 text-amber-400 font-bold uppercase tracking-wider font-mono">
              <Shield className="w-4 h-4" />
              <span>Licensing & Copyright Notice</span>
            </div>
            <p>
              © 2026 SMP. All Rights Reserved. AFTERIMAGE and the SMP brand identity are protected under intellectual property and copyright laws.
            </p>
            <p className="text-[11px] text-slate-400">
              Open source components used under the MIT License include Three.js, React, Lucide Icons, Vite, and Vitest.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-facility-800 flex justify-between items-center text-xs font-mono text-slate-400">
          <span>SMP ORIGINAL PRODUCTIONS</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#D4A52C] hover:bg-[#F5D061] text-[#090A0D] font-bold rounded-xl transition"
          >
            Close Credits
          </button>
        </div>
      </motion.div>
    </div>
  );
};
