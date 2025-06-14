import {existsSync, mkdirSync} from "node:fs";
import {resolve} from "node:path";
import {pino} from "pino";

const logDirectory = resolve(process.cwd(), "logs");

// Create the log directory if it doesn't exist
if (!existsSync(logDirectory)) {
  mkdirSync(logDirectory, {recursive: true});
}

const logFile = resolve(process.cwd(), "logs", "app.log");
const logger = pino({level: "info"}, pino.destination(logFile));

export {logger};
