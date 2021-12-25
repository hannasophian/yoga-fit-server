import { Client } from "pg";
import { config } from "dotenv";
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
}
const dbConfig = process.env.LOCAL ? localSetting: herokuSSLSetting;
// console.log(process.env.LOCAL)
// // console.log(sslSetting)
// // const dbConfig = ;
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
      set REMAINING_DURATION = DURATION
      let SELECTED_VIDS be an empty array.
      WHILE REMAINING_DURATION is more than DURATION * 0.2 AND larger than 5:
        is there a video that has a duration < REMAINING_DURATION and tag = tag1?
          yes:
            add it to SELECTED VIDS
            minus duration of video from REMAINING_DURATION
          no:
            add general video with duration less than remaining_duration to selected_vids
            minus duration of video from REMAINING_DURAITON
      if REMAINING_DURATION >= 5:
        add general video with duration less than remaining_duration to selected_vids
        minus duration of video from REMAINING_DURAITON
    catch:
      return empty array
   */

  try {
    let remaining_duration = duration;
    // let selectedVideos: VideoItem[] = [];
    let selectedIDs: string[] = [];
    const text =
      "SELECT * FROM vids join vidtags ON vids.id = vidtags.id WHERE tag = $2 AND duration <= $1 ORDER BY RANDOM() LIMIT 1;";
    const generalText =
      "SELECT * FROM vids join vidtags ON vids.id = vidtags.id WHERE tag = 'general' AND duration <= $1 ORDER BY RANDOM() LIMIT 1;";

    while (remaining_duration > duration * 0.2 && remaining_duration > 5) {
      let possibleVideo = await client.query(text, [
        remaining_duration,
        tags[0],
      ]);
      // console.log(possibleVideo.rows)
      if (possibleVideo.rowCount !== 0) {
        // selectedVideos.push(possibleVideo.rows[0]);
        selectedIDs.push(possibleVideo.rows[0].youtube_id);
        remaining_duration -= possibleVideo.rows[0].duration;
      } else {
        possibleVideo = await client.query(generalText, [remaining_duration]);
        if (possibleVideo.rowCount !== 0) {
          // selectedVideos.push(possibleVideo.rows[0]);
          selectedIDs.push(possibleVideo.rows[0].youtube_id);
          remaining_duration -= possibleVideo.rows[0].duration;
        }
      }
    }
    if (remaining_duration >= 5) {
      let possibleVideo = await client.query(generalText, [remaining_duration]);
      if (possibleVideo.rowCount !== 0) {
        // selectedVideos.push(possibleVideo.rows[0]);
        selectedIDs.push(possibleVideo.rows[0].youtube_id);
        remaining_duration -= possibleVideo.rows[0].duration;
      }
    }

    return selectedIDs;
  } catch {
    return [];
  }
}
