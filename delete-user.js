const sqlite3 = require('sqlite3').verbose();
const path = 'c:/Users/gihan/Desktop/PROJECTS/BUSINESS/Tution Project/New folder/tutionproject_backendv2/tuition_sir.db';
const db = new sqlite3.Database(path);
const email = 'geetharanjani1974.03.02@gmail.com';

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

(async () => {
  try {
    const user = (await all('SELECT id FROM users WHERE email = ?', [email]))[0];
    if (!user) {
      console.log(JSON.stringify({ deleted: false, reason: 'user not found' }, null, 2));
      db.close();
      return;
    }

    const id = user.id;
    await run('PRAGMA foreign_keys = ON');
    await run('BEGIN TRANSACTION');
    await run('DELETE FROM class_students WHERE usersId = ?', [id]);
    await run('DELETE FROM users WHERE id = ?', [id]);
    await run('COMMIT');

    const remaining = (await all('SELECT id FROM users WHERE email = ?', [email]))[0] || null;
    console.log(JSON.stringify({ deleted: true, remaining }, null, 2));
    db.close();
  } catch (err) {
    console.error(err);
    try {
      await run('ROLLBACK');
    } catch {}
    db.close();
    process.exit(1);
  }
})();
