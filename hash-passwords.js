// hash-passwords.js
import { hash } from 'bcryptjs';

async function generateHashes() {
  const saltRounds = 10;

  const adminPass = await hash('admin123', saltRounds);
  const managerPass = await hash('manager123', saltRounds);
  const waiterPass = await hash('test123', saltRounds);
  const receptionistPass = await hash('reception123', saltRounds);
  const chefPass = await hash('chef123', saltRounds);

  console.log('--- Copy these hashes into your migrations/5.sql file ---');
  console.log(`\n-- admin123\n'${adminPass}'`);
  console.log(`\n-- manager123\n'${managerPass}'`);
  console.log(`\n-- test123\n'${waiterPass}'`);
  console.log(`\n-- reception123\n'${receptionistPass}'`);
  console.log(`\n-- chef123\n'${chefPass}'`);
}

generateHashes();