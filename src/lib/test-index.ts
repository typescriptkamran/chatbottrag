import { config } from 'dotenv';
import { resolve } from 'path';
import { Pinecone } from '@pinecone-database/pinecone';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

async function testIndex() {
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || ''
    });

    // Get the index name from environment variables
    const indexName = process.env.PINECONE_INDEX_NAME;
    if (!indexName) {
      throw new Error('PINECONE_INDEX_NAME is not set in .env.local');
    }

    // Get the index
    const index = pinecone.index(indexName);

    // Create some test vectors
    const testVectors = [
      {
        id: 'car1',
        values: Array(384).fill(0.1), // Simple test vector
        metadata: {
          type: 'car',
          brand: 'Toyota',
          model: 'Camry',
          year: 2020
        }
      },
      {
        id: 'car2',
        values: Array(384).fill(0.2), // Different test vector
        metadata: {
          type: 'car',
          brand: 'Honda',
          model: 'Civic',
          year: 2021
        }
      }
    ];

    console.log('Uploading test vectors...');
    await index.upsert(testVectors);
    console.log('Test vectors uploaded successfully!');

    // Query the index
    console.log('\nQuerying the index...');
    const queryResult = await index.query({
      vector: Array(384).fill(0.15), // Query vector between the two test vectors
      topK: 2,
      includeMetadata: true
    });

    console.log('\nQuery results:', queryResult);

  } catch (error) {
    console.error('Error testing index:', error);
    throw error;
  }
}

// Run the test
testIndex(); 