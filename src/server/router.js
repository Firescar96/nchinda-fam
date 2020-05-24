import agent from './routes/agent'
import fastify from 'fastify'


console.log('agent', agent)

fastify.register(agent, { prefix: '/agent' })