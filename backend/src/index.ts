import Express from "express";
import { SERVICE_GENERATORS, AsyncServiceGenerators } from "./services"; // Import AsyncServiceGenerators
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

app.get("/:service", async (req, res) => { // Make this handler async
  const username = typeof req.query.u === 'string' ? req.query.u : '';
  const password = typeof req.query.p === 'string' ? req.query.p : '';
  const service = req.params.service;

  try {
    let content = '';
    if (AsyncServiceGenerators[service]) {
      const asyncGenerator = AsyncServiceGenerators[service](username, password);
      for await (const part of asyncGenerator) {
        content += part + "\n";
      }
    } else {
      const generator = SERVICE_GENERATORS[service?.toLowerCase()];
      if (!generator) {
        throw new UserException("Invalid service", 400);
      }

      console.log(`Generating '${service}'...`);

      content = Array.from(
        generator(username, password)
      ).join("\n");
    }

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