"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const pg_1 = require("pg");
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
const client = new pg_1.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});
function connectToDb() {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.connect();
        // //Change the table name to match one in your heroku database!
        // const result = await client.query("SELECT *  FROM vids;");
        // for (let row of result.rows) {
        //   console.log(row);
        // }
    });
}
connectToDb();
const app = (0, express_1.default)();
// Connect to front-end
app.use((0, cors_1.default)());
/**
 * Middleware to parse a JSON body in requests
 */
app.use(express_1.default.json());
//When this route is called, return the most recent 100 signatures in the db
app.get("/videos", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const videos = yield client.query('SELECT * FROM vids;'); //FIXME-TASK: get signatures from db!
    res.status(200).json({
        status: "success",
        data: {
            videos
        },
    });
}));
//get random video when input level, duration, tag
app.get("/getvideo/:level/:duration/:tag", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const text = "SELECT * FROM vids JOIN vidtags ON vids.id = vidtags.id WHERE vidtags.tag = $3 AND vids.level <= $1 AND vids.duration <= $2 ORDER BY RANDOM() LIMIT 1;";
        const video = yield client.query(text, [req.params.level, req.params.duration, req.params.tag]);
        if (video.rowCount != 0) {
            res.status(200).json({
                status: "success",
                data: {
                    video
                },
            });
        }
        else {
            res.status(404).json({
                status: "fail",
                data: {
                    id: "Could not find a video with those arguments.",
                },
            });
        }
    }
    catch (err) {
        console.log(err);
    }
}));
// client.end();
exports.default = app;
