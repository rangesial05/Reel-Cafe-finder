import fs from 'fs';

const raw = fs.readFileSync('C:/Users/Soura Kanti Haldar/.gemini/antigravity/brain/62725e3c-949a-4359-828d-87f0d0b294cd/.system_generated/steps/261/output.txt', 'utf8');
const jsonStart = raw.indexOf('{"id":');
const data = JSON.parse(raw.substring(jsonStart).trim());

console.log('Total comments in full dump:', data.comments?.length);
const authorComments = data.comments?.filter(c => c.author === 'ahana__ray_' || c.author.includes('ahana') || c.text.toLowerCase().includes('location') || c.text.toLowerCase().includes('cove') || c.text.toLowerCase().includes('diora'));
console.log('Author or location comments:');
authorComments.forEach(c => console.log(`[${c.author}]: ${c.text}`));
