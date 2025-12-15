import serverless from "serverless-http";
import { createServer } from "../../server";

const app = createServer();

// Use serverless-http with custom options to handle body properly
export const handler = serverless(app, {
  basePath: "/.netlify/functions/api",
  aws: {
    formatVersion: "2.0",
  },
});
