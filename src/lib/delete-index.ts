import { config } from 'dotenv';
import { resolve } from 'path';
import { Pinecone } from '@pinecone-database/pinecone';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function deleteIndex(indexName: string) {
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || '',
      environment: process.env.PINECONE_ENVIRONMENT || ''
    });

    // Delete the index
    await pinecone.deleteIndex(indexName);
    console.log(`Index '${indexName}' deleted successfully!`);
  } catch (error) {
    console.error('Error deleting index:', error);
    throw error;
  }
}

// Get index name from command line argument
const indexName = process.argv[2];
if (!indexName) {
  console.error('Please provide an index name as an argument');
  process.exit(1);
}

// Run the index deletion
deleteIndex(indexName); 