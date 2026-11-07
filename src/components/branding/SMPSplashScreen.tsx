import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { SMPLogo } from './SMPLogo';
import { sound } from '../../services/audio/AudioService';

interface SMPSplashScreenProps {
  onComplete: () => void;
}

export const SMPSplashScreen: React.FC<SMPSplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    // Play subtle cinematic intro resonance
    sound.playLevelSuccess();

    // Auto complete after 3.2 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#090A0D] flex flex-col items-center justify-center overflow-hidden cursor-pointer" onClick={onComplete}>
      {/* Cinematic Ambient Atmosphere */}
      <div className="absolute inset-0 bg-radial from-[#8F6415]/15 via-transparent to-transparent opacity-40 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 scanlines opacity-30 pointer-events-none" />

      {/* Animated Light Sweep Effect */}
      <motion.div
        initial={{ x: '-100%', opacity: 0 }}
        animate={{ x: '100%', opacity: [0, 0.4, 0] }}
        transition={{ duration: 1.8, delay: 0.4, ease: 'easeInOut' }}
        className="absolute inset-y-0 w-48 bg-gradient-to-r from-transparent via-[#FFF2A3]/30 to-transparent skew-x-12 pointer-events-none"
      />

      {/* Main Logo Reveal Container */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-xs uppercase font-mono tracking-[0.35em] text-slate-400 mb-2 font-semibold"
        >
          AN SMP ORIGINAL
        </motion.div>

        <SMPLogo size="xl" showTagline={true} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-8 text-xs font-mono text-slate-400 tracking-widest"
        >
          PRESS ANY KEY OR TAP TO CONTINUE
        </motion.div>
      </motion.div>
    </div>
  );
};

