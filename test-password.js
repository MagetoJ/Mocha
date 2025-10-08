// Test password hashing to match the worker implementation
import crypto from 'crypto';

const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
};

async function testPasswords() {
  console.log('Testing password hashes:');
  console.log('Password: admin123');
  console.log('Hash:', await hashPassword('admin123'));
  console.log('\nPassword: manager123');
  console.log('Hash:', await hashPassword('manager123'));
  console.log('\nPassword: test123');
  console.log('Hash:', await hashPassword('test123'));
}

testPasswords();