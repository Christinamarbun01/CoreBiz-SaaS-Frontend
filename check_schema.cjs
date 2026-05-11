const https = require('https');

const options = {
  hostname: 'fessujdyhofjplyfeybu.supabase.co',
  port: 443,
  path: '/rest/v1/',
  method: 'GET',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlc3N1amR5aG9manBseWZleWJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODIzMzE5NywiZXhwIjoyMDkzODA5MTk3fQ.OCbcmdd-60TpRo9kdcGfRkoTyQNnW7-ckvCHCuw7u5U'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Tables found:');
      if (json.definitions) {
        Object.keys(json.definitions).forEach(key => {
          console.log('- ' + key);
        });
      } else {
        console.log('No definitions found.');
        console.log(data.slice(0, 500));
      }
    } catch (e) {
      console.log('Error parsing JSON:', e.message);
      console.log(data.slice(0, 500));
    }
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.end();
