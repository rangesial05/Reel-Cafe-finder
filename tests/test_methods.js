import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: 'test-key' });
console.log('models:', Object.getOwnPropertyNames(Object.getPrototypeOf(ai.models)));
console.log('files:', Object.getOwnPropertyNames(Object.getPrototypeOf(ai.files)));
