import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, MapPin, ExternalLink, Calendar, Edit3, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { fetchHotelById } from '../store/hotelSlice';
import { openEditModal, openDeleteModal } from '../store/uiSlice';
import { getImageUrl, formatCurrency, formatCoordinates, getGoogleMapsUrl } from '../utils/formatters';

export default function HotelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedHotel, error } = useSelector((state) => state.hotels);

  useEffect(() => {
    if (id) {
      dispatch(fetchHotelById(id));
    }
  }, [id, dispatch]);

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
          <AlertCircle size={32} />
        </div>
        <h3 className="empty-state-title">Property Not Found</h3>
        <p className="empty-state-text">
          {error || `The hotel property with ID #${id} could not be located.`}
        </p>
        <Link to="/" className="btn-primary">
          <ArrowLeft size={16} />
          <span>Back to Portfolio</span>
        </Link>
      </div>
    );
  }

  if (!selectedHotel || selectedHotel.id !== parseInt(id, 10)) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <Loader2 size={36} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading hotel details...</p>
      </div>
    );
  }

  const imageUrl = getImageUrl(selectedHotel.image_path);
  const formattedPrice = formatCurrency(selectedHotel.price);
  const coordinatesText = formatCoordinates(selectedHotel.latitude, selectedHotel.longitude);
  const mapsUrl = getGoogleMapsUrl(selectedHotel.latitude, selectedHotel.longitude);

  const formattedDate = selectedHotel.created_at
    ? new Date(selectedHotel.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Recently';

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Breadcrumb / Back button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" className="btn-secondary" style={{ display: 'inline-flex' }}>
          <ArrowLeft size={16} />
          <span>Back to All Properties</span>
        </Link>
      </div>

      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)'
      }}>
        {/* Full Image Header */}
        <div style={{ position: 'relative', width: '100%', height: '420px', backgroundColor: '#e2e8f0' }}>
          <img
            src={imageUrl}
            alt={selectedHotel.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
            }}
          />
          <div className="hotel-badge-exclusive" style={{ top: '1.5rem', left: '1.5rem', fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}>
            Exclusive Portfolio
          </div>
          <div className="detail-price-badge" style={{ bottom: '1.5rem', right: '1.5rem' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fde047' }}>
              {formattedPrice}
            </span>
            <span style={{ fontSize: '0.85rem', opacity: 0.85 }}>/ night</span>
          </div>
        </div>

        <div style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 700, color: 'var(--secondary)', lineHeight: 1.25 }}>
                {selectedHotel.title}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.4rem' }}>
                <Calendar size={14} />
                <span>Listed on {formattedDate} • Property ID: #{selectedHotel.id}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => dispatch(openEditModal(selectedHotel))}
                className="btn-secondary"
              >
                <Edit3 size={16} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => {
                  dispatch(openDeleteModal(selectedHotel));
                  navigate('/');
                }}
                className="btn-danger"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Coordinates Bar */}
          <div className="detail-coordinates-row" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={20} />
              </div>
              <div>
                <span style={{ fontWeight: 700, display: 'block', color: 'var(--secondary)' }}>
                  Geographic Coordinates
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {coordinatesText} ({Number(selectedHotel.latitude).toFixed(6)}, {Number(selectedHotel.longitude).toFixed(6)})
                </span>
              </div>
            </div>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
            >
              <span>View On Google Maps</span>
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Detailed Narrative */}
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '0.85rem' }}>
              Description & Highlights
            </h3>
            <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: '1.75', whiteSpace: 'pre-line' }}>
              {selectedHotel.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
