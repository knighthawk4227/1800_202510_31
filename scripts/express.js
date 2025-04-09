const express = require('express');

const app = express();
const PORT = 8080;

app.get('/', (req, res) => {
  res.send("Man IDK")
});

app.listen(PORT, () => {
  console.log("running on " + PORT);
});



