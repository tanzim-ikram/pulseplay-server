const fastify = require('fastify')({ logger: true });
const path = require('path');
const { getRecommendations } = require('./ai');

// Store latest recommendations in memory
let latestRecommendations = {
    mood: 'none',
    recommendations: []
};

// Register static files plugin
fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, '../public'),
    prefix: '/', // serve static files from root
});

// GET /api/latest
fastify.get('/api/latest', async (request, reply) => {
    return latestRecommendations;
});

// POST /api/recommend
fastify.post('/api/recommend', async (request, reply) => {
    const { mood } = request.body;

    if (!mood) {
        return reply.status(400).send({ error: 'Mood is required' });
    }

    try {
        const recommendations = await getRecommendations(mood);
        latestRecommendations = {
            mood,
            recommendations
        };
        return { status: 'ok' };
    } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: 'Failed to generate recommendations' });
    }
});

// Start the server
const start = async () => {
    try {
        const port = process.env.PORT || 3000;
        await fastify.listen({ port, host: '0.0.0.0' });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
