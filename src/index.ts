import Express from "express";
import { SERVICE_GENERATORS } from "./services";
import { UserException } from "./user-exception";

const app = Express();

app.get("/", (_, res) => {
  res.redirect("https://dikodahan.github.io");
});

app.get("/:service", (req, res) => {
  const { u: username, p: password } = req.query;
  const service = req.params.service;

  try {
    const generator = SERVICE_GENERATORS[service];
    if (!generator) {
      throw new UserException("Invalid service", 400);
    }

    console.log(`Generating '${service}'...`);

    const content = Array.from(
      generator(
        typeof username === "string" ? username : "",
        typeof password === "string" ? password : ""
      )
    ).join("\n");

    res.set({
      "Content-Type": "application/octet-stream",
      "Content-Description": "File Transfer",
      "Cache-Control": "must-revalidate",
      "Content-Disposition": `attachment; filename="DikoPlus.m3u"`,
      Pragma: "public",
      Expires: "0",
    });

    res.send(content);
  } catch (e) {
    console.error(e);
    e instanceof UserException
      ? res.status(e.statusCode).send(e.message)
      : res.status(500).send("Internal Server Error");
  }
});

app.listen(3000, () => console.log("Started"));
