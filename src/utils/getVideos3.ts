// Alg to return array of video ID(s) when given two tags and a total duration

import { Client } from "pg";
import { config } from "dotenv";
import VideoItem from "./VideoItem";
// const client = new Client({ database: "yogadb" });
// client.connect();
config();

// // { rejectUnauthorized: false } - when connecting to a heroku DB
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

export default async function getVideos3(
  level: number,
  duration: number,
  tags: string[]
) {
  /**
     * PSEUDOCODE
     Set remainingDuration to be the duration
     Set selectedVids to be an empty array
     Set selectedIDs to be an empty array
    
     --- INITIAL ---
     Choose random tag1 and find video for it that is less than 0.4 of the total duration
     Add it to selectedIDs (and selectedVids)
     Minus the duration from remainingDuration

     Choose random tag2 and find video for it that is less than 0.5 of the remaining duration
     Add it to selectedIDs (and selectedVids)
     Minus the duration from 
     
     get random tag3 and find video for it that is less thanthe remaining duration
     Add it to selectedIDs (and selectedVids)
     Minus the duration from remainingDuration


     --- EXTRA ---
     while the remainingDuration < duration * 0.2 AND the remainingDuration >= 5:
        choose random tag and get random video shorter than remaining duration
        if unavailable, get general tag
        Add it to selectedIDs and selectedVids
        Minus the duration from remainingDuration
    
     if the remainingDuration is >= 5:
        add general video shorter than remaining duration
    
    END

     */
  // console.log("This is the function for two tags");

  try {
    let remainingDuration = duration;
    // let selectedVideos: VideoItem[] = [];
    let selectedIDs: string[] = [];
    const text =
      "SELECT * FROM vids join vidtags ON vids.id = vidtags.id WHERE tag = $2 AND duration <= $1 ORDER BY RANDOM() LIMIT 1;";
    const generalText =
      "SELECT * FROM vids join vidtags ON vids.id = vidtags.id WHERE tag = 'general' AND duration <= $1 ORDER BY RANDOM() LIMIT 1;";

    /** INITIAL */
    function shuffleArray(array: number[]) {
      for (let i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
      return array;
    }

    let arr = [0, 1, 2];
    shuffleArray(arr);

    const firstDuration = Math.floor(remainingDuration * 0.4);
    let possibleVideo = await client.query(text, [firstDuration, tags[arr[0]]]);
    if (possibleVideo.rowCount !== 0) {
      // selectedVideos.push(possibleVideo.rows[0]);
      selectedIDs.push(possibleVideo.rows[0].youtube_id);
      remainingDuration -= possibleVideo.rows[0].duration;
    }

    const secondDuration = Math.floor(remainingDuration * 0.5);
    possibleVideo = await client.query(text, [secondDuration, tags[arr[1]]]);
    if (possibleVideo.rowCount !== 0) {
      // selectedVideos.push(possibleVideo.rows[0]);
      selectedIDs.push(possibleVideo.rows[0].youtube_id);
      remainingDuration -= possibleVideo.rows[0].duration;
    }

    possibleVideo = await client.query(text, [remainingDuration, tags[arr[2]]]);
    if (possibleVideo.rowCount !== 0) {
      // selectedVideos.push(possibleVideo.rows[0]);
      selectedIDs.push(possibleVideo.rows[0].youtube_id);
      remainingDuration -= possibleVideo.rows[0].duration;
    }

    /**EXTRA */
    while (remainingDuration > duration * 0.2 && remainingDuration >= 5) {
      possibleVideo = await client.query(text, [
        remainingDuration,
        tags[Math.floor(Math.random() * 3)],
      ]);
      if (possibleVideo.rowCount !== 0) {
        // selectedVideos.push(possibleVideo.rows[0]);
        selectedIDs.push(possibleVideo.rows[0].youtube_id);
        remainingDuration -= possibleVideo.rows[0].duration;
      } else {
        possibleVideo = await client.query(generalText, [remainingDuration]);
        if (possibleVideo.rowCount !== 0) {
          // selectedVideos.push(possibleVideo.rows[0]);
          selectedIDs.push(possibleVideo.rows[0].youtube_id);
          remainingDuration -= possibleVideo.rows[0].duration;
        }
      }
    }

    if (remainingDuration >= 5) {
      let possibleVideo = await client.query(generalText, [remainingDuration]);
      if (possibleVideo.rowCount !== 0) {
        // selectedVideos.push(possibleVideo.rows[0]);
        selectedIDs.push(possibleVideo.rows[0].youtube_id);
        remainingDuration -= possibleVideo.rows[0].duration;
      }
    }

    // console.log(selectedVideos)
    // console.log(selectedIDs)

    return selectedIDs;
  } catch {
    console.log("This isn't working");
    return [];
  }
}
