//const moduleAlias = require('module-alias');

//moduleAlias.addPath(path.join(__dirname, '..'));
//moduleAlias();
import fastify from 'fastify';
import gzipStatic from 'connect-gzip-static';
import fastifyCORS from 'fastify-cors';
import agent from './routes/agent.js';

import {
  httpServer, httpsServer, httpPort, httpsPort,
} from './server.mjs';

const app = fastify({
  logger: true,
});

//load backend routes
app.register(fastifyCORS);
app.register(agent, { prefix: '/agent' });

//Run the server!
httpServer.listen(httpPort);
if(httpsServer) httpsServer.listen(httpsPort, '0.0.0.0');
