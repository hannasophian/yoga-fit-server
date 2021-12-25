"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const pg_1 = require("pg");
const client = new pg_1.Client({ database: "yogadb" });
//TODO: this request for a connection will not necessarily complete before the first HTTP request is made!
client.connect();
const app = (0, express_1.default)();
// Connect to front-end
app.use((0, cors_1.default)());
/**
 * Middleware to parse a JSON body in requests
 */
app.use(express_1.default.json());
//When this route is called, return the most recent 100 signatures in the db
app.get("/videos", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const videos = yield client.query("SELECT * FROM vids;"); //FIXME-TASK: get signatures from db!
    res.status(200).json({
      status: "success",
      data: {
        videos,
      },
    });
  })
);
//get random video when input level, duration, tag
app.get("/getvideo/:level/:duration/:tag", (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const text =
        "SELECT * FROM vids JOIN vidtags ON vids.id = vidtags.id WHERE vidtags.tag = $3 AND vids.level <= $1 AND vids.duration <= $2 ORDER BY RANDOM() LIMIT 1;";
      const video = yield client.query(text, [
        req.params.level,
        req.params.duration,
        req.params.tag,
      ]);
      if (video.rowCount != 0) {
        res.status(200).json({
          status: "success",
          data: {
            video,
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
    } catch (err) {
      console.log(err);
    }
  })
);
exports.default = app;
