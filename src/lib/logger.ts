import {existsSync, mkdirSync} from "node:fs";
import {resolve} from "node:path";
import {multistream, pino} from "pino";

const logDirectory = resolve(process.cwd(), "logs");

// Create the log directory if it doesn't exist
if (!existsSync(logDirectory)) {
  mkdirSync(logDirectory, {recursive: true});
}

const logFile = resolve(process.cwd(), "logs", "app.log");

const streams = [
  {stream: process.stdout}, // log to console
  {stream: pino.destination(logFile)}, // log to file
];

const logger = pino({level: "info"}, multistream(streams));

export {logger};
