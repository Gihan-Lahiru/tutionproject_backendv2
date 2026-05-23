const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'tuition_sir.db');
const db = new sqlite3.Database(dbPath);

const emailsToDelete = [
  'test@example.com',
  'student1@example.com',
  'student2@example.com',
  'student3@example.com',
  'stu1@example.com',
  'stu2@example.com',
  'stu3@example.com',
  'realdata.g6.student@example.com',
  'realdata.g8.seed@example.com',
  'another-test@example.com',
  'verify-fix@example.com'
];

db.serialize(() => {
  const placeholders = emailsToDelete.map(() => '?').join(',');
  
  // First get IDs of users to delete to delete their relations if necessary
  db.all(`SELECT id FROM users WHERE email IN (${placeholders})`, emailsToDelete, (err, rows) => {
    if (err) {
      console.error('Error fetching users:', err);
      return;
    }
    
    const userIds = rows.map(r => r.id);
    if (userIds.length === 0) {
      console.log('No users found to delete.');
      db.close();
      return;
    }

    console.log(`Found ${userIds.length} users to delete. IDs:`, userIds);

    const idPlaceholders = userIds.map(() => '?').join(',');

    // Delete from class_students
    db.run(`DELETE FROM class_students WHERE usersId IN (${idPlaceholders})`, userIds, function(err) {
      if (err) console.error('Error deleting class_students:', err);
      else console.log(`Deleted ${this.changes} class_students relations.`);
      
      // Delete from users
      db.run(`DELETE FROM users WHERE id IN (${idPlaceholders})`, userIds, function(err) {
        if (err) console.error('Error deleting users:', err);
        else console.log(`Deleted ${this.changes} users.`);
        
        db.close();
      });
    });
  });
});
