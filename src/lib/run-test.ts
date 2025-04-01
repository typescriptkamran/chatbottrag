import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { testChat } from './test-chat';
import { initializeVectorStore } from './vector-store';

// Load environment variables from .env.local
const envPath = resolve(__dirname, '../../.env.local');
console.log('Loading environment variables from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading environment variables:', result.error);
  process.exit(1);
}

// Log environment variables (without sensitive data)
console.log('Environment variables loaded:', {
  PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME,
  PINECONE_API_KEY_LENGTH: process.env.PINECONE_API_KEY?.length || 0,
});

async function runTests() {
  try {
    console.log('Initializing vector store...');
    await initializeVectorStore();
    console.log('Vector store initialized successfully.\n');

    console.log('Running chat tests...');
    await testChat();
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

runTests().catch(console.error); 