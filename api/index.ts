const express = require("express");
const app = express();

app.get("/", (req: any, res: any) => res.send("FFx Backend LOL"));

app.listen(8080, () => console.log("Server ready on possrt 8080."));

module.exports = app;
