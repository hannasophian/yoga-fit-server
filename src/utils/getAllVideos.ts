import { Client } from "pg";
const herokuSSLSetting = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
};
const localSetting = {
  database: "yogadb"
}
const dbConfig = process.env.LOCAL ? herokuSSLSetting: localSetting;
// console.log(process.env.LOCAL)
// // console.log(sslSetting)
// // const dbConfig = ;
const client = new Client(dbConfig);

export default async function getAllVideos() {
  const videos = await client.query("SELECT * FROM vids;");
  return videos;
}
