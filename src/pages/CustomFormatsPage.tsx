// ============================================================================
// PocketForge — Custom Formats Page
// ============================================================================

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { CustomFormat } from '../types';
import CustomFormatEditor from '../components/CustomFormatEditor';

const easeSmooth = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

// ---- Delete Confirmation Sheet ---------------------------------------------

function DeleteConfirmSheet({
  isOpen,
  formatName,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  formatName: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onCancel}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary rounded-t-3xl"
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-9 h-1 rounded-full bg-text-tertiary" />
            </div>
            <div className="px-5 pb-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle size={22} className="text-warning shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-title text-text-primary">Delete Format?</h3>
                  <p className="text-sm text-text-secondary mt-1">
                    This will permanently delete <strong className="text-text-primary">{formatName}</strong>.
                    Teams using this format will keep working but show as unrecognised.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 h-12 rounded-xl bg-bg-tertiary text-text-primary font-body-medium text-sm touch-target"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 h-12 rounded-xl bg-danger text-white font-body-medium text-sm touch-target"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ---- Format Card -----------------------------------------------------------

function FormatCard({
  format,
  onEdit,
  onDelete,
}: {
  format: CustomFormat;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const ruleCount = format.rules?.length || 0;
  const dexCount = format.restrictedDex?.length || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, transition: { duration: 0.15 } }}
      transition={{ duration: 0.25, ease: easeSmooth }}
      className="bg-bg-secondary rounded-2xl border border-border-subtle overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-body-medium text-text-primary truncate">
              {format.name}
            </h3>
            {format.description && (
              <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                {format.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onEdit}
              className="w-9 h-9 rounded-xl bg-bg-tertiary flex items-center justify-center text-text-secondary hover:text-accent-primary transition-colors"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={onDelete}
              className="w-9 h-9 rounded-xl bg-bg-tertiary flex items-center justify-center text-text-secondary hover:text-danger transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-bg-tertiary text-text-tertiary text-[11px] font-medium">
            <Shield size={12} />
            Gen {format.generation || 9}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-bg-tertiary text-text-tertiary text-[11px] font-medium">
            <Sparkles size={12} />
            {ruleCount} rule{ruleCount !== 1 ? 's' : ''}
          </span>
          {dexCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-accent-primary/10 text-accent-primary text-[11px] font-medium">
              {dexCount} Pokémon
            </span>
          )}
        </div>

        {ruleCount > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {format.rules.map((rule) => (
              <span
                key={rule}
                className="px-2 py-0.5 rounded-md bg-bg-tertiary text-text-tertiary text-[10px]"
              >
                {rule}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ---- Main Page -------------------------------------------------------------

export default function CustomFormatsPage() {
  const navigate = useNavigate();
  const customFormats = useStore((s) => s.customFormats);
  const addCustomFormat = useStore((s) => s.addCustomFormat);
  const updateCustomFormat = useStore((s) => s.updateCustomFormat);
  const deleteCustomFormat = useStore((s) => s.deleteCustomFormat);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingFormat, setEditingFormat] = useState<CustomFormat | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomFormat | null>(null);

  const handleCreate = useCallback(() => {
    setEditingFormat(null);
    setEditorOpen(true);
  }, []);

  const handleEdit = useCallback((format: CustomFormat) => {
    setEditingFormat(format);
    setEditorOpen(true);
  }, []);

  const handleSave = useCallback(
    (format: Omit<CustomFormat, 'id' | 'createdAt'>) => {
      if (editingFormat) {
        updateCustomFormat(editingFormat.id, format);
      } else {
        addCustomFormat(format);
      }
    },
    [editingFormat, addCustomFormat, updateCustomFormat]
  );

  const handleDelete = useCallback(() => {
    if (deleteTarget) {
      deleteCustomFormat(deleteTarget.id);
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteCustomFormat]);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors touch-target"
          >
            <ArrowLeft size={22} />
            <span className="font-body-medium">Back</span>
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 h-9 px-4 rounded-xl bg-accent-primary text-white font-body-medium text-sm touch-target"
          >
            <Plus size={16} />
            New
          </button>
        </div>
        <h1 className="font-headline text-text-primary">Custom Formats</h1>
        <p className="text-sm text-text-secondary mt-1">
          Create and manage your own battle formats.
        </p>
      </div>

      {/* Format List */}
      <div className="flex-1 px-4 pb-8 space-y-3">
        <AnimatePresence mode="popLayout">
          {customFormats.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-bg-tertiary mb-4">
                <Sparkles size={32} className="text-accent-primary" />
              </div>
              <h2 className="font-headline text-text-primary mb-2">No Custom Formats</h2>
              <p className="font-body text-text-secondary mb-6 max-w-[260px]">
                Create your own format for when a new regulation drops or for custom tournaments.
              </p>
              <button
                onClick={handleCreate}
                className="h-12 px-6 rounded-xl bg-accent-primary font-body-medium text-white touch-target"
              >
                Create Format
              </button>
            </motion.div>
          ) : (
            customFormats.map((format) => (
              <FormatCard
                key={format.id}
                format={format}
                onEdit={() => handleEdit(format)}
                onDelete={() => setDeleteTarget(format)}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Editor Modal */}
      <CustomFormatEditor
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        editingFormat={editingFormat}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmSheet
        isOpen={!!deleteTarget}
        formatName={deleteTarget?.name || ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
