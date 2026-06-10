"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";

interface DoubleTapHeartBurstProps {
  show: boolean;
  onComplete?: () => void;
}

export function DoubleTapHeartBurst({ show, onComplete }: DoubleTapHeartBurstProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="double-tap-heart"
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-hidden
        >
          <motion.div
            initial={{ scale: 0.35, opacity: 1 }}
            animate={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={onComplete}
          >
            <Heart
              className="h-[4.5rem] w-[4.5rem] fill-error text-error drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)] sm:h-20 sm:w-20"
              strokeWidth={1.5}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
