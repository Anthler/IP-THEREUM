const express = require("express");
const path = require("path");

const app = express();
const router = express.Router();

router.get("/", function(req, res) {
  res.sendFile(path.join(__dirname + "dist/index.html"));
});

//app.use("/", express.static(path.join(__dirname, "dist")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`App running on port ${PORT}`));
