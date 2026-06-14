// ============================================================================
// PocketForge — Reusable Empty State Component
// ============================================================================

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  iconSize?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  },
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  iconSize = 80,
}: EmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center text-center px-6 py-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-center mb-4"
      >
        <Icon
          size={iconSize}
          strokeWidth={1}
          className="text-text-tertiary"
        />
      </motion.div>

      <motion.h2
        variants={itemVariants}
        className="font-display text-text-primary mb-2"
      >
        {title}
      </motion.h2>

      <motion.p
        variants={itemVariants}
        className="font-body text-text-secondary max-w-[280px] mb-6"
      >
        {description}
      </motion.p>

      {action && (
        <motion.button
          variants={itemVariants}
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          className="h-[48px] px-6 rounded-card-md font-body-medium text-white bg-accent-primary transition-colors"
          style={{ boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)' }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
