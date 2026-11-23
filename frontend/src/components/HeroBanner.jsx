import React from 'react';
import { useSelector } from 'react-redux';
import { Building, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function HeroBanner() {
  const { items } = useSelector((state) => state.hotels);

  // Compute live statistics
  const count = items.length;
  let minPrice = 0;
  let maxPrice = 0;
  let avgPrice = 0;

  if (count > 0) {
    const prices = items.map(h => Number(h.price) || 0);
    minPrice = Math.min(...prices);
    maxPrice = Math.max(...prices);
    avgPrice = prices.reduce((acc, curr) => acc + curr, 0) / count;
  }

  return (
    <section className="hero-banner">
      <div className="hero-header">
        <h1 className="hero-title">Exclusive Hotel Portfolio</h1>
        <p className="hero-subtitle">
          Manage boutique properties, real-time pricing tiers, geo-coordinates, and high-resolution assets in one centralized dashboard.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Building size={20} />
          </div>
          <div>
            <div className="stat-label">Properties</div>
            <div className="stat-value">{count}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#10b981' }}>
            <DollarSign size={20} />
          </div>
          <div>
            <div className="stat-label">Avg. Rate / Night</div>
            <div className="stat-value">{formatCurrency(avgPrice)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#38bdf8' }}>
            <TrendingDown size={20} />
          </div>
          <div>
            <div className="stat-label">Starting From</div>
            <div className="stat-value">{count > 0 ? formatCurrency(minPrice) : '$0.00'}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#fbbf24' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="stat-label">Peak Suite</div>
            <div className="stat-value">{count > 0 ? formatCurrency(maxPrice) : '$0.00'}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
