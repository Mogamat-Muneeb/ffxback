import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { connect } from "mongoose";
import cors from "cors";
const app = express();

dotenv.config();

connect(process.env.MONGO_URL || "")
  .then(() => {
    console.log("Mongo Connection successfully established ✅");
  })
  .catch((error: any) => {
    console.error("Error connecting to Mongoose 👀", error);
    process.exit(1);
  });

app.use(cors());

app.get("/", (req: Request, res: Response) => res.send("FFx Backend"));

app.listen(8080, () => console.log("Server ready on possrt 8080."));

module.exports = app;
