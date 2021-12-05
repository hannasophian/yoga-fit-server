import { Client } from "pg";
const client = new Client({ database: 'yogadb' });
client.connect();

export default async function getAllVideos() {
    const videos = await client.query('SELECT * FROM vids;');
    return videos;

}
