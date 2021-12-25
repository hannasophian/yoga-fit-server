import express from "express";
import cors from "cors";
import getAllVideos from "./utils/getAllVideos";
import getVideos1 from "./utils/getVideos1";
// import { Client } from "pg";
// const client = new Client({ database: 'yogadb' });
// client.connect();


const app = express();
// Connect to front-end
app.use(cors());

/**
 * Middleware to parse a JSON body in requests
 */
app.use(express.json());

//Gets the whole list of videos
app.get("/videos", async (req, res) => {
  // const videos = await client.query('SELECT * FROM vids;'); //FIXME-TASK: get signatures from db!
  const videos = await getAllVideos()
  if (videos.rowCount != 0) {
    let rows = videos.rows;
    res.status(200).json({
      status: "success",
      data: {
        rows
      },
    });
  } else {
    res.status(404).json({
      status: "Not found",
    })
  }
});


//get random video when input level, duration, tag
app.get<{ level: number, duration: number, tag1: string, tag2:string, tag3:string }>("/getvideos/:level/:duration/:tag1/:tag2?/:tag3?/", async (req, res) => {
  const level = req.params.level;
  const duration = req.params.duration;
  const tag1 = req.params.tag1;
  const tag2 = req.params.tag2;
  const tag3 = req.params.tag3; 
  if (tag1 && !tag2) {
    console.log("only one tag")
    let videos = await getVideos1(level, duration, [tag1]);
    if(videos) {
      res.status(200).json({
        status: "success",
        data: {
          videos
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
    }
    else {
      res.status(404).json({
        status: "fail",
        data: {
          id: "Could not find a video with those arguments.",
        },
      });
    }
})



export default app;
