import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import {
  setSearchFilter,
  setMinPriceFilter,
  setMaxPriceFilter,
  setSortFilter,
  resetFilters,
  fetchHotels
} from '../store/hotelSlice';

export default function FilterBar() {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.hotels.filters);

  const [searchTerm, setSearchTerm] = useState(filters.search);
  const [minPrice, setMinPrice] = useState(filters.minPrice);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice);

  // Sync internal state if Redux filters are reset
  useEffect(() => {
    setSearchTerm(filters.search);
    setMinPrice(filters.minPrice);
    setMaxPrice(filters.maxPrice);
  }, [filters.search, filters.minPrice, filters.maxPrice]);

  // Debounced search trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== filters.search) {
        dispatch(setSearchFilter(searchTerm));
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [searchTerm, dispatch, filters.search]);

  // Price range debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      if (minPrice !== filters.minPrice) {
        dispatch(setMinPriceFilter(minPrice));
      }
      if (maxPrice !== filters.maxPrice) {
        dispatch(setMaxPriceFilter(maxPrice));
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [minPrice, maxPrice, dispatch, filters.minPrice, filters.maxPrice]);

  // Trigger API fetch whenever filters change
  useEffect(() => {
    dispatch(fetchHotels(filters));
  }, [filters.search, filters.minPrice, filters.maxPrice, filters.sort, dispatch]);

  const handleSortChange = (e) => {
    dispatch(setSortFilter(e.target.value));
  };

  const handleReset = () => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    dispatch(resetFilters());
  };

  const isFiltered = filters.search || filters.minPrice || filters.maxPrice || filters.sort !== 'newest';

  return (
    <div className="filter-bar">
      <div className="search-input-wrapper">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search by hotel title or amenities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          id="search-hotels-input"
        />
      </div>

      <div className="filter-actions">
        <div className="price-filter-group" title="Filter by nightly price range">
          <input
            type="number"
            placeholder="Min $"
            min="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="price-input"
            id="min-price-input"
          />
          <span className="price-separator">–</span>
          <input
            type="number"
            placeholder="Max $"
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="price-input"
            id="max-price-input"
          />
        </div>

        <select
          value={filters.sort}
          onChange={handleSortChange}
          className="sort-select"
          id="sort-hotels-select"
        >
          <option value="newest">Recently Added</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="title_asc">Name: A to Z</option>
          <option value="oldest">Oldest First</option>
        </select>

        {isFiltered && (
          <button
            onClick={handleReset}
            className="btn-reset"
            title="Clear all filters"
            id="btn-reset-filters"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
