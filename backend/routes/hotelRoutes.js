const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { query } = require('../config/db');
const { upload, uploadsDir } = require('../middleware/upload');

// Helper to safely delete an uploaded file
const safelyDeleteFile = (relativeFilePath) => {
  if (!relativeFilePath) return;
  // Protect seed samples from being deleted
  if (relativeFilePath.includes('sample-hotel')) return;

  const absolutePath = path.join(__dirname, '..', relativeFilePath);
  if (fs.existsSync(absolutePath)) {
    try {
      fs.unlinkSync(absolutePath);
      console.log(`Deleted file: ${absolutePath}`);
    } catch (err) {
      console.warn(`Could not delete file ${absolutePath}:`, err.message);
    }
  }
};

/**
 * GET /api/hotels
 * Retrieve all hotels with optional search, price range filter, and sorting.
 * Strictly uses native parameterized queries.
 */
router.get('/', async (req, res, next) => {
  try {
    const { search, minPrice, maxPrice, sort } = req.query;

    const conditions = [];
    const values = [];

    // Filter by search keyword (case-insensitive across title and description)
    if (search && search.trim() !== '') {
      values.push(`%${search.trim()}%`);
      const paramIndex = values.length;
      conditions.push(`(LOWER(title) LIKE LOWER($${paramIndex}) OR LOWER(description) LIKE LOWER($${paramIndex}))`);
    }

    // Filter by minimum price
    if (minPrice !== undefined && minPrice !== '' && !isNaN(minPrice)) {
      values.push(parseFloat(minPrice));
      conditions.push(`price >= $${values.length}`);
    }

    // Filter by maximum price
    if (maxPrice !== undefined && maxPrice !== '' && !isNaN(maxPrice)) {
      values.push(parseFloat(maxPrice));
      conditions.push(`price <= $${values.length}`);
    }

    let sql = 'SELECT * FROM hotels';
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    // Order by options (safelist to prevent SQL injection in ORDER BY)
    switch (sort) {
      case 'price_asc':
        sql += ' ORDER BY price ASC, id ASC';
        break;
      case 'price_desc':
        sql += ' ORDER BY price DESC, id ASC';
        break;
      case 'title_asc':
        sql += ' ORDER BY title ASC, id ASC';
        break;
      case 'oldest':
        sql += ' ORDER BY created_at ASC, id ASC';
        break;
      case 'newest':
      default:
        sql += ' ORDER BY created_at DESC, id DESC';
        break;
    }

    const result = await query(sql, values);
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/hotels/:id
 * Retrieve single hotel details by ID.
 * Strictly uses native parameterized query ($1).
 */
router.get('/:id', async (req, res, next) => {
  try {
    const hotelId = parseInt(req.params.id, 10);
    if (isNaN(hotelId)) {
      return res.status(400).json({ success: false, message: 'Invalid hotel ID format.' });
    }

    const result = await query('SELECT * FROM hotels WHERE id = $1', [hotelId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Hotel with ID ${hotelId} not found.` });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/hotels
 * Create a new hotel with image upload.
 * Strictly uses native parameterized queries.
 */
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    const { title, description, latitude, longitude, price } = req.body;

    // Input Validation
    const errors = [];
    if (!title || title.trim() === '') errors.push('Title is required.');
    if (!description || description.trim() === '') errors.push('Description is required.');
    
    const parsedLat = parseFloat(latitude);
    if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
      errors.push('Latitude must be a valid number between -90 and 90.');
    }

    const parsedLng = parseFloat(longitude);
    if (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180) {
      errors.push('Longitude must be a valid number between -180 and 180.');
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      errors.push('Price must be a valid positive number.');
    }

    if (!req.file) {
      errors.push('Hotel image is required.');
    }

    if (errors.length > 0) {
      if (req.file) {
        safelyDeleteFile(path.join('uploads', req.file.filename));
      }
      return res.status(400).json({ success: false, errors });
    }

    // Relative file path stored in database (e.g., 'uploads/hotel-12345.jpg')
    const relativeImagePath = `uploads/${req.file.filename}`;

    const insertSql = `
      INSERT INTO hotels (title, description, image_path, latitude, longitude, price)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const result = await query(insertSql, [
      title.trim(),
      description.trim(),
      relativeImagePath,
      parsedLat,
      parsedLng,
      parsedPrice
    ]);

    res.status(201).json({
      success: true,
      message: 'Hotel created successfully.',
      data: result.rows[0]
    });
  } catch (error) {
    if (req.file) {
      safelyDeleteFile(path.join('uploads', req.file.filename));
    }
    next(error);
  }
});

/**
 * PUT /api/hotels/:id
 * Update an existing hotel (optional new image replacement).
 * Strictly uses native parameterized queries.
 */
router.put('/:id', upload.single('image'), async (req, res, next) => {
  try {
    const hotelId = parseInt(req.params.id, 10);
    if (isNaN(hotelId)) {
      if (req.file) safelyDeleteFile(path.join('uploads', req.file.filename));
      return res.status(400).json({ success: false, message: 'Invalid hotel ID format.' });
    }

    // Check if hotel exists
    const checkResult = await query('SELECT * FROM hotels WHERE id = $1', [hotelId]);
    if (checkResult.rows.length === 0) {
      if (req.file) safelyDeleteFile(path.join('uploads', req.file.filename));
      return res.status(404).json({ success: false, message: `Hotel with ID ${hotelId} not found.` });
    }

    const existingHotel = checkResult.rows[0];
    const { title, description, latitude, longitude, price } = req.body;

    // Input Validation
    const errors = [];
    if (!title || title.trim() === '') errors.push('Title is required.');
    if (!description || description.trim() === '') errors.push('Description is required.');
    
    const parsedLat = parseFloat(latitude);
    if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
      errors.push('Latitude must be a valid number between -90 and 90.');
    }

    const parsedLng = parseFloat(longitude);
    if (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180) {
      errors.push('Longitude must be a valid number between -180 and 180.');
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      errors.push('Price must be a valid positive number.');
    }

    if (errors.length > 0) {
      if (req.file) safelyDeleteFile(path.join('uploads', req.file.filename));
      return res.status(400).json({ success: false, errors });
    }

    // Determine image path (keep existing or replace with new upload)
    let newImagePath = existingHotel.image_path;
    let oldFileToDelete = null;

    if (req.file) {
      newImagePath = `uploads/${req.file.filename}`;
      oldFileToDelete = existingHotel.image_path;
    }

    const updateSql = `
      UPDATE hotels
      SET title = $1, description = $2, image_path = $3, latitude = $4, longitude = $5, price = $6
      WHERE id = $7
      RETURNING *;
    `;

    const result = await query(updateSql, [
      title.trim(),
      description.trim(),
      newImagePath,
      parsedLat,
      parsedLng,
      parsedPrice,
      hotelId
    ]);

    // Cleanup old file only after DB update successfully commits
    if (oldFileToDelete) {
      safelyDeleteFile(oldFileToDelete);
    }

    res.json({
      success: true,
      message: 'Hotel updated successfully.',
      data: result.rows[0]
    });
  } catch (error) {
    if (req.file) safelyDeleteFile(path.join('uploads', req.file.filename));
    next(error);
  }
});

/**
 * DELETE /api/hotels/:id
 * Delete a hotel record and clean up stored file.
 * Strictly uses native parameterized query ($1).
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const hotelId = parseInt(req.params.id, 10);
    if (isNaN(hotelId)) {
      return res.status(400).json({ success: false, message: 'Invalid hotel ID format.' });
    }

    const deleteSql = 'DELETE FROM hotels WHERE id = $1 RETURNING *;';
    const result = await query(deleteSql, [hotelId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Hotel with ID ${hotelId} not found.` });
    }

    const deletedHotel = result.rows[0];

    // Safely delete image file from server filesystem
    safelyDeleteFile(deletedHotel.image_path);

    res.json({
      success: true,
      message: `Hotel "${deletedHotel.title}" deleted successfully.`,
      data: deletedHotel
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
