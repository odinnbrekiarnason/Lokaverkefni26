import pgPromise from 'pg-promise';
import dotenv from 'dotenv';

dotenv.config();

const pgp = pgPromise({});
const portParsed = process.env.PGPORT ? parseInt(process.env.PGPORT) : 3000;

const db = process.env.DATABASE_URL ? pgp(process.env.DATABASE_URL) : pgp({
      host: process.env.PGHOST,
      port: portParsed,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
    });

db.connect().then((obj) => {
  console.log(`✅ Connected to PostgreSQL on database ${process.env.PGDATABASE}`); 
  obj.done();}).catch((error) => {console.error('❌ Database connection error:', error.message);});

export default db;
