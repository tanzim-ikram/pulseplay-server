const { OpenAI } = require('openai');
require('dotenv').config();

const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here'
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

async function getRecommendations(mood) {
    if (!openai) {
        console.log('No OpenAI API key found, returning mock data for mood:', mood);

        const mockCollections = {
            calm: [
                { title: "Sunset Lover", artist: "Petit Biscuit", platform: "youtube", url: "https://youtu.be/4fQeaM62mOY" },
                { title: "Weightless", artist: "Marconi Union", platform: "youtube", url: "https://youtu.be/UfcAVejslrU" },
                { title: "Clair de Lune", artist: "Claude Debussy", platform: "spotify", url: "https://open.spotify.com/track/6kf7uS68vAg97Y9989YpS1" }
            ],
            happy: [
                { title: "Happy", artist: "Pharrell Williams", platform: "youtube", url: "https://youtu.be/ZbZSe6N_BXs" },
                { title: "Walking on Sunshine", artist: "Katrina & The Waves", platform: "spotify", url: "https://open.spotify.com/track/05wIrUM66m3Xy59vY6YNoI" },
                { title: "Don't Stop Me Now", artist: "Queen", platform: "youtube", url: "https://youtu.be/HgzGwKwLmgM" }
            ],
            energetic: [
                { title: "Eye of the Tiger", artist: "Survivor", platform: "youtube", url: "https://youtu.be/btPJPFnesV4" },
                { title: "Stronger", artist: "Kanye West", platform: "spotify", url: "https://open.spotify.com/track/4fzps6q61Y7608f7O8b7Tf" },
                { title: "Level Up", artist: "Ciara", platform: "youtube", url: "https://youtu.be/Dh-ULbQmmF8" }
            ]
        };

        const result = mockCollections[mood.toLowerCase()] || mockCollections.calm;
        return result.slice(0, 5);
    }
    const prompt = `
        You are a music recommendation system.
        Based on the mood "${mood}", recommend 5 real and well-known songs.
        Return ONLY a JSON array of objects.
        No explanation, no extra text.
        Each object must have:
        - title: The song title
        - artist: The artist name
        - platform: Either "youtube" or "spotify"
        - url: A direct playable URL (e.g., https://youtu.be/... or https://open.spotify.com/track/...)

        Example format:
        [
          {
            "title": "Song Name",
            "artist": "Artist Name",
            "platform": "youtube",
            "url": "https://youtu.be/..."
          }
        ]
    `;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        });

        const content = response.choices[0].message.content;
        const data = JSON.parse(content);

        // Handle cases where the AI might wrap the array in an object
        if (data.recommendations) return data.recommendations;
        if (Array.isArray(data)) return data;
        if (typeof data === 'object') {
            const firstKey = Object.keys(data)[0];
            if (Array.isArray(data[firstKey])) return data[firstKey];
        }

        return data;
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        throw error;
    }
}

module.exports = { getRecommendations };
