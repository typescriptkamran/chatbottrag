import { Pinecone } from '@pinecone-database/pinecone';
import { carRentalData, companyInfo } from '../data/car-rental-qa';

// Define types for our metadata
interface QAMetadata {
  question: string;
  answer: string;
  type: 'qa';
}

interface CompanyInfoMetadata {
  text: string;
  type: 'company_info';
}

interface DocumentMetadata {
  text: string;
  type: 'document';
  timestamp?: string;
}

type Metadata = QAMetadata | CompanyInfoMetadata | DocumentMetadata;

interface PineconeMatch {
  id: string;
  score?: number;
  metadata?: Record<string, any>;
}

interface PineconeQueryResponse {
  matches: PineconeMatch[];
}

// Initialize Pinecone client and index
let pinecone: Pinecone | null = null;
let index: any = null;

function initializePineconeClient() {
  if (!process.env.PINECONE_API_KEY) {
    throw new Error('PINECONE_API_KEY environment variable is not set');
  }

  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });
  }

  if (!index) {
    index = pinecone.index(process.env.PINECONE_INDEX_NAME || '');
  }

  return { pinecone, index };
}

// Generate a deterministic mock embedding
function generateMockEmbedding(text: string): number[] {
  const embedding: number[] = [];
  const words = text.toLowerCase().split(/\s+/);
  
  // Create a simple hash of the text
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Generate deterministic but meaningful embeddings
  for (let i = 0; i < 384; i++) {
    // Use a combination of word presence and hash for more meaningful values
    const wordIndex = i % words.length;
    const wordHash = words[wordIndex]?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
    const value = ((hash + wordHash) % 100) / 100; // Normalize to [0, 1]
    embedding.push(value);
  }
  
  return embedding;
}

// Initialize the vector store with car rental data
export async function initializeVectorStore() {
  try {
    const { index } = initializePineconeClient();

    // Add company info
    const companyText = `${companyInfo.name}\n${companyInfo.description}\nServices: ${companyInfo.services.join(", ")}\nContact: ${companyInfo.contact.phone} | ${companyInfo.contact.email} | ${companyInfo.contact.address}`;
    await index.upsert([{
      id: 'company_info',
      values: generateMockEmbedding(companyText),
      metadata: {
        text: companyText,
        type: 'company_info'
      } as CompanyInfoMetadata
    }]);

    // Add Q&A data
    const qaVectors = carRentalData.map((qa, index) => ({
      id: `qa_${index}`,
      values: generateMockEmbedding(`${qa.question}\n${qa.answer}`),
      metadata: {
        question: qa.question,
        answer: qa.answer,
        type: 'qa'
      } as QAMetadata
    }));

    await index.upsert(qaVectors);
    console.log('Vector store initialized with sample data');
  } catch (error) {
    console.error('Error initializing vector store:', error);
    throw error;
  }
}

// Define the return type for queryVectorStore
type VectorStoreMatch = {
  text: string;
  score: number;
  type: 'qa' | 'company_info' | 'document';
};

// Query the vector store
export async function queryVectorStore(
  query: string,
  topK: number = 3
): Promise<VectorStoreMatch[]> {
  try {
    const { index } = initializePineconeClient();
    const queryEmbedding = generateMockEmbedding(query);
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true
    }) as PineconeQueryResponse;

    // Process and sort matches by relevance
    const matches = queryResponse.matches
      .map((match: PineconeMatch): VectorStoreMatch | null => {
        if (!match.metadata) return null;

        // First cast to unknown, then to our Metadata type
        const metadata = match.metadata as unknown as Metadata;
        let text = '';
        let score = match.score || 0;

        try {
          switch (metadata.type) {
            case 'qa':
              const qaData = metadata as QAMetadata;
              text = qaData.answer;
              if (qaData.question.toLowerCase().includes(query.toLowerCase())) {
                score = Math.min(1, score + 0.2);
              }
              break;
            case 'company_info':
              const companyData = metadata as CompanyInfoMetadata;
              text = companyData.text;
              break;
            case 'document':
              const docData = metadata as DocumentMetadata;
              text = docData.text;
              break;
            default:
              return null;
          }

          // Clean up the text
          text = text
            .replace(/[0-9]{6,}/g, '') // Remove long number sequences
            .replace(/^\s+|\s+$/g, '') // Trim whitespace
            .replace(/\s+/g, ' ') // Normalize spaces
            .replace(/[^\x20-\x7E]/g, '') // Remove non-printable characters
            .replace(/[^\w\s.,!?-]/g, '') // Keep only basic punctuation and alphanumeric
            .replace(/\s+/g, ' ') // Normalize spaces again
            .trim();

          // Only return matches with valid text
          if (!text || text.length === 0) {
            return null;
          }

          // Boost score for exact matches
          const queryTerms = query.toLowerCase().split(' ');
          const textLower = text.toLowerCase();
          const termMatches = queryTerms.filter(term => textLower.includes(term)).length;
          score = Math.min(1, score + (termMatches * 0.1));

          return {
            text,
            score,
            type: metadata.type
          };
        } catch (error) {
          console.error('Error processing match:', error);
          return null;
        }
      })
      .filter((match): match is VectorStoreMatch => match !== null);

    // Sort by score and filter out low-confidence matches
    return matches
      .filter(match => match.score > 0.5)
      .sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Error querying vector store:', error);
    throw error;
  }
}

// Add new documents to the vector store
export async function addDocument(text: string, metadata: Record<string, any> = {}) {
  try {
    const { index } = initializePineconeClient();
    const id = `doc_${Date.now()}`;
    await index.upsert([{
      id,
      values: generateMockEmbedding(text),
      metadata: {
        text,
        type: 'document',
        ...metadata
      } as DocumentMetadata
    }]);
    return id;
  } catch (error) {
    console.error('Error adding document to vector store:', error);
    throw error;
  }
} 