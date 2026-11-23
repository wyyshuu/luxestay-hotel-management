import React from 'react';
import { useDispatch } from 'react-redux';
import { MapPin, Edit3, Trash2, Eye, ExternalLink } from 'lucide-react';
import { openEditModal, openDeleteModal, openDetailModal } from '../store/uiSlice';
import { getImageUrl, formatCurrency, formatCoordinates, getGoogleMapsUrl, truncateText } from '../utils/formatters';

export default function HotelCard({ hotel }) {
  const dispatch = useDispatch();

  const imageUrl = getImageUrl(hotel.image_path);
  const formattedPrice = formatCurrency(hotel.price);
  const coordinatesText = formatCoordinates(hotel.latitude, hotel.longitude);
  const mapsUrl = getGoogleMapsUrl(hotel.latitude, hotel.longitude);

  return (
    <article className="hotel-card animate-fade-in" id={`hotel-card-${hotel.id}`}>
      {/* Hotel Image & Price Floating Pill */}
      <div className="hotel-image-container">
        <img
          src={imageUrl}
          alt={hotel.title}
          className="hotel-image"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="hotel-badge-exclusive">Exclusive</div>
        <div className="hotel-price-pill">
          <span className="price-amount">{formattedPrice}</span>
          <span className="price-unit">/ night</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="hotel-card-body">
        <h3
          className="hotel-card-title"
          title={hotel.title}
          onClick={() => dispatch(openDetailModal(hotel))}
          style={{ cursor: 'pointer' }}
        >
          {hotel.title}
        </h3>

        {/* Coordinates / Map Pin */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hotel-location-badge"
          title="Open in Google Maps"
          onClick={(e) => e.stopPropagation()}
        >
          <MapPin size={14} style={{ color: '#ef4444' }} />
          <span>{coordinatesText}</span>
          <ExternalLink size={11} style={{ opacity: 0.6 }} />
        </a>

        {/* Description */}
        <p className="hotel-card-description">
          {truncateText(hotel.description, 115)}
        </p>

        {/* Card Footer Actions */}
        <div className="hotel-card-footer">
          <button
            onClick={() => dispatch(openDetailModal(hotel))}
            className="btn-card-action btn-view-details"
            title="View full details"
          >
            <Eye size={15} />
            <span>Details</span>
          </button>

          <div className="card-icon-actions">
            <button
              onClick={() => dispatch(openEditModal(hotel))}
              className="btn-icon-edit"
              title="Edit hotel details"
              id={`btn-edit-hotel-${hotel.id}`}
            >
              <Edit3 size={15} />
            </button>

            <button
              onClick={() => dispatch(openDeleteModal(hotel))}
              className="btn-icon-delete"
              title="Delete hotel"
              id={`btn-delete-hotel-${hotel.id}`}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
