// ============================================================================
// PocketForge — AI Assistant chat sheet
//
// The bottom-sheet presentation of ChatPanel, used from Settings and the
// per-page ChatLauncher. The full-screen Assistant page renders the same panel
// directly, so the two never diverge.
// ============================================================================

import BottomSheet from '../BottomSheet';
import ChatPanel from './ChatPanel';

interface ChatSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatSheet({ isOpen, onClose }: ChatSheetProps) {
  if (!isOpen) return null;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="AI Assistant" showSearch={false}>
      <ChatPanel isActive={isOpen} className="h-[60vh]" onRequestClose={onClose} />
    </BottomSheet>
  );
}
