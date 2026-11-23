import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Building2, Plus, Server, Sparkles } from 'lucide-react';
import { openCreateModal } from '../store/uiSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const [dbStatus, setDbStatus] = useState('connecting');

  useEffect(() => {
    // Check backend health
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'healthy') {
          setDbStatus(data.databaseMode === 'postgresql-native' ? 'PostgreSQL Active' : 'DB Engine Ready');
        } else {
          setDbStatus('Degraded');
        }
      })
      .catch(() => {
        // Direct host fallback check if proxied port differs
        fetch('http://localhost:5000/api/health')
          .then(res => res.json())
          .then(data => {
            setDbStatus(data.databaseMode === 'postgresql-native' ? 'PostgreSQL Active' : 'DB Engine Ready');
          })
          .catch(() => setDbStatus('Offline'));
      });
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand-link">
          <div className="brand-icon">
            <Building2 size={22} />
          </div>
          <div>
            <span>LuxeStay</span>
            <span className="brand-sub">Hotel Management</span>
          </div>
        </Link>

        <div className="navbar-actions">
          <div className="status-badge" title="Backend Database Status">
            <span className="status-dot"></span>
            <span>{dbStatus}</span>
          </div>

          <button
            onClick={() => dispatch(openCreateModal())}
            className="btn-primary"
            id="btn-add-hotel-nav"
          >
            <Plus size={18} />
            <span>Add Hotel</span>
          </button>
        </div>
      </div>
    </header>
  );
}
