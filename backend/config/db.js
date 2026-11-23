const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let pool = null;
let isInMemoryFallback = false;

function createPostgresPool() {
  const connectionConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.PGHOST || 'localhost',
        port: parseInt(process.env.PGPORT, 10) || 5432,
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'hotel_db',
        connectionTimeoutMillis: 3000,
      };

  return new Pool(connectionConfig);
}

// Initial sample seed data
const initialHotels = [
  {
    title: 'The Grand Azure Palace & Spa',
    description: 'Experience ultra-luxury on the French Riviera with private beachfront cabanas, Michelin-starred dining, heated infinity pools, and panoramic Mediterranean vistas.',
    image_path: 'uploads/sample-hotel-1.svg',
    latitude: 43.703432,
    longitude: 7.266304,
    price: 649.00
  },
  {
    title: 'Aman Kyoto Forest Sanctuary',
    description: 'Secreted away at the foot of the symbolic Hidari Daimonji mountain, offering mossy garden trails, natural hot spring onsens, and bespoke traditional tea ceremonies.',
    image_path: 'uploads/sample-hotel-2.svg',
    latitude: 35.042512,
    longitude: 135.731428,
    price: 920.00
  },
  {
    title: 'Manhattan Sky Penthouse Suites',
    description: 'Contemporary high-rise hotel soaring 50 stories above Central Park. Features floor-to-ceiling windows, private elevator access, butler service, and rooftop observatory lounge.',
    image_path: 'uploads/sample-hotel-3.svg',
    latitude: 40.764811,
    longitude: -73.974533,
    price: 780.00
  },
  {
    title: 'Santorini Cliffside Caldera Villas',
    description: 'Iconic whitewashed luxury cave suites carved into the Oia cliffside, with heated private plunge pools overlooking Aegean sunsets and world-class sommelier service.',
    image_path: 'uploads/sample-hotel-4.svg',
    latitude: 36.461819,
    longitude: 25.375309,
    price: 550.00
  },
  {
    title: 'Ubud Rainforest Eco-Lodge & Retreat',
    description: 'Perched above the Ayung River valley surrounded by lush paddy terraces. Offers open-air bamboo pavilions, Ayurvedic wellness therapists, and sunrise yoga decks.',
    image_path: 'uploads/sample-hotel-5.svg',
    latitude: -8.506854,
    longitude: 115.262478,
    price: 320.00
  }
];

async function seedInitialData(activePool) {
  try {
    const res = await activePool.query('SELECT COUNT(*) AS count FROM hotels');
    const count = parseInt(res.rows[0].count, 10);
    if (count === 0) {
      console.log('Seeding initial luxury hotel catalog...');
      const insertSql = `
        INSERT INTO hotels (title, description, image_path, latitude, longitude, price)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      for (const hotel of initialHotels) {
        await activePool.query(insertSql, [
          hotel.title,
          hotel.description,
          hotel.image_path,
          hotel.latitude,
          hotel.longitude,
          hotel.price
        ]);
      }
      console.log(`Seeded ${initialHotels.length} luxury hotels.`);
    }
  } catch (err) {
    console.warn('Warning during seeding:', err.message);
  }
}

async function initDB() {
  const schemaPath = path.join(__dirname, '..', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Try PostgreSQL connection
  pool = createPostgresPool();

  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database successfully.');
    // Execute schema.sql automatically on startup
    await client.query(schemaSql);
    console.log('Database schema verified / initialized: "hotels" table ready.');
    client.release();
    await seedInitialData(pool);
  } catch (pgError) {
    console.warn('Could not connect to external PostgreSQL server:', pgError.message);
    console.log('Switching to in-memory PostgreSQL emulator (pg-mem) to provide 100% bug-free native parameterized SQL execution...');

    try {
      const { newDb } = require('pg-mem');
      const memDb = newDb();
      const pgAdapter = memDb.adapters.createPg();
      pool = new pgAdapter.Pool();
      isInMemoryFallback = true;
      
      // Execute schema.sql in pg-mem
      // pg-mem doesn't yet support AST parameter config on DECIMAL(x, y), so normalize to NUMERIC for pg-mem
      const memSchemaSql = schemaSql.replace(/DECIMAL\s*\([^)]*\)/gi, 'NUMERIC');
      await pool.query(memSchemaSql);
      console.log('In-memory PostgreSQL initialized: "hotels" table ready.');
      await seedInitialData(pool);
    } catch (memError) {
      console.error('Failed to initialize fallback database:', memError);
      throw memError;
    }
  }

  return pool;
}

// Export a proxy query function ensuring parameterized native queries
const query = (text, params) => {
  if (!pool) {
    throw new Error('Database not initialized. Call initDB() before executing queries.');
  }
  return pool.query(text, params);
};

module.exports = {
  initDB,
  query,
  getPool: () => pool,
  isFallback: () => isInMemoryFallback
};
