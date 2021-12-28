export default function generateQuery(tag: string, maxDuration: number, existingIDs: string[]) {
    let queryText = `SELECT * FROM vids join vidtags ON vids.id = vidtags.id WHERE tag = '${tag}' AND duration <= ${maxDuration}`;
    for (let id of existingIDs) {
        queryText += ` AND vids.youtube_id != '${id}'`
    }
    queryText += " ORDER BY RANDOM() LIMIT 1;";
    console.log(queryText);
    return queryText;
}