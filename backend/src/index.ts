import Express from "express";
import { Response } from 'express';
import { SERVICE_GENERATORS, ASYNC_SERVICE_GENERATORS, AUTH_ASYNC_SERVICE_GENERATORS, VOD_GENERATORS } from "./services";
import { UserException } from "./user-exception";
import * as path from "path";
import bodyParser from "body-parser";
import { telegramChat } from "./telegram-chat";
import { MappingSubmitRequest } from "../../shared/types/mapping-submit-request";

const app = Express();

app.get("/", (_, res) => {
  res.redirect("https://dikodahan.github.io");
});

app.use(
  "/",
  Express.static(path.join(__dirname, "../../public"), {
    fallthrough: true,
    extensions: ["html"],
  })
);

app.get("/vod/:service", async (req, res) => {
  const service = req.params.service;
  const userUrl = `https://${req.headers.host}${req.url}`;

  try {
      const generator = VOD_GENERATORS[service];
      if (!generator) {
          res.status(404).send('VOD service not found');
          return;
      }

      console.log(`Accessing movie on '${service}'...`);

      const m3u8Content = await generator(userUrl);
      res.set("Content-Type", "application/vnd.apple.mpegurl");
      res.send(m3u8Content);
  } catch (error) {
      res.status(500).send('Server error occurred');
  }
});

app.post("/services/:service/submit", bodyParser.json(), async (req, res) => {
  const service = req.params.service;
  const {channels, description, serviceName} = req.body as MappingSubmitRequest;
  if (service !== serviceName) {
    res.status(400).send("Invalid service name");
    return;
  }
  await telegramChat.sendDocument(description, `${serviceName}.json`, JSON.stringify(channels, null, 2));
  res.send("ok");
});

app.use(
  "/scripts",
  Express.static(path.join(__dirname, "../../lib/frontend"), {
    fallthrough: true,
    extensions: ["html"],
  })
);

app.get("/:service", async (req, res) => {
  const { u, p, dpt } = req.query;
  const service = req.params.service;

  try {
    // Ensure query parameters are strings
    const username = typeof u === "string" ? u : "";
    const password = typeof p === "string" ? p : "";
    const dptToken = typeof dpt === "string" ? dpt : "";

    // Check if the service is an auth async generator
    const authAsyncGenerator = AUTH_ASYNC_SERVICE_GENERATORS[service?.toLowerCase()];
    if (authAsyncGenerator) {
      console.log(`Generating '${service}' asynchronously with auth...`);

      const content = [];
      for await (const line of authAsyncGenerator(username, password, dptToken)) {
        content.push(line);
      }
      sendResponse(res, service, content.join("\n"));
      return;
    }

    // Check if the service is an async generator
    const asyncGenerator = ASYNC_SERVICE_GENERATORS[service];
    if (asyncGenerator) {
      console.log(`Generating '${service}' asynchronously...`);

      const content = [];
      for await (const line of asyncGenerator(username || "", password || "")) {
        content.push(line);
      }
      sendResponse(res, service, content.join("\n"));
      return;
    }

    // Handle synchronous generators
    const generator = SERVICE_GENERATORS[service];
    if (!generator) {
      throw new UserException("Invalid service", 400);
    }

    console.log(`Generating '${service}'...`);

    const content = Array.from(generator(username || "", password || "")).join("\n");
    sendResponse(res, service, content);
  } catch (e) {
    console.error(e);
    e instanceof UserException
      ? res.status(e.statusCode).send(e.message)
      : res.status(500).send("Internal Server Error");
  }
});

function sendResponse(res: Response, service: string, content: string) {
  const filename = service === 'movies' ? "DikoPlusVOD.m3u8" : "DikoPlus.m3u";

  res.set({
    "Content-Type": "application/octet-stream",
    "Content-Description": "File Transfer",
    "Cache-Control": "must-revalidate",
    "Content-Disposition": `attachment; filename="${filename}"`,
    Pragma: "public",
    Expires: "0",
  });

  res.send(content);
}

app.listen(3000, () => console.log("Started"));
