function getEnv(name) {
  let value = process.env[name] || '';

  if (!value) {
    for (const key of Object.keys(process.env)) {
      if (key.startsWith(name) && key.length > name.length) {
        value = key.slice(name.length).trim();
        break;
      }
      const match = key.match(new RegExp(name + '[\\s\\n]+(.+)'));
      if (match) {
        value = match[1].trim();
        break;
      }
    }
  }

  return value.trim().replace(/\n/g, '').replace(/^["']+|["']+$/g, '');
}

const MONGO_URI = getEnv('MONGO_URI');
const JWT_SECRET = getEnv('JWT_SECRET');

module.exports = { MONGO_URI, JWT_SECRET };
