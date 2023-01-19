import Express from "express";
import { generateM3u } from "./m3u-gen";

const app = Express();

app.get("/playlist", (req, res, _next) => {
  const { username, password } = req.query;
  if (
    !username ||
    typeof username !== "string" ||
    !password ||
    typeof password !== "string"
  ) {
    res.status(400).send("Missing username or password");
    return;
  }

  const content = Array.from(generateM3u(username, password)).join("\n");
  res.set({
    "Content-Type": "application/octet-stream",
    "Content-Description": "File Transfer",
    "Cache-Control": "must-revalidate",
    "Content-Disposition": `attachment; filename="DikoPlus.m3u"`,
    Pragma: "public",
    Expires: "0",
  });

  res.send(content);
});

app.listen(3000, () => console.log("Started"));
