// ============================================================================
// PocketForge — Custom Formats Page
// ============================================================================

import { useState, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Sparkles,
  Trash2,
  Pencil,
  Layers,
  Shield,
  SlidersHorizontal,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { CustomFormat } from '../types';
import CustomFormatEditor from '../components/CustomFormatEditor';
import EmptyState from '../components/EmptyState';
import ConfirmSheet from '../components/ConfirmSheet';

// ---- Format card ------------------------------------------------------------

function FormatCard({
  format,
  onEdit,
  onDelete,
}: {
  format: CustomFormat;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -60 }}
      className="bg-bg-secondary border border-border-subtle rounded-2xl p-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-title font-semibold text-text-primary truncate">
            {format.name}
          </h3>
          {format.description && (
            <p className="text-body text-text-secondary mt-0.5 truncate">
              {format.description}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-2.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg-tertiary text-caption text-text-secondary">
              <Layers size={12} />
              Gen {format.generation || 9}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg-tertiary text-caption text-text-secondary">
              <Shield size={12} />
              {format.rules.length} rules
            </span>
            {format.restrictedDex && format.restrictedDex.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/10 text-caption text-warning">
                <SlidersHorizontal size={12} />
                {format.restrictedDex.length} Pok&eacute;mon
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 ml-3">
          <button
            onClick={onEdit}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg-tertiary active:bg-bg-elevated transition-colors"
          >
            <Pencil size={16} className="text-text-secondary" />
          </button>
          <button
            onClick={onDelete}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-bg-tertiary active:bg-danger/20 transition-colors"
          >
            <Trash2 size={16} className="text-danger" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ---- Main page --------------------------------------------------------------

export default function CustomFormatsPage() {
  const customFormats = useStore((s) => s.customFormats);
  const addCustomFormat = useStore((s) => s.addCustomFormat);
  const updateCustomFormat = useStore((s) => s.updateCustomFormat);
  const deleteCustomFormat = useStore((s) => s.deleteCustomFormat);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingFormat, setEditingFormat] = useState<CustomFormat | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // The 'new' key alone only reinitializes CustomFormatEditor between editing
  // an existing format and creating one — every "New" open reuses that same
  // key, so a second New after abandoning/creating the first would keep
  // showing the first attempt's stale field values. Bumped on every
  // handleCreate to force a remount each time.
  const [newFormatSession, setNewFormatSession] = useState(0);

  const handleCreate = useCallback(() => {
    setEditingFormat(null);
    setNewFormatSession((n) => n + 1);
    setEditorOpen(true);
  }, []);

  const handleEdit = useCallback((format: CustomFormat) => {
    setEditingFormat(format);
    setEditorOpen(true);
  }, []);

  const handleSave = useCallback(
    (data: Omit<CustomFormat, 'id' | 'createdAt'>) => {
      if (editingFormat) {
        updateCustomFormat(editingFormat.id, data);
      } else {
        addCustomFormat(data);
      }
    },
    [editingFormat, updateCustomFormat, addCustomFormat]
  );

  const handleDelete = useCallback(() => {
    if (deleteId) deleteCustomFormat(deleteId);
    setDeleteId(null);
  }, [deleteId, deleteCustomFormat]);

  const deleteFormat = customFormats.find((f) => f.id === deleteId);

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Custom Formats" backTo="/settings" backLabel="Settings">
        <button
          type="button"
          onClick={handleCreate}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent-primary text-white text-sm font-medium active:scale-95 transition-transform shrink-0"
        >
          <Plus size={16} />
          New
        </button>
      </PageHeader>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {customFormats.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <EmptyState
              icon={Sparkles}
              title="No Custom Formats"
              description="Create your own battle format for any regulation or tournament. No code needed."
              action={{ label: 'Create Format', onClick: handleCreate }}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {customFormats.map((format) => (
                <FormatCard
                  key={format.id}
                  format={format}
                  onEdit={() => handleEdit(format)}
                  onDelete={() => setDeleteId(format.id)}
                />
              ))}
            </AnimatePresence>
            <div className="h-4" />
          </div>
        )}
      </div>

      {/* Editor */}
      {/* Keyed on the target format's id, or a session counter while creating:
          CustomFormatEditor seeds all its field state from `editingFormat`
          via useState-on-mount only, and it stays mounted across opens (only
          `isOpen` toggles) — without the id half of this key, editing a
          second format after the first would show (and on Save, overwrite
          the second format with) the first format's stale values; without
          the session-counter half, repeated "New" opens would do the same
          to each other, since they'd all share the same 'new' id. */}
      <CustomFormatEditor
        key={editingFormat?.id ?? `new-${newFormatSession}`}
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        editingFormat={editingFormat}
        onSave={handleSave}
      />

      {/* Delete confirmation */}
      <ConfirmSheet
        isOpen={!!(deleteId && deleteFormat)}
        onClose={() => setDeleteId(null)}
        title={`Delete "${deleteFormat?.name ?? ''}"?`}
        message="Teams using this format will keep it, but the format definition will be removed."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}
