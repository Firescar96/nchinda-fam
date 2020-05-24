import path from 'path';
import fastify from 'fastify'
import gzipStatic from 'connect-gzip-static'
import agent from './routes/agent.js'

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
app.listen(3000, (err, address) => {
    if (err) throw err
    app.log.info(`server listening on ${address}`)
})

console.log('send agent', agent)
app.register(agent, { prefix: '/agent' })