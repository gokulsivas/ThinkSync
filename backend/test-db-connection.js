const pool = require('./config/database');

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Test query
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database query successful:', result.rows[0]);
    
    // Check if users table exists
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'users'
    `);
    console.log('✅ Users table exists:', tableCheck.rows.length > 0);
    
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    process.exit();
  }
}

testConnection();
