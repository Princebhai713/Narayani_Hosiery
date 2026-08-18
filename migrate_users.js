import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  try {
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS gstin VARCHAR(50);');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;');
    // We also want to drop the NOT NULL constraint on password if we are doing OTP/Phone login
    await pool.query('ALTER TABLE users ALTER COLUMN password DROP NOT NULL;');
    console.log("Migration successful");
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

migrate();
