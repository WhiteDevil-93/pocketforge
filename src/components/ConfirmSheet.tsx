// ============================================================================
// PocketForge — Shared destructive/overwrite confirmation sheet
// ============================================================================
//
// Extracted from two previously-separate confirm implementations that had
// drifted apart: PokemonEditor's delete sheet (which already wrapped the
// shared BottomSheet) and CustomFormatsPage's DeleteSheet (a fully hand-rolled
// third overlay implementation, duplicating BottomSheet's backdrop/sheet
// mechanics instead of using it). This is the one confirm pattern going
// forward — every "are you sure" in the app should render through this,
// not a bespoke sheet or (worse) no confirmation at all.

import { motion } from 'framer-motion';
import BottomSheet from './BottomSheet';

interface ConfirmSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  /** Red/destructive styling for the confirm button. Defaults to true — most
   *  uses of this component are destructive; pass false for a neutral
   *  overwrite-style confirmation (e.g. "Load this set anyway?"). */
  danger?: boolean;
  onConfirm: () => void;
}

export default function ConfirmSheet({
  isOpen,
  onClose,
  title,
  message,
  confirmLabel,
  danger = true,
  onConfirm,
}: ConfirmSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title} showSearch={false}>
      <div className="space-y-4 pt-2">
        <p className="font-body text-text-secondary text-center">{message}</p>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            onClose();
            onConfirm();
          }}
          className={`w-full h-12 flex items-center justify-center rounded-xl font-body-medium text-white touch-target ${
            danger ? 'bg-danger' : 'bg-accent-primary'
          }`}
        >
          {confirmLabel}
        </motion.button>
        <button
          onClick={onClose}
          className="w-full h-12 flex items-center justify-center rounded-xl bg-bg-tertiary font-body text-text-primary touch-target"
        >
          Cancel
        </button>
      </div>
    </BottomSheet>
  );
}
