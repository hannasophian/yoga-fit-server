import { Client } from "pg";
import { config } from "dotenv";
import generateQuery from "./generateQuery";
// const client = new Client({ database: "yogadb" });
// client.connect();
config();

// { rejectUnauthorized: false } - when connecting to a heroku DB
const herokuSSLSetting = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
};
const localSetting = {
  connectionString: process.env.DATABASE_URL,
  ssl: false,
};
const dbConfig = process.env.LOCAL ? localSetting : herokuSSLSetting;
const client = new Client(dbConfig);

async function clientConnect() {
  await client.connect();
}
clientConnect();

export default async function userExistsByEmail(email: string) {
  let possibleUser = await client.query(
    "SELECT * FROM users WHERE email = $1;",
    [email]
  );
  if (possibleUser.rowCount === 0) {
    return false;
  } else {
    return true;
  }
}
