const express = require('express');

const app = express()
app.use('/', express.static('public'))
app.listen(8000)

console.log('Open localhost:8000 in your browser');
