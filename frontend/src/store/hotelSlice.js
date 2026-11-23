import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addToast } from './uiSlice';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

// Async thunk: Fetch all hotels with filters
export const fetchHotels = createAsyncThunk(
  'hotels/fetchHotels',
  async (params = {}, { rejectWithValue }) => {
    try {
      const url = new URL(`${API_BASE}/hotels`);
      if (params.search) url.searchParams.append('search', params.search);
      if (params.minPrice) url.searchParams.append('minPrice', params.minPrice);
      if (params.maxPrice) url.searchParams.append('maxPrice', params.maxPrice);
      if (params.sort) url.searchParams.append('sort', params.sort);

      const response = await fetch(url.toString());
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch hotels.');
      }
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error while fetching hotels.');
    }
  }
);

// Async thunk: Fetch single hotel by ID
export const fetchHotelById = createAsyncThunk(
  'hotels/fetchHotelById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/hotels/${id}`);
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch hotel details.');
      }
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Network error fetching hotel details.');
    }
  }
);

// Async thunk: Create hotel (multipart FormData)
export const createHotel = createAsyncThunk(
  'hotels/createHotel',
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/hotels`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.errors ? data.errors.join(' ') : (data.message || 'Failed to create hotel.');
        dispatch(addToast({
          type: 'error',
          title: 'Creation Failed',
          message: errorMsg
        }));
        return rejectWithValue(errorMsg);
      }

      dispatch(addToast({
        type: 'success',
        title: 'Hotel Created',
        message: `"${data.data.title}" was successfully added to your catalog!`
      }));

      return data.data;
    } catch (error) {
      const msg = error.message || 'Network error during hotel creation.';
      dispatch(addToast({
        type: 'error',
        title: 'Network Error',
        message: msg
      }));
      return rejectWithValue(msg);
    }
  }
);

// Async thunk: Update hotel (multipart FormData)
export const updateHotel = createAsyncThunk(
  'hotels/updateHotel',
  async ({ id, formData }, { dispatch, rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/hotels/${id}`, {
        method: 'PUT',
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.errors ? data.errors.join(' ') : (data.message || 'Failed to update hotel.');
        dispatch(addToast({
          type: 'error',
          title: 'Update Failed',
          message: errorMsg
        }));
        return rejectWithValue(errorMsg);
      }

      dispatch(addToast({
        type: 'success',
        title: 'Hotel Updated',
        message: `"${data.data.title}" has been updated successfully.`
      }));

      return data.data;
    } catch (error) {
      const msg = error.message || 'Network error during hotel update.';
      dispatch(addToast({
        type: 'error',
        title: 'Network Error',
        message: msg
      }));
      return rejectWithValue(msg);
    }
  }
);

// Async thunk: Delete hotel
export const deleteHotel = createAsyncThunk(
  'hotels/deleteHotel',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/hotels/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.message || 'Failed to delete hotel.';
        dispatch(addToast({
          type: 'error',
          title: 'Deletion Failed',
          message: errorMsg
        }));
        return rejectWithValue(errorMsg);
      }

      dispatch(addToast({
        type: 'success',
        title: 'Hotel Removed',
        message: data.message || 'Hotel deleted successfully.'
      }));

      return id;
    } catch (error) {
      const msg = error.message || 'Network error during hotel deletion.';
      dispatch(addToast({
        type: 'error',
        title: 'Network Error',
        message: msg
      }));
      return rejectWithValue(msg);
    }
  }
);

const initialState = {
  items: [],
  selectedHotel: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  isMutating: false,
  filters: {
    search: '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest'
  }
};

const hotelSlice = createSlice({
  name: 'hotels',
  initialState,
  reducers: {
    setSearchFilter: (state, action) => {
      state.filters.search = action.payload;
    },
    setMinPriceFilter: (state, action) => {
      state.filters.minPrice = action.payload;
    },
    setMaxPriceFilter: (state, action) => {
      state.filters.maxPrice = action.payload;
    },
    setSortFilter: (state, action) => {
      state.filters.sort = action.payload;
    },
    resetFilters: (state) => {
      state.filters = {
        search: '',
        minPrice: '',
        maxPrice: '',
        sort: 'newest'
      };
    },
    clearSelectedHotel: (state) => {
      state.selectedHotel = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch hotels
      .addCase(fetchHotels.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Fetch hotel by id
      .addCase(fetchHotelById.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchHotelById.fulfilled, (state, action) => {
        state.selectedHotel = action.payload;
      })
      .addCase(fetchHotelById.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Create hotel
      .addCase(createHotel.pending, (state) => {
        state.isMutating = true;
      })
      .addCase(createHotel.fulfilled, (state, action) => {
        state.isMutating = false;
        state.items.unshift(action.payload);
      })
      .addCase(createHotel.rejected, (state) => {
        state.isMutating = false;
      })

      // Update hotel
      .addCase(updateHotel.pending, (state) => {
        state.isMutating = true;
      })
      .addCase(updateHotel.fulfilled, (state, action) => {
        state.isMutating = false;
        const index = state.items.findIndex(h => h.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedHotel && state.selectedHotel.id === action.payload.id) {
          state.selectedHotel = action.payload;
        }
      })
      .addCase(updateHotel.rejected, (state) => {
        state.isMutating = false;
      })

      // Delete hotel
      .addCase(deleteHotel.pending, (state) => {
        state.isMutating = true;
      })
      .addCase(deleteHotel.fulfilled, (state, action) => {
        state.isMutating = false;
        state.items = state.items.filter(h => h.id !== action.payload);
        if (state.selectedHotel && state.selectedHotel.id === action.payload) {
          state.selectedHotel = null;
        }
      })
      .addCase(deleteHotel.rejected, (state) => {
        state.isMutating = false;
      });
  }
});

export const {
  setSearchFilter,
  setMinPriceFilter,
  setMaxPriceFilter,
  setSortFilter,
  resetFilters,
  clearSelectedHotel
} = hotelSlice.actions;

export default hotelSlice.reducer;
