import express from "express";
import cors from "cors";
import { Client } from "pg";


//This line will read in any MY_KEY=myValue pairs in your .env file and
// make them available as environment variables as properties of process.env
// Example: if the file has
// MY_KEY=myValue
// we'd be able to access process.env.MY_KEY
// Specifically, you should provide a DB connection string as DATABASE_URL in .env
require("dotenv").config();

if (!process.env.DATABASE_URL) {
  throw "No DATABASE_URL env var!  Have you made a .env file?  And set up dotenv?";
}

// To connect to a heroku db you need to specify an object value for the ssl option
  // (however, if you want to connect to a local db you should set this property to false).
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

async function connectToDb() {

  await client.connect();

  // //Change the table name to match one in your heroku database!
  // const result = await client.query("SELECT *  FROM vids;");
  // for (let row of result.rows) {
  //   console.log(row);
  // }
}

connectToDb();



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
app.get<{ level: number, duration: string, tag: string }>("/getvideo/:level/:duration/:tag", async (req, res) => {
  try {
    const text =
      "SELECT * FROM vids JOIN vidtags ON vids.id = vidtags.id WHERE vidtags.tag = $3 AND vids.level <= $1 AND vids.duration <= $2 ORDER BY RANDOM() LIMIT 1;";

    const video = await client.query(text, [req.params.level, req.params.duration, req.params.tag]);

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

// client.end();


export default app;
