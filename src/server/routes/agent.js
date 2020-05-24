
import fastify from 'fastify'

const router = function (instance, opts, done) {
    console.log('in router')
    instance.get('/search', function (request, reply) {
        reply.send({ prefix: instance.prefix })
    })

    done()
}

export default router