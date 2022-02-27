import express from "express";
import cors from "cors";
import getAllVideos from "./utils/getAllVideos";
import getVideos1 from "./utils/getVideos1";
import getVideos2 from "./utils/getVideos2";
import getVideos3 from "./utils/getVideos3";
import { toNamespacedPath } from "path/posix";
import userExistsByEmail from "./utils/userExistsByEmail";

const app = express();

/**
 * Middleware to parse a JSON body in requests
 */
app.use(express.json());

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:4000",
  "https://yoga-fit.netlify.app/",
];

/** To allow 'Cross-Origin Resource Sharing':*/
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);
//Gets the whole list of videos
app.get("/videos", async (req, res) => {
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
  tag3: string;
}>("/getvideos/:level/:duration/:tag1/:tag2?/:tag3?", async (req, res) => {
  const level = req.params.level;
  const duration = req.params.duration;
  let tags = [req.params.tag1];
  tags = req.params.tag2 ? [...tags, req.params.tag2] : tags;
  tags = req.params.tag3 ? [...tags, req.params.tag3] : tags;

  let videoIDs: string[] = [];
  switch (tags.length) {
    case 1:
      videoIDs = await getVideos1(level, duration, tags);
      break;
    case 2:
      videoIDs = await getVideos2(level, duration, tags);
      break;
    case 3:
      videoIDs = await getVideos3(level, duration, tags);
      break;
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

// When creating a new user:
// - Check that a user with the email doesn't already exist
// - Create user
app.post("/newuser", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await userExistsByEmail(email);

    if (userExists) {
      res.status(403).json({
        status: "Error",
        message: "User with that email already exists",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({
      status: "Error",
      message: "Something went wrong",
    });
  }
});

export default app;
