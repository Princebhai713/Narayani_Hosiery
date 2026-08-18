import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const CATEGORIES = [
  'Kids Wear',
  'Mens Innerwear',
  'Womens Hosiery',
  'Readymade',
  'Winter Wear',
  'Nightwear',
  'Socks',
  'Accessories'
];

const ITEM_ADJECTIVES = ['Premium', 'Comfort', 'Cotton', 'Designer', 'Casual', 'Classic', 'Everyday', 'Sports', 'Thermal', 'Seamless'];
const ITEM_NOUNS = {
  'Kids Wear': ['T-Shirt Set', 'Shorts', 'Frock', 'Romper', 'Pajama Set', 'Vest Bundle', 'Jeans', 'Track Pant', 'Sweatshirt', 'Hoodie'],
  'Mens Innerwear': ['Briefs', 'Trunks', 'Boxers', 'Ribbed Vest', 'Gym Vest', 'Thermal Set', 'Cotton Underwear', 'Sports Brief', 'Long John', 'Seamless Trunk'],
  'Womens Hosiery': ['Leggings', 'Kurti Set', 'Panties (Pack of 3)', 'Bra Set', 'Camisole', 'Ankle Length Leggings', 'Cycling Shorts', 'Petticoat', 'Seamless Bra', 'Shapewear'],
  'Readymade': ['Denim Jeans', 'Formal Shirt', 'Casual T-Shirt', 'Chinos', 'Cargo Pants', 'Polo T-Shirt', 'Kurta Pyjama', 'Dress Material', 'Party Wear Dress', 'Palazzo Set'],
  'Winter Wear': ['Sweater', 'Hoodie', 'Thermal Innerwear', 'Woolen Socks', 'Jacket', 'Fleece Pullover', 'Muffler', 'Beanie Cap', 'Gloves', 'Cardigan'],
  'Nightwear': ['Satin Nighty', 'Cotton Pajama Set', 'Sleep T-Shirt', 'Lounge Pants', 'Robe', 'Night Suit', 'Capri Set', 'Shorts Set', 'Maternity Nightwear', 'Fleece Nightgown'],
  'Socks': ['Ankle Length Socks', 'Sports Socks', 'Formal Socks', 'Invisible Loafer Socks', 'Woolen Socks', 'Kids Socks Pack', 'Compression Socks', 'Terry Towel Socks', 'Knee High Socks', 'Crew Socks'],
  'Accessories': ['Handkerchief (Pack of 12)', 'Belt', 'Cap', 'Scarf', 'Tie', 'Wallet', 'Gloves', 'Hairband', 'Dupatta', 'Mask (Pack of 50)']
};

const IMAGES = [
  "https://via.placeholder.com/400x500/2874f0/ffffff?text=Product+Image+1",
  "https://via.placeholder.com/400x500/e58f00/ffffff?text=Product+Image+2",
  "https://via.placeholder.com/400x500/212121/ffffff?text=Product+Image+3",
  "https://via.placeholder.com/400x500/388e3c/ffffff?text=Product+Image+4"
];

const generateProducts = () => {
  let products = [];
  CATEGORIES.forEach(category => {
    for (let i = 0; i < 10; i++) {
      const adj = ITEM_ADJECTIVES[Math.floor(Math.random() * ITEM_ADJECTIVES.length)];
      const noun = ITEM_NOUNS[category][i];
      const name = `${adj} ${noun}`;
      const description = `High quality wholesale ${name.toLowerCase()} for B2B bulk orders. 100% original and premium material. Fast moving item.`;
      
      const net_rate = Math.floor(Math.random() * (400 - 50 + 1) + 50); // 50 to 400
      const moq_options = [6, 12, 24, 30, 60];
      const moq = moq_options[Math.floor(Math.random() * moq_options.length)];
      
      const id = `NH-${category.substring(0,3).toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      const productImages = [IMAGES[Math.floor(Math.random() * IMAGES.length)]];

      products.push({ id, name, description, net_rate, moq, category, images: JSON.stringify(productImages) });
    }
  });
  return products;
};

async function seedDB() {
  const products = generateProducts();
  console.log(`Generated ${products.length} products. Inserting into database...`);
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Optional: Clear existing products? No, let's just append to avoid losing real ones.
    
    for (const p of products) {
      await client.query(`
        INSERT INTO products (id, name, description, net_rate, moq, category, images)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [p.id, p.name, p.description, p.net_rate, p.moq, p.category, p.images]);
    }
    
    await client.query('COMMIT');
    console.log('Successfully seeded database with 80 products!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error seeding DB:', err);
  } finally {
    client.release();
    pool.end();
  }
}

seedDB();
