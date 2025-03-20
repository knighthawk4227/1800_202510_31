const express = require('express');

const app = express();
const PORT = 8080;

app.get('/', (req, res) => {
  res.send("kill yourself")
});

app.listen(PORT, () => {
  console.log("running on " + PORT);
});



