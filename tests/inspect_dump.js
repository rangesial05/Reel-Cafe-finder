import fs from 'fs';

const raw = fs.readFileSync('C:/Users/Soura Kanti Haldar/.gemini/antigravity/brain/62725e3c-949a-4359-828d-87f0d0b294cd/.system_generated/steps/261/output.txt', 'utf8');

// Find json
const jsonStart = raw.indexOf('{"id":');
if (jsonStart !== -1) {
  const data = JSON.parse(raw.substring(jsonStart).trim());
  console.log('ID:', data.id);
  console.log('Uploader:', data.uploader, `(@${data.channel})`);
  console.log('Description:', data.description);
  console.log('Total comments in dump:', data.comments?.length);
  console.log('Direct video stream URL available?:', Boolean(data.url));

  // Let's print the first 20 comments
  if (data.comments) {
    console.log('\n--- Comments list ---');
    data.comments.forEach((c, i) => {
      console.log(`${i + 1}. [${c.author}]: ${c.text}`);
    });
  }
}
