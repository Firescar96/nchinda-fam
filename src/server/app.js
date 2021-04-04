const path = require('path');
const moduleAlias = require('module-alias');
moduleAlias.addPath(path.join(__dirname, '..'))
moduleAlias()

const fastify = require('fastify');
const gzipStatic = require('connect-gzip-static');
const agent = require('./routes/agent.js');
const fastifyCORS = require('fastify-cors');

const app = fastify({
    logger: true
})

// load frontend routes
const staticPath = path.join(__dirname, '../../dist');
console.log(staticPath)
app.use('/', gzipStatic(staticPath));
app.use('/*', gzipStatic(staticPath));

// load backend routes
app.register(fastifyCORS)
app.register(agent, { prefix: '/agent' })

// Run the server!
const httpPort = process.env.NODE_ENV == 'production' ? 80 : 8080;
app.listen(httpPort, '0.0.0.0', (err, address) => {
    if (err) throw err
    app.log.info(`server listening on ${address}`)
})