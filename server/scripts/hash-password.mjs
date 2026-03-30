/**
 * Generate ADMIN_PASSWORD_HASH for .env
 * Usage: node server/scripts/hash-password.mjs "your-secret-password"
 */
import bcrypt from 'bcryptjs';

const pwd = process.argv[2];
if (!pwd) {
  console.error('Usage: node server/scripts/hash-password.mjs "<password>"');
  process.exit(1);
}

const hash = await bcrypt.hash(pwd, 10);
console.log('Add to .env:\nADMIN_PASSWORD_HASH=' + hash);
