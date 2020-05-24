const Agent = require('models/Agent.js');

const router = function (instance, opts, done) {
    console.log('in router')
    instance.get('/metadata', async function (request, reply) {
        const agents = await Agent.find({});
        const jsonData = agents.map(x => x.toJSON())
        reply.send({ result: jsonData })
    })

    done()
}

module.exports = router