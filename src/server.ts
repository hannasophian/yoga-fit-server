import express from "express";
import cors from "cors";
import getAllVideos from "./utils/getAllVideos";
import getVideos1 from "./utils/getVideos1";



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
  const videos = await getAllVideos();
  if (videos.rowCount != 0) {
    let rows = videos.rows;
    res.status(200).json({
      status: "success",
      data: {
        rows,
      },
    });
  } else {
    res.status(404).json({
      status: "Not found",
    });
  }
});

app.get<{
  level: number;
  duration: number;
  tag1: string;
  tag2: string;
}>("/getvideos/:level/:duration/:tag1/:tag2?", async (req, res) => {
  const level = req.params.level;
  const duration = req.params.duration;
  let tags = [req.params.tag1];
  tags = req.params.tag2 ? [...tags, req.params.tag2] : tags;
  
  let videoIDs: string[] = [];
  switch (tags.length) {
    case 1:
      videoIDs = await getVideos1(level, duration, tags);
      break;
    case 2:
      console.log(`There are two tags ${tags[0]} ${tags[1]}`);
  }
  if (videoIDs.length !== 0) {
    res.status(200).json({
      status: "success",
      data: { videoIDs },
    });
  } else {
    res.status(404).json({
      status: "not found",
    });
  }
});

//Should only work for one tag:
// app.get<{
//   level: number;
//   duration: number;
//   tag1: string;
// }>("/getvideos/:level/:duration/:tag1/", async (req, res) => {
//   const level = req.params.level;
//   const duration = req.params.duration;
//   const tags = [req.params.tag1];
//   let videoIDs = await getVideos1(level, duration, tags);
//   if (videoIDs.length !== 0) {
//     res.status(200).json({
//       status: "success",
//       data: { videoIDs },
//     });
//   } else {
//     res.status(404).json({
//       status: "not found",
//     });
//   }
// });


export default app;
