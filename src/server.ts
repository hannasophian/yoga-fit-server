import express from "express";
import cors from "cors";
import { Client } from "pg";


const client = new Client({ database: 'yogadb' });

//TODO: this request for a connection will not necessarily complete before the first HTTP request is made!
client.connect();


const app = express();
// Connect to front-end
app.use(cors());

/**
 * Middleware to parse a JSON body in requests
 */
app.use(express.json());

//When this route is called, return the most recent 100 signatures in the db
app.get("/videos", async (req, res) => {
  const videos = await client.query('SELECT * FROM vids;'); //FIXME-TASK: get signatures from db!
  res.status(200).json({
    status: "success",
    data: {
      videos
    },
  });
});


//get random video when input level, duration, tag
app.get<{ level: number, duration: string, tag1: string, tag2:string, tag3:string }>("/getvideo/:level/:duration/:tag1/:tag2?/:tag3?/", async (req, res) => {
  try {
    const text =
      "SELECT * FROM vids JOIN vidtags ON vids.id = vidtags.id WHERE vidtags.tag = $3 AND vids.level <= $1 AND vids.duration <= $2 ORDER BY RANDOM() LIMIT 1;";

    const video = await client.query(text, [req.params.level, req.params.duration, req.params.tag1]);

    if (video.rowCount != 0) {
      res.status(200).json({
        status: "success",
        data: {
          video
        },
      });
    } else {
      res.status(404).json({
        status: "fail",
        data: {
          id: "Could not find a video with those arguments.",
        },
      });
    }
    
  } catch(err) {
    console.log(err)
  } 
})



export default app;
