import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, MapPin, ExternalLink, Calendar, Edit3, DollarSign } from 'lucide-react';
import { closeDetailModal, openEditModal } from '../store/uiSlice';
import { getImageUrl, formatCurrency, formatCoordinates, getGoogleMapsUrl } from '../utils/formatters';

export default function HotelDetailModal() {
  const dispatch = useDispatch();
  const { isDetailOpen, detailHotel } = useSelector((state) => state.ui);

  if (!isDetailOpen || !detailHotel) return null;

  const imageUrl = getImageUrl(detailHotel.image_path);
  const formattedPrice = formatCurrency(detailHotel.price);
  const coordinatesText = formatCoordinates(detailHotel.latitude, detailHotel.longitude);
  const mapsUrl = getGoogleMapsUrl(detailHotel.latitude, detailHotel.longitude);

  const formattedDate = detailHotel.created_at
    ? new Date(detailHotel.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Recently';

  const handleEdit = () => {
    dispatch(closeDetailModal());
    dispatch(openEditModal(detailHotel));
  };

  return (
    <div className="modal-overlay" onClick={() => dispatch(closeDetailModal())}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px' }}
        id="hotel-detail-modal"
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{detailHotel.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.2rem' }}>
              <Calendar size={13} />
              <span>Added to portfolio on {formattedDate}</span>
            </div>
          </div>
          <button
            onClick={() => dispatch(closeDetailModal())}
            className="btn-close-modal"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Hero Image */}
          <div className="detail-modal-image-container">
            <img
              src={imageUrl}
              alt={detailHotel.title}
              className="detail-modal-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className="detail-price-badge">
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fde047' }}>
                {formattedPrice}
              </span>
              <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>/ night</span>
            </div>
          </div>

          {/* Coordinates Row */}
          <div className="detail-coordinates-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} style={{ color: '#ef4444' }} />
              <div>
                <span style={{ fontWeight: 600, display: 'block', color: 'var(--secondary)' }}>
                  Location Coordinates
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  {coordinatesText} ({Number(detailHotel.latitude).toFixed(6)}, {Number(detailHotel.longitude).toFixed(6)})
                </span>
              </div>
            </div>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="detail-map-link"
              title="Open location on Google Maps"
            >
              <span>Explore Map</span>
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Description */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.5rem' }}>
              About This Property
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.65', whiteSpace: 'pre-line' }}>
              {detailHotel.description}
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            onClick={handleEdit}
            className="btn-secondary"
            id="btn-detail-edit"
          >
            <Edit3 size={15} />
            <span>Edit Property</span>
          </button>
          <button
            type="button"
            onClick={() => dispatch(closeDetailModal())}
            className="btn-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
