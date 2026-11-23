import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Building, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import HotelCard from './HotelCard';
import { openCreateModal } from '../store/uiSlice';
import { fetchHotels, resetFilters } from '../store/hotelSlice';

export default function HotelGrid() {
  const dispatch = useDispatch();
  const { items, status, error, filters } = useSelector((state) => state.hotels);

  const isFiltered = filters.search || filters.minPrice || filters.maxPrice || filters.sort !== 'newest';

  // Loading skeleton placeholder cards
  if (status === 'loading' && items.length === 0) {
    return (
      <div className="hotel-grid">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div key={idx} className="skeleton-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-body">
              <div className="skeleton-line" style={{ width: '70%', height: '22px' }}></div>
              <div className="skeleton-line" style={{ width: '40%', height: '14px' }}></div>
              <div className="skeleton-line" style={{ width: '90%', height: '40px' }}></div>
              <div className="skeleton-line" style={{ width: '50%', height: '28px', marginTop: '10px' }}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (status === 'failed' && items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
          <AlertCircle size={32} />
        </div>
        <h3 className="empty-state-title">Unable to Load Hotels</h3>
        <p className="empty-state-text">
          {error || 'Could not connect to the hotel database service. Please ensure the backend server is running.'}
        </p>
        <button
          onClick={() => dispatch(fetchHotels(filters))}
          className="btn-primary"
        >
          <RefreshCw size={16} />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  // Empty state (no matches)
  if (items.length === 0) {
    return (
      <div className="empty-state animate-fade-in">
        <div className="empty-state-icon">
          <Building size={32} />
        </div>
        <h3 className="empty-state-title">
          {isFiltered ? 'No Hotels Matched Your Criteria' : 'No Hotels Registered Yet'}
        </h3>
        <p className="empty-state-text">
          {isFiltered
            ? 'Try adjusting your search terms or price filter range to discover available properties.'
            : 'Start building your portfolio by adding the first luxury hotel property.'}
        </p>
        {isFiltered ? (
          <button
            onClick={() => dispatch(resetFilters())}
            className="btn-secondary"
          >
            Clear All Filters
          </button>
        ) : (
          <button
            onClick={() => dispatch(openCreateModal())}
            className="btn-primary"
            id="btn-empty-state-add"
          >
            <Plus size={18} />
            <span>Add First Hotel</span>
          </button>
        )}
      </div>
    );
  }

  // Responsive Grid Layout
  return (
    <div className="hotel-grid">
      {items.map((hotel) => (
        <HotelCard key={hotel.id} hotel={hotel} />
      ))}
    </div>
  );
}
