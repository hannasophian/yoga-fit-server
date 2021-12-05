import { Client } from "pg";
const client = new Client({ database: 'yogadb' });
client.connect();

// algorithm to get Videos when 1 tag is selected
export default async function getVideos1(level: number, duration: number, tags: string[]) {
  let remainingDuration = duration;
    try {
        // step 1
        const text = "SELECT * FROM vids join vidtags ON vids.id = vidtags.id WHERE tag = $3 AND duration <= $2 AND duration >= $2 *0.8 AND level = $1 ORDER BY RANDOM() LIMIT 1;"
        const video = await client.query(text, [level, duration, tags[0]]);
        if (video.rowCount != 0) {
            return [video];
         } else {
          // step 2
          const text = "SELECT * FROM vids join vidtags ON vids.id = vidtags.id WHERE tag = $3 AND duration <= $2 AND level = $1 ORDER BY DURATION DESC LIMIT 1;";
          const video = await client.query(text, [level, duration, tags[0]]);
          if (video.rowCount != 0) {
            if (remainingDuration >= 5) {
              const text2 = "SELECT * FROM vids join vidtags ON vids.id = vidtags.id WHERE tag = 'general' AND duration <=  AND duration >= 0 ORDER BY RANDOM() LIMIT 1;"
              const video2 = await client.query(text, [duration]);

            }
            return video;
          } else {
            // step 3
            const text = "SELECT * FROM vids join vidtags ON vids.id = vidtags.id WHERE tag = $3 AND duration <= $2 AND duration >= $2 *0.8 AND level = $1 - 1 ORDER BY RANDOM() LIMIT 1;"
            const video = await client.query(text, [level, duration, tags[0]]);
            if (video.rowCount != 0) {
              return video;
            } else {
              // step 4
              const text = "SELECT * FROM vids join vidtags ON vids.id = vidtags.id WHERE tag = $2 AND duration <= $1 ORDER BY DURATION DESC LIMIT 1;";
              const video = await client.query(text, [duration, tags[0]]);
              if (video.rowCount != 0) {
                return video;
              } else {
                // step 5
                const text = "SELECT * FROM vids JOIN vidtags ON vids.id = vidtags.id WHERE tag = 'general' AND duration <= $1 ORDER BY RANDOM() LIMIT 1;"
                const video = await client.query(text, [duration]);
                if (video.rowCount != 0) {
                  return video;
                } 
              }

            }
          }
        }
      } catch(err) {
        console.log(err)
      } 
}
