import Express from "express";
import { UserException } from "./user-exception";
import * as path from "path";
import bodyParser from "body-parser";
import { telegramChat } from "./telegram-chat";
import { MappingSubmitRequest } from "../../shared/types/mapping-submit-request";
import { asyncVodGenerator } from "./services/vod/asyncVodGenerator";
import { fetchData as nachotoyFetchData } from "./services/vod/nachotoy.generator";

const app = Express();

type GeneratorFunction = (username: string, password: string) => AsyncGenerator<string, void, unknown>;

const SERVICE_GENERATORS: Record<string, GeneratorFunction> = {
  "nachotoy": (username, password) => asyncVodGenerator(nachotoyFetchData, username, password),
  // ... other services
};

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
  const { channels, description, serviceName } = req.body as MappingSubmitRequest;
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
  const username = req.query.u as string || '';
  const password = req.query.p as string || '';
  const service = req.params.service;

  try {
    const generatorFunction = SERVICE_GENERATORS[service?.toLowerCase()];
    if (!generatorFunction) {
      throw new UserException("Invalid service", 400);
    }

    console.log(`Generating '${service}'...`);

    const generator = generatorFunction(username, password);
    let content = '';
    for await (const part of generator) {
      content += part + "\n";
    }
    res.send(content);
  } catch (e) {
    console.error(e);
    e instanceof UserException
      ? res.status(e.statusCode).send(e.message)
      : res.status(500).send("Internal Server Error");
  }
});

app.listen(3000, () => console.log("Started"));