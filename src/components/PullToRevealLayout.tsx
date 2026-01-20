'use client';

import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from 'framer-motion';
import SecretSpace from './SecretSpace';
import { ChevronDown } from 'lucide-react';

interface PullToRevealLayoutProps {
  children: React.ReactNode;
  daysTogether: number;
  memoryCount: number;
}

const THRESHOLD = 150;
const REVEAL_HEIGHT = 400;

export default function PullToRevealLayout({ children, daysTogether, memoryCount }: PullToRevealLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const y = useMotionValue(0);
  const controls = useAnimation();
  
  const opacity = useTransform(y, [0, THRESHOLD], [0.5, 1]);
  const scale = useTransform(y, [0, THRESHOLD], [0.95, 1]);
  const rotateIcon = useTransform(y, [0, THRESHOLD], [0, 180]);

  // Chinese text for pull indicator could be added if visual text exists, but here it is just an icon.
  // We can add a small text hint if desired, but user didn't explicitly ask for new text elements, just translation.
  // The current component only has a ChevronDown icon. 
  
  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.y;
    const velocity = info.velocity.y;

    if (!isOpen) {
        // Opening logic
        if (offset > THRESHOLD || velocity > 500) {
            await controls.start({ y: REVEAL_HEIGHT });
            setIsOpen(true);
        } else {
            await controls.start({ y: 0 });
        }
    } else {
        // Closing logic (dragging up)
        if (offset < -50 || velocity < -500) {
             await controls.start({ y: 0 });
             setIsOpen(false);
        } else {
             await controls.start({ y: REVEAL_HEIGHT });
        }
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden">
        {/* Secret Layer (Fixed at Top) */}
        <div className="absolute top-0 left-0 w-full h-[400px] z-0">
            <motion.div style={{ opacity, scale }} className="w-full h-full">
                <SecretSpace daysTogether={daysTogether} memoryCount={memoryCount} />
            </motion.div>
        </div>

        {/* Main Content Layer (Draggable) */}
        <motion.div
            className="relative z-10 bg-slate-50 min-h-screen shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.1)]"
            drag="y"
            dragConstraints={{ top: 0, bottom: REVEAL_HEIGHT }}
            dragElastic={0.1} // Resistance feel
            onDragEnd={handleDragEnd}
            style={{ y }}
            animate={controls}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            {/* Pull Indicator */}
            <div className="absolute top-0 left-0 right-0 h-6 flex justify-center items-center opacity-50 z-50 pointer-events-none">
                 <motion.div style={{ rotate: rotateIcon }}>
                    <ChevronDown size={16} className="text-slate-400" />
                 </motion.div>
            </div>

            {children}
        </motion.div>
    </div>
  );
}
