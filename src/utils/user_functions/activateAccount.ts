import { Client } from "pg";
import { config } from "dotenv";
import UserInterface from "../interface/UserInterface";
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

export default async function activateAccount(
  id: number
): Promise<UserInterface[]> {
  try {
    const dbRes = await client.query(
      "UPDATE users SET active = TRUE WHERE id = $1 RETURNING id, name, email, active;",
      [id]
    );
    return dbRes.rows;
  } catch (err) {
    console.error(err);
    return [];
  }
}
