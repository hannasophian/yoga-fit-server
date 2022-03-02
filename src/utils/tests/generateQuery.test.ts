// const generateQuery = require('./generateQuery.ts');
import generateQuery from "../video_functions/generateQuery";

test("Creates correct query when given appropriate arguments", () => {
  expect(generateQuery("vinyasa", 45, ["-JuN7kZbbvg", "xudX1K4i4m0"])).toBe(
    "SELECT * FROM vids join vidtags ON vids.id = vidtags.id WHERE tag = 'vinyasa' AND duration <= 45 AND vids.youtube_id != '-JuN7kZbbvg' AND vids.youtube_id != 'xudX1K4i4m0' ORDER BY RANDOM() LIMIT 1;"
  );
});

test("Creates correct query when given no existingIDS", () => {
  expect(generateQuery("vinyasa", 45, [])).toBe(
    "SELECT * FROM vids join vidtags ON vids.id = vidtags.id WHERE tag = 'vinyasa' AND duration <= 45 ORDER BY RANDOM() LIMIT 1;"
  );
});
