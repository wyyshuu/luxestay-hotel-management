import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import { closeDeleteModal } from '../store/uiSlice';
import { deleteHotel } from '../store/hotelSlice';
import { getImageUrl } from '../utils/formatters';

export default function DeleteConfirmModal() {
  const dispatch = useDispatch();
  const { isDeleteOpen, deletingHotel } = useSelector((state) => state.ui);
  const { isMutating } = useSelector((state) => state.hotels);

  if (!isDeleteOpen || !deletingHotel) return null;

  const handleDelete = async () => {
    const resultAction = await dispatch(deleteHotel(deletingHotel.id));
    if (deleteHotel.fulfilled.match(resultAction)) {
      dispatch(closeDeleteModal());
    }
  };

  const imageUrl = getImageUrl(deletingHotel.image_path);

  return (
    <div className="modal-overlay" onClick={() => !isMutating && dispatch(closeDeleteModal())}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px' }}
        id="delete-confirm-modal"
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} />
            </div>
            <h2 className="modal-title" style={{ fontSize: '1.2rem' }}>Confirm Hotel Deletion</h2>
          </div>
          <button
            onClick={() => dispatch(closeDeleteModal())}
            className="btn-close-modal"
            disabled={isMutating}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ gap: '1rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5' }}>
            Are you sure you want to permanently delete this hotel? This action will remove the database record and delete its uploaded photograph from the server.
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.85rem',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}>
            <img
              src={imageUrl}
              alt={deletingHotel.title}
              style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=150&q=80';
              }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--secondary)' }}>
                {deletingHotel.title}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Property ID: #{deletingHotel.id}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            onClick={() => dispatch(closeDeleteModal())}
            className="btn-secondary"
            disabled={isMutating}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="btn-danger"
            disabled={isMutating}
            id="btn-confirm-delete"
          >
            {isMutating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Delete Hotel</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
