import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HotelListingPage from './pages/HotelListingPage';
import HotelDetailPage from './pages/HotelDetailPage';
import HotelFormModal from './components/HotelFormModal';
import HotelDetailModal from './components/HotelDetailModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import ToastContainer from './components/ToastContainer';

export default function App() {
  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<HotelListingPage />} />
          <Route path="/hotels/:id" element={<HotelDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Interactive Modals & Notification Toasts */}
      <HotelFormModal />
      <HotelDetailModal />
      <DeleteConfirmModal />
      <ToastContainer />
    </div>
  );
}
