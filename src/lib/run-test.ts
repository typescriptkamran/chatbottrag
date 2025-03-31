import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { testChat } from './test-chat';

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../../.env.local') });

// Run the test
testChat().catch(console.error); 