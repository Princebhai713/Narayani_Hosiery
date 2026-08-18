import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  try {
    await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_details JSONB;');
    console.log("Migration successful");
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

migrate();
