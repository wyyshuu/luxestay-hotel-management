import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  toasts: [],
  // Form Modal (Create or Edit)
  isFormOpen: false,
  formMode: 'create', // 'create' | 'edit'
  editingHotel: null,
  
  // Delete Confirmation Modal
  isDeleteOpen: false,
  deletingHotel: null,

  // Detail Modal / Drawer
  isDetailOpen: false,
  detailHotel: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addToast: (state, action) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 6);
      state.toasts.push({
        id,
        type: action.payload.type || 'info', // 'success' | 'error' | 'info' | 'warning'
        title: action.payload.title || '',
        message: action.payload.message || '',
      });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    openCreateModal: (state) => {
      state.isFormOpen = true;
      state.formMode = 'create';
      state.editingHotel = null;
    },
    openEditModal: (state, action) => {
      state.isFormOpen = true;
      state.formMode = 'edit';
      state.editingHotel = action.payload;
    },
    closeFormModal: (state) => {
      state.isFormOpen = false;
      state.editingHotel = null;
    },
    openDeleteModal: (state, action) => {
      state.isDeleteOpen = true;
      state.deletingHotel = action.payload;
    },
    closeDeleteModal: (state) => {
      state.isDeleteOpen = false;
      state.deletingHotel = null;
    },
    openDetailModal: (state, action) => {
      state.isDetailOpen = true;
      state.detailHotel = action.payload;
    },
    closeDetailModal: (state) => {
      state.isDetailOpen = false;
      state.detailHotel = null;
    }
  }
});

export const {
  addToast,
  removeToast,
  openCreateModal,
  openEditModal,
  closeFormModal,
  openDeleteModal,
  closeDeleteModal,
  openDetailModal,
  closeDetailModal
} = uiSlice.actions;

export default uiSlice.reducer;
