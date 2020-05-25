const moduleAlias = require('module-alias');
moduleAlias.addPath('./src')
moduleAlias()

const fastify = require('fastify');
const gzipStatic = require('connect-gzip-static');
const agent = require('./routes/agent.js');
const fastifyCORS = require('fastify-cors');


const app = fastify({
    logger: true
})

const staticPath = './dist';
app.use('/', gzipStatic(staticPath));
app.use('/*', gzipStatic(staticPath));

  
// Declare a route
app.get('/', (request, reply) => {
    reply.send({ hello: 'world' })
})

// Run the server!
app.listen(8080, (err, address) => {
    if (err) throw err
    app.log.info(`server listening on ${address}`)
})

app.register(fastifyCORS, { 
    // put your options here
})
app.register(agent, { prefix: '/agent' })