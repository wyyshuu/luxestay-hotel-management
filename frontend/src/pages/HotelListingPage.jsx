import React from 'react';
import HeroBanner from '../components/HeroBanner';
import FilterBar from '../components/FilterBar';
import HotelGrid from '../components/HotelGrid';

export default function HotelListingPage() {
  return (
    <div>
      <HeroBanner />
      <FilterBar />
      <HotelGrid />
    </div>
  );
}
