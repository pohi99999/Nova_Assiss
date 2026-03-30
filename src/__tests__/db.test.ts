import { db } from '../lib/db.js';

async function testDB() {
  console.log('Testing database connection...');
  
  await db.init();
  
  const docs = await db.getTable('documents');
  const memories = await db.getTable('memories');
  const threads = await db.getThreads();

  if (!Array.isArray(docs)) {
    throw new Error('db.documents must return an array');
  }

  if (!Array.isArray(memories)) {
    throw new Error('db.memories must return an array');
  }
  
  if (!Array.isArray(threads)) {
    throw new Error('db.threads must return an array');
  }

  console.log('✅ Database test passed!');
}

try {
  await testDB();
} catch (error: unknown) {
  console.error('❌ Database test failed:');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
