import { config } from 'dotenv';
import { resolve } from 'path';
import { Pinecone } from '@pinecone-database/pinecone';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function checkIndexStatus() {
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || ''
    });

    // Get the index name from environment variables
    const indexName = process.env.PINECONE_INDEX_NAME;
    if (!indexName) {
      throw new Error('PINECONE_INDEX_NAME is not set in .env.local');
    }

    // List all indexes to check if our index exists
    const indexes = await pinecone.listIndexes();
    console.log('\nAll indexes:', indexes);

    // Check if our index exists
    const indexExists = indexes.indexes?.some(index => index.name === indexName);
    if (!indexExists) {
      console.log(`\nIndex '${indexName}' not found. It might still be creating...`);
      return;
    }

    // Get the specific index
    const index = pinecone.index(indexName);
    
    // Try to fetch a vector to see if the index is ready
    try {
      await index.fetch(['test-id']);
      console.log('\nIndex is ready to use!');
    } catch (error) {
      console.log('\nIndex exists but might not be ready yet. Please wait a few more minutes.');
    }
  } catch (error) {
    console.error('Error checking index status:', error);
    throw error;
  }
}

// Run the status check
checkIndexStatus(); 