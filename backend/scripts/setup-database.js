const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

async function setupDatabase() {
  const client = new Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await client.query(schema);
    console.log('Database schema created successfully');

  } catch (error) {
    console.error('Database setup failed:', error);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
