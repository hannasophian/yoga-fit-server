import express from "express";
import cors from "cors";
import getAllVideos from "./utils/getAllVideos";
import getVideos1 from "./utils/getVideos1";
// import { Client } from "pg";
// const client = new Client({ database: 'yogadb' });
// client.connect();
// import { Client } from "pg";

//This line will read in any MY_KEY=myValue pairs in your .env file and
// make them available as environment variables as properties of process.env
// Example: if the file has
// MY_KEY=myValue
// we'd be able to access process.env.MY_KEY
// Specifically, you should provide a DB connection string as DATABASE_URL in .env
// require("dotenv").config();

// if (!process.env.DATABASE_URL) {
//   throw "No DATABASE_URL env var!  Have you made a .env file?  And set up dotenv?";
// }

// To connect to a heroku db you need to specify an object value for the ssl option
// (however, if you want to connect to a local db you should set this property to false).
// const client = new Client({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });

// async function connectToDb() {

//   await client.connect();

//   // //Change the table name to match one in your heroku database!
//   // const result = await client.query("SELECT *  FROM vids;");
//   // for (let row of result.rows) {
//   //   console.log(row);
//   // }
// }

// connectToDb();

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

//Should only work for one tag:
app.get<{
  level: number;
  duration: number;
  tag1: string;
}>("/getvideos/:level/:duration/:tag1/", async (req, res) => {
  const level = req.params.level;
  const duration = req.params.duration;
  const tags = [req.params.tag1];
  let videoIDs = await getVideos1(level, duration, tags);
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

// client.end();

//get random video when input level, duration, tag
// app.get<{
//   level: number;
//   duration: number;
//   tag1: string;
//   tag2: string;
//   tag3: string;
// }>("/getvideos/:level/:duration/:tag1/:tag2?/:tag3?/", async (req, res) => {
//   const level = req.params.level;
//   const duration = req.params.duration;
//   const tag1 = req.params.tag1;
//   const tag2 = req.params.tag2;
//   const tag3 = req.params.tag3;
//   if (tag1 && !tag2) {
//     console.log("only one tag");
//     let videos = await getVideos1(level, duration, [tag1]);
//     if (videos) {
//       res.status(200).json({
//         status: "success",
//         data: {
//           videos,
//         },
//       });
//     } else {
//       res.status(404).json({
//         status: "fail",
//         data: {
//           id: "Could not find a video with those arguments.",
//         },
//       });
//     }
//   } else {
//     res.status(404).json({
//       status: "fail",
//       data: {
//         id: "Could not find a video with those arguments.",
//       },
//     });
//   }
// });

export default app;
