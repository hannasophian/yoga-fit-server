import { Client } from "pg";

import { config } from "dotenv";
// const client = new Client({ database: "yogadb" });
// client.connect();
config();

const herokuSSLSetting = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
};
const localSetting = {
  // database: "yogadb"
  connectionString: process.env.DATABASE_URL,
  ssl: false,
};
const dbConfig = process.env.LOCAL ? localSetting : herokuSSLSetting;
// console.log(process.env.LOCAL)
// // console.log(sslSetting)
// // const dbConfig = ;
const client = new Client(dbConfig);
async function clientConnect() {
  await client.connect();
}
clientConnect();

// console.log(process.env.DATABASE_URL)
export default async function getAllVideos() {
  const videos = await client.query("SELECT * FROM vids;");
  return videos;
}
