import dotenv from "dotenv";
import express, { Request, Response } from "express";
const app = express();

app.get("/", (req: Request, res: Response) => res.send("FFx Backend"));

app.listen(8080, () => console.log("Server ready on possrt 8080."));

module.exports = app;
