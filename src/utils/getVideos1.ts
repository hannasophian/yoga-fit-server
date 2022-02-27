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

// algorithm to get Videos when 1 tag is selected
export default async function getVideos1(
  level: number,
  duration: number,
  tags: string[]
) {
  /**
   * PSEUDOCODE
    try: 
      set REMAININGDURATION = DURATION
      let SELECTED_VIDS be an empty array.
      WHILE REMAININGDURATION is more than DURATION * 0.2 AND larger than 5:
        is there a video that has a duration < REMAININGDURATION and tag = tag1?
          yes:
            add it to SELECTED VIDS
            minus duration of video from REMAININGDURATION
          no:
            add general video with duration less than remainingDuration to selected_vids
            minus duration of video from REMAINING_DURAITON
      if REMAININGDURATION >= 5:
        add general video with duration less than remainingDuration to selected_vids
        minus duration of video from REMAINING_DURAITON
    catch:
      return empty array
   */

  try {
    let remainingDuration = duration;
    let selectedIDs: string[] = [];
    while (remainingDuration > duration * 0.2 && remainingDuration > 5) {
      let possibleVideo = await client.query(
        generateQuery(tags[0], remainingDuration, selectedIDs)
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
    return [];
  }
}
