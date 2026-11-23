import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Upload, Image as ImageIcon, AlertCircle, Loader2 } from 'lucide-react';
import { closeFormModal } from '../store/uiSlice';
import { createHotel, updateHotel } from '../store/hotelSlice';
import { getImageUrl } from '../utils/formatters';

export default function HotelFormModal() {
  const dispatch = useDispatch();
  const { isFormOpen, formMode, editingHotel } = useSelector((state) => state.ui);
  const { isMutating } = useSelector((state) => state.hotels);

  const fileInputRef = useRef(null);

  // Form fields state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    latitude: '',
    longitude: '',
    price: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [isDragOver, setIsDragOver] = useState(false);

  // Populate form if in edit mode
  useEffect(() => {
    if (formMode === 'edit' && editingHotel) {
      setFormData({
        title: editingHotel.title || '',
        description: editingHotel.description || '',
        latitude: editingHotel.latitude !== undefined ? editingHotel.latitude.toString() : '',
        longitude: editingHotel.longitude !== undefined ? editingHotel.longitude.toString() : '',
        price: editingHotel.price !== undefined ? editingHotel.price.toString() : '',
      });
      setPreviewUrl(getImageUrl(editingHotel.image_path));
      setImageFile(null);
    } else {
      setFormData({
        title: '',
        description: '',
        latitude: '',
        longitude: '',
        price: '',
      });
      setPreviewUrl('');
      setImageFile(null);
    }
    setErrors({});
  }, [formMode, editingHotel, isFormOpen]);

  if (!isFormOpen) return null;

  // Validate form fields
  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      errs.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      errs.description = 'Description must be at least 10 characters';
    }

    const lat = parseFloat(formData.latitude);
    if (!formData.latitude || isNaN(lat)) {
      errs.latitude = 'Valid latitude is required';
    } else if (lat < -90 || lat > 90) {
      errs.latitude = 'Latitude must be between -90 and 90';
    }

    const lng = parseFloat(formData.longitude);
    if (!formData.longitude || isNaN(lng)) {
      errs.longitude = 'Valid longitude is required';
    } else if (lng < -180 || lng > 180) {
      errs.longitude = 'Longitude must be between -180 and 180';
    }

    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price)) {
      errs.price = 'Valid price is required';
    } else if (price <= 0) {
      errs.price = 'Price must be greater than $0.00';
    }

    if (formMode === 'create' && !imageFile) {
      errs.image = 'Hotel image is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, image: 'File must be an image (JPEG, PNG, WebP, SVG)' }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Image size cannot exceed 10MB' }));
      return;
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image: null }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = new FormData();
    data.append('title', formData.title.trim());
    data.append('description', formData.description.trim());
    data.append('latitude', formData.latitude.trim());
    data.append('longitude', formData.longitude.trim());
    data.append('price', formData.price.trim());

    if (imageFile) {
      data.append('image', imageFile);
    }

    if (formMode === 'create') {
      const resultAction = await dispatch(createHotel(data));
      if (createHotel.fulfilled.match(resultAction)) {
        dispatch(closeFormModal());
      }
    } else {
      const resultAction = await dispatch(updateHotel({ id: editingHotel.id, formData: data }));
      if (updateHotel.fulfilled.match(resultAction)) {
        dispatch(closeFormModal());
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={() => dispatch(closeFormModal())}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        id="hotel-form-modal"
      >
        <div className="modal-header">
          <h2 className="modal-title">
            {formMode === 'create' ? 'Add Luxury Hotel' : 'Edit Hotel Property'}
          </h2>
          <button
            onClick={() => dispatch(closeFormModal())}
            className="btn-close-modal"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Title Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="hotel-title">
                <span>Hotel Title <span className="required">*</span></span>
              </label>
              <input
                id="hotel-title"
                name="title"
                type="text"
                placeholder="e.g. The Grand Azure Palace & Spa"
                value={formData.title}
                onChange={handleInputChange}
                className={`form-input ${errors.title ? 'has-error' : ''}`}
              />
              {errors.title && (
                <div className="form-error-msg">
                  <AlertCircle size={13} />
                  <span>{errors.title}</span>
                </div>
              )}
            </div>

            {/* Description Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="hotel-description">
                <span>Description <span className="required">*</span></span>
              </label>
              <textarea
                id="hotel-description"
                name="description"
                rows="3"
                placeholder="Describe the hotel atmosphere, amenities, views, and exclusive offerings..."
                value={formData.description}
                onChange={handleInputChange}
                className={`form-textarea ${errors.description ? 'has-error' : ''}`}
              />
              {errors.description && (
                <div className="form-error-msg">
                  <AlertCircle size={13} />
                  <span>{errors.description}</span>
                </div>
              )}
            </div>

            {/* Price & Coordinates 2-Column Grid */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="hotel-price">
                  <span>Price / Night ($ USD) <span className="required">*</span></span>
                </label>
                <input
                  id="hotel-price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 649.00"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`form-input ${errors.price ? 'has-error' : ''}`}
                />
                {errors.price && (
                  <div className="form-error-msg">
                    <AlertCircle size={13} />
                    <span>{errors.price}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="hotel-latitude">
                  <span>Latitude (-90 to 90) <span className="required">*</span></span>
                </label>
                <input
                  id="hotel-latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  placeholder="e.g. 43.703432"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  className={`form-input ${errors.latitude ? 'has-error' : ''}`}
                />
                {errors.latitude && (
                  <div className="form-error-msg">
                    <AlertCircle size={13} />
                    <span>{errors.latitude}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="hotel-longitude">
                <span>Longitude (-180 to 180) <span className="required">*</span></span>
              </label>
              <input
                id="hotel-longitude"
                name="longitude"
                type="number"
                step="any"
                placeholder="e.g. 7.266304"
                value={formData.longitude}
                onChange={handleInputChange}
                className={`form-input ${errors.longitude ? 'has-error' : ''}`}
              />
              {errors.longitude && (
                <div className="form-error-msg">
                  <AlertCircle size={13} />
                  <span>{errors.longitude}</span>
                </div>
              )}
            </div>

            {/* Image Upload Area */}
            <div className="form-group">
              <label className="form-label">
                <span>Hotel Photography {formMode === 'create' && <span className="required">*</span>}</span>
                {formMode === 'edit' && <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>Optional: replace current image</span>}
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                style={{ display: 'none' }}
                id="hotel-image-input"
              />

              {previewUrl ? (
                <div className="image-preview-wrapper">
                  <img src={previewUrl} alt="Preview" className="image-preview" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setPreviewUrl(formMode === 'edit' ? '' : '');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="btn-remove-preview"
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <div
                  className={`upload-dropzone ${isDragOver ? 'drag-active' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  <div className="upload-icon">
                    <Upload size={22} />
                  </div>
                  <div className="upload-text-main">
                    Click to browse or drag & drop an image here
                  </div>
                  <div className="upload-text-sub">
                    Supports high-resolution JPEG, PNG, WebP, SVG up to 10MB
                  </div>
                </div>
              )}

              {errors.image && (
                <div className="form-error-msg">
                  <AlertCircle size={13} />
                  <span>{errors.image}</span>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={() => dispatch(closeFormModal())}
              className="btn-secondary"
              disabled={isMutating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isMutating}
              id="btn-submit-hotel"
            >
              {isMutating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving Property...</span>
                </>
              ) : (
                <span>{formMode === 'create' ? 'Create Hotel' : 'Save Changes'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
