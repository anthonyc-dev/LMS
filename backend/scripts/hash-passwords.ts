import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: ['src/modules/**/*.entity.ts'],
  ssl: false,
});

async function hashPasswords() {
  await AppDataSource.initialize();
  console.log('Connected to database');

  const queryRunner = AppDataSource.createQueryRunner();

  const users = await queryRunner.query('SELECT id, password FROM "user"');
  console.log(`Found ${users.length} users`);

  let updatedCount = 0;

  for (const user of users) {
    const pw = user.password;
    if (pw && (pw.startsWith('$2b$') || pw.startsWith('$2a$') || pw.startsWith('$2y$'))) {
      console.log(`Skipping user ${user.id} — password already hashed`);
      continue;
    }

    const hashed = await bcrypt.hash(pw, 10);
    await queryRunner.query('UPDATE "user" SET password = $1 WHERE id = $2', [hashed, user.id]);
    console.log(`Hashed password for user ${user.id}`);
    updatedCount++;
  }

  console.log(`Done. Updated ${updatedCount} users.`);
  await queryRunner.release();
  await AppDataSource.destroy();
}

hashPasswords().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
