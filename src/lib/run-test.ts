import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { testChat } from './test-chat';
import { initializeVectorStore } from './vector-store';

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../../.env.local') });

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