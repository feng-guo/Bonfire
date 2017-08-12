const express = require('express');

const port = process.env.PORT || 8000

const app = express()
app.use('/', express.static('public'))
app.listen(port)

console.log(`Open localhost:${port} in your browser`);
