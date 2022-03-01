import { Client } from "pg";
import { config } from "dotenv";
import UserInterface from "../interface/UserInterface";
// import UserInterface from "./UserInterface";
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
// Returns user id, name, email, active IF passwords match
export default async function signIn(
  email: string,
  password: string
): Promise<UserInterface[]> {
  try {
    const dbRes = await client.query("SELECT * from USERS WHERE email = $1;", [
      email,
    ]);
    const userData: FullUserInterface = dbRes.rows[0];
    if (userData.password_encrypt === password) {
      return [
        {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          active: userData.active,
        },
      ];
    } else {
      return [];
    }
  } catch (err) {
    console.error(err);
    return [];
  }
}

interface FullUserInterface {
  id: number;
  name: string;
  email: string;
  active: boolean;
  password_encrypt: string;
}
