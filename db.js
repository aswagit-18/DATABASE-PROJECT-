import pg from "pg";
const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "hostel_db",
  password: "5841",
  port: 5432,
});
export default pool;
