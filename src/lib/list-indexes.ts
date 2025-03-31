import { config } from 'dotenv';
import { resolve } from 'path';
import { Pinecone } from '@pinecone-database/pinecone';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function listIndexes() {
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || '',
      environment: process.env.PINECONE_ENVIRONMENT || ''
    });

    // List all indexes
    const indexes = await pinecone.listIndexes();
    
    console.log('Existing indexes:');
    indexes.forEach(index => {
      console.log(`- ${index.name}`);
    });
  } catch (error) {
    console.error('Error listing indexes:', error);
    throw error;
  }
}

// Run the index listing
listIndexes(); 