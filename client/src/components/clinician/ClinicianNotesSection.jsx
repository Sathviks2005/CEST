import React, { useState, useEffect } from 'react';
import {
  FaLock,
  FaEdit,
  FaTrash,
  FaPlus,
  FaCalendarAlt,
  FaSpinner,
  FaCheck,
  FaTimes,
  FaShieldAlt,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { clinicianNoteService } from '../../services/clinicianNoteService';

export const ClinicianNotesSection = ({ patientId, patientName }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // New Note Form
  const [text, setText] = useState('');
  const [noteDate, setNoteDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Editing Note State
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editDate, setEditDate] = useState('');
  const [updating, setUpdating] = useState(false);

  // Deleting Note State
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchNotes = async (pageNum = 1, append = false) => {
    if (!patientId) return;
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await clinicianNoteService.getNotes(patientId, pageNum, 50);
      if (res?.data) {
        setNotes((prev) => (append ? [...prev, ...res.data] : res.data));
        setHasMore(Boolean(res.pagination?.hasMore));
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Failed to load clinician notes:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchNotes(1, false);
  }, [patientId]);

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (text.length > 2000) {
      setCreateError('Note cannot exceed 2000 characters');
      return;
    }

    setCreating(true);
    setCreateError('');
    try {
      await clinicianNoteService.createNote({
        patientId,
        text: text.trim(),
        noteDate: noteDate ? new Date(noteDate) : new Date(),
      });
      setText('');
      setNoteDate(new Date().toISOString().split('T')[0]);
      await fetchNotes(1, false);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to save note');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (note) => {
    setEditingId(note._id);
    setEditText(note.text);
    const d = note.noteDate ? new Date(note.noteDate).toISOString().split('T')[0] : '';
    setEditDate(d);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditDate('');
  };

  const handleUpdateNote = async (id) => {
    if (!editText.trim()) return;
    setUpdating(true);
    try {
      await clinicianNoteService.updateNote(id, {
        text: editText.trim(),
        noteDate: editDate ? new Date(editDate) : new Date(),
      });
      cancelEdit();
      await fetchNotes(1, false);
    } catch (err) {
      console.error('Failed to update note:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteNote = async (id) => {
    setDeletingId(id);
    try {
      await clinicianNoteService.deleteNote(id);
      setConfirmDeleteId(null);
      await fetchNotes(1, false);
    } catch (err) {
      console.error('Failed to delete note:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
      {/* Header with Strict Privacy Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-tealBrand-600 dark:text-tealBrand-400">
            <FaLock className="text-xs" />
            <span>Private Clinical Records</span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Clinician Notes</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {notes.length} {notes.length === 1 ? 'Entry' : 'Entries'}
            </span>
          </h3>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-1.5">
            <FaShieldAlt className="text-xs" />
            <span>Only you can see these notes.</span>
          </p>
        </div>
      </div>

      {/* Add New Note Box */}
      <form
        onSubmit={handleCreateNote}
        className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Add Private Clinical Note for {patientName || 'Patient'}
          </label>
          <div className="flex items-center gap-2 text-xs">
            <FaCalendarAlt className="text-slate-400" />
            <input
              type="date"
              value={noteDate}
              onChange={(e) => setNoteDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-tealBrand-500"
            />
          </div>
        </div>

        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={2000}
            rows={3}
            placeholder="Type observations, therapeutic progress, private clinical hypotheses, or follow-up plans (max 2000 chars)..."
            className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-tealBrand-500 transition-all resize-y"
          />
          <span
            className={`absolute bottom-2.5 right-3 text-[11px] font-semibold ${
              text.length > 1800 ? 'text-amber-500' : 'text-slate-400'
            }`}
          >
            {text.length} / 2000
          </span>
        </div>

        {createError && (
          <p className="text-xs text-rose-500 font-semibold">{createError}</p>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">
            Notes are never shared with patients or exportable unless explicitly included in a clinician report.
          </span>
          <button
            type="submit"
            disabled={creating || !text.trim()}
            className="px-4 py-2 rounded-xl bg-tealBrand-600 hover:bg-tealBrand-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 shrink-0"
          >
            {creating ? <FaSpinner className="animate-spin text-xs" /> : <FaPlus className="text-xs" />}
            <span>Save Private Note</span>
          </button>
        </div>
      </form>

      {/* Notes List */}
      {loading ? (
        <div className="py-8 text-center text-slate-400 space-y-2">
          <FaSpinner className="animate-spin text-xl mx-auto text-tealBrand-500" />
          <p className="text-xs">Loading clinical notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
          No private notes recorded yet for this patient. Add your first note above.
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => {
            const isEditing = editingId === note._id;
            const isConfirmingDelete = confirmDeleteId === note._id;

            return (
              <div
                key={note._id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs">
                        <FaCalendarAlt className="text-slate-400" />
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                        />
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Editing note
                      </span>
                    </div>

                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      maxLength={2000}
                      rows={3}
                      className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-tealBrand-500"
                    />

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={updating}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateNote(note._id)}
                        disabled={updating || !editText.trim()}
                        className="px-3.5 py-1.5 rounded-lg bg-tealBrand-600 text-white font-bold text-xs hover:bg-tealBrand-500 flex items-center gap-1 disabled:opacity-50"
                      >
                        {updating ? <FaSpinner className="animate-spin text-xs" /> : <FaCheck className="text-xs" />}
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <FaCalendarAlt className="text-tealBrand-500 text-xs" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {new Date(note.noteDate || note.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        {note.updatedAt && note.updatedAt !== note.createdAt && (
                          <span className="text-[10px] text-slate-400 italic">
                            (edited)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/60 px-2 py-0.5 rounded-lg animate-fadeIn">
                            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                              Delete?
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteNote(note._id)}
                              disabled={deletingId === note._id}
                              className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px] hover:bg-rose-700"
                            >
                              {deletingId === note._id ? '...' : 'Yes'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-1.5 py-0.5 text-slate-500 hover:text-slate-700 text-[10px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEdit(note)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-tealBrand-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Edit Note"
                            >
                              <FaEdit className="text-xs" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(note._id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Delete Note"
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed pt-2">
                      {note.text}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {hasMore && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => fetchNotes(page + 1, true)}
                disabled={loadingMore}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                {loadingMore ? 'Loading older notes...' : 'Load older notes'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
