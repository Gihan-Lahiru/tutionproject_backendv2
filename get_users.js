const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function verifyCounts() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log('--- classes and their students ---');
  const [classes] = await connection.execute("SELECT id, name, location FROM classes");
  for (const c of classes) {
    const [students] = await connection.execute(
      "SELECT users.id, users.name FROM users JOIN class_students ON users.id = class_students.usersId WHERE class_students.classesId = ?",
      [c.id]
    );
    console.log(`Class: ${c.name} (${c.location}) - Enrolled:`, students.map(s => s.name));
  }

  await connection.end();
}

verifyCounts().catch(console.error);
