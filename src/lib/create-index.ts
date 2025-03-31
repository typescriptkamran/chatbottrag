import { config } from 'dotenv';
import { resolve } from 'path';
import { Pinecone } from '@pinecone-database/pinecone';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function createIndex() {
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || ''
    });

    // Create a serverless index suitable for the Starter plan
    const indexName = 'rental-car-index-' + Date.now();
    
    // List existing indexes first
    const indexes = await pinecone.listIndexes();
    console.log('Current indexes:', indexes);

    // Create the index
    const index = await pinecone.createIndex({
      name: indexName,
      dimension: 384,
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1'
        }
      }
    });

    console.log(`Serverless index '${indexName}' creation initiated!`);
    console.log('Note: It may take a few minutes for the index to be ready.');

    // Update the .env.local file with the new index name
    // You'll need to manually update the PINECONE_INDEX_NAME in .env.local
    console.log(`\nIMPORTANT: Update your .env.local file with:`);
    console.log(`PINECONE_INDEX_NAME=${indexName}`);
  } catch (error) {
    console.error('Error creating index:', error);
    throw error;
  }
}

// Run the index creation
createIndex(); 