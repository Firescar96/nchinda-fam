const path = require('path');
const express = require('express');
const gzipStatic = require('connect-gzip-static');

const app = express();

const staticPath = path.join(__dirname, './dist');
app.use('/', gzipStatic(staticPath));
app.use('/*', gzipStatic(staticPath));

app.listen(80, '0.0.0.0');
