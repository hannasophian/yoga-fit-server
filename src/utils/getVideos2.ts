// Alg to return array of video ID(s) when given two tags and a total duration

import { Client } from "pg";
import { config } from "dotenv";
import VideoItem from "./VideoItem";
import generateQuery from "./generateQuery";

config();
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

export default async function getVideos2(
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
     Choose a random tag and find a video for it that is less than 2/3 of the total duration
     Add it to selectedIDs (and selectedVids)
     Minus the duration from remainingDuration

     Get other tag and find a video that is less than the remainingDuration
     Add it to selectedIDs and selectedVids
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
    let selectedIDs: string[] = [];

    /** INITIAL */
    const num1 = Math.floor(Math.random() * 2);
    const num2 = num1 === 1 ? 0 : 1;

    const twoThirdsDuration = Math.floor(remainingDuration * 0.667);
    let possibleVideo = await client.query(
      generateQuery(tags[num1], twoThirdsDuration, selectedIDs)
    );
    if (possibleVideo.rowCount !== 0) {
      selectedIDs.push(possibleVideo.rows[0].youtube_id);
      remainingDuration -= possibleVideo.rows[0].duration;
    }

    possibleVideo = await client.query(
      generateQuery(tags[num2], remainingDuration, selectedIDs)
    );
    if (possibleVideo.rowCount !== 0) {
      selectedIDs.push(possibleVideo.rows[0].youtube_id);
      remainingDuration -= possibleVideo.rows[0].duration;
    }

    /**EXTRA */
    while (remainingDuration > duration * 0.2 && remainingDuration >= 5) {
      possibleVideo = await client.query(
        generateQuery(
          tags[Math.floor(Math.random() * 2)],
          remainingDuration,
          selectedIDs
        )
      );
      if (possibleVideo.rowCount !== 0) {
        selectedIDs.push(possibleVideo.rows[0].youtube_id);
        remainingDuration -= possibleVideo.rows[0].duration;
      } else {
        possibleVideo = await client.query(
          generateQuery("general", remainingDuration, selectedIDs)
        );
        if (possibleVideo.rowCount !== 0) {
          selectedIDs.push(possibleVideo.rows[0].youtube_id);
          remainingDuration -= possibleVideo.rows[0].duration;
        }
      }
    }

    if (remainingDuration >= 5) {
      let possibleVideo = await client.query(
        generateQuery("general", remainingDuration, selectedIDs)
      );
      if (possibleVideo.rowCount !== 0) {
        selectedIDs.push(possibleVideo.rows[0].youtube_id);
        remainingDuration -= possibleVideo.rows[0].duration;
      }
    }

    return selectedIDs;
  } catch {
    console.log("This isn't working");
    return [];
  }
}
