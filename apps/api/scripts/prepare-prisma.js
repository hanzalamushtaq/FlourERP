const fs = require('fs');
const path = require('path');

const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
const envPath = path.resolve(__dirname, '../.env');

// Read current schema
if (!fs.existsSync(schemaPath)) {
  console.error('schema.prisma not found at', schemaPath);
  process.exit(0);
}

let schema = fs.readFileSync(schemaPath, 'utf8');

// Determine database type from environment or .env
let dbUrl = process.env.DATABASE_URL || '';
if (!dbUrl && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/^\s*DATABASE_URL\s*=\s*["']?([^"'\r\n]+)["']?/m);
  if (match) {
    dbUrl = match[1];
  }
}

const isRender = !!process.env.RENDER;
const isProduction = process.env.NODE_ENV === 'production';
const isPostgres =
  dbUrl.startsWith('postgres:') ||
  dbUrl.startsWith('postgresql:') ||
  isRender ||
  isProduction ||
  !!process.env.DIRECT_URL;

if (!isPostgres && (dbUrl.startsWith('file:') || dbUrl.includes('.db'))) {
  // Use SQLite for local development
  schema = schema.replace(
    /datasource\s+db\s*\{[\s\S]*?\}/,
    `datasource db {\n  provider = "sqlite"\n  url      = env("DATABASE_URL")\n}`
  );
  console.log('✓ prepare-prisma: configured schema.prisma for SQLite (local dev)');
} else {
  // Use PostgreSQL for Production / Supabase / Render
  schema = schema.replace(
    /datasource\s+db\s*\{[\s\S]*?\}/,
    `datasource db {\n  provider  = "postgresql"\n  url       = env("DATABASE_URL")\n  directUrl = env("DIRECT_URL")\n}`
  );
  console.log('✓ prepare-prisma: configured schema.prisma for PostgreSQL (production/Supabase)');
}

fs.writeFileSync(schemaPath, schema, 'utf8');
