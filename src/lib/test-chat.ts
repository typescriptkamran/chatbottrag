import { generateResponse } from './rag-utils';

export async function testChat() {
  const testQueries = [
    "What types of vehicles do you offer?",
    "What are your rental rates?",
    "Where are you located?",
    "What insurance options do you provide?",
    "Hello, how can you help me?"
  ];

  console.log('Starting chat tests...\n');

  for (const query of testQueries) {
    try {
      console.log(`Query: "${query}"`);
      const response = await generateResponse(query, '');
      console.log(`Response: "${response}"\n`);
    } catch (error) {
      console.error(`Error testing query "${query}":`, error);
    }
  }
}

if (require.main === module) {
  testChat().catch(console.error);
} 