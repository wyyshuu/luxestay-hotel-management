
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Building, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import HotelCard from './HotelCard';
import { openCreateModal } from '../store/uiSlice';
import { fetchHotels, resetFilters } from '../store/hotelSlice';

const HOTELS_PER_PAGE = 6;

export default function HotelGrid() {
  const dispatch = useDispatch();

  const { items, status, error, filters } = useSelector(
    (state) => state.hotels
  );

  const [currentPage, setCurrentPage] = useState(1);

  const isFiltered =
    filters.search ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.sort !== 'newest';

  const totalPages = Math.ceil(items.length / HOTELS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.minPrice, filters.maxPrice, filters.sort]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * HOTELS_PER_PAGE;

  const currentHotels = items.slice(
    startIndex,
    startIndex + HOTELS_PER_PAGE
  );

  if (status === 'loading' && items.length === 0) {
    return <div className="hotel-grid">Loading hotels...</div>;
  }

  if (status === 'failed' && items.length === 0) {
    return (
      <div className="empty-state">
        <AlertCircle size={32} />
        <h3>Unable to Load Hotels</h3>
        <p>{error || 'Please check the backend server.'}</p>
        <button
          onClick={() => dispatch(fetchHotels(filters))}
          className="btn-primary"
        >
          <RefreshCw size={16} /> Retry Connection
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <Building size={32} />
        <h3>
          {isFiltered
            ? 'No Hotels Matched Your Criteria'
            : 'No Hotels Registered Yet'}
        </h3>
        <button
          onClick={() =>
            isFiltered
              ? dispatch(resetFilters())
              : dispatch(openCreateModal())
          }
          className="btn-primary"
        >
          {isFiltered ? 'Clear Filters' : 'Add First Hotel'}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="hotel-grid">
        {currentHotels.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} />
        ))}
      </div>

      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            margin: '35px 0',
            flexWrap: 'wrap'
          }}
        >
          <button
            className="btn-secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>

          {Array.from(
            { length: totalPages },
            (_, index) => index + 1
          ).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{
                padding: '9px 15px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                cursor: 'pointer',
                background:
                  currentPage === page ? '#7c3aed' : '#ffffff',
                color:
                  currentPage === page ? '#ffffff' : '#333333'
              }}
            >
              {page}
            </button>
          ))}

          <button
            className="btn-secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}

      <p style={{ textAlign: 'center', marginBottom: '25px' }}>
        Showing {startIndex + 1}–
        {Math.min(startIndex + HOTELS_PER_PAGE, items.length)}
        {' '}of {items.length} hotels
      </p>
    </div>
  );
}
