const { OpenAI } = require('openai');
const yts = require('yt-search');
require('dotenv').config();

const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here'
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

async function resolveDirectUrl(title, artist) {
    try {
        const query = `${artist} ${title} music video`;
        const r = await yts(query);
        const videos = r.videos.slice(0, 3);
        if (videos.length > 0) {
            return videos[0].url;
        }
        return `https://www.youtube.com/results?search_query=${encodeURIComponent(artist + ' ' + title)}`;
    } catch (error) {
        console.error('Error resolving direct URL:', error);
        return `https://www.youtube.com/results?search_query=${encodeURIComponent(artist + ' ' + title)}`;
    }
}

async function getRecommendations(mood) {
    if (!openai) {
        console.log('No OpenAI API key found, returning mock data for mood:', mood);

        const mockCollections = {
            calm: [
                { title: "Sunset Lover", artist: "Petit Biscuit" },
                { title: "Weightless", artist: "Marconi Union" },
                { title: "Clair de Lune", artist: "Claude Debussy" }
            ],
            happy: [
                { title: "Happy", artist: "Pharrell Williams" },
                { title: "Walking on Sunshine", artist: "Katrina & The Waves" },
                { title: "Don't Stop Me Now", artist: "Queen" }
            ],
            energetic: [
                { title: "Eye of the Tiger", artist: "Survivor" },
                { title: "Stronger", artist: "Kanye West" },
                { title: "Level Up", artist: "Ciara" }
            ]
        };

        const result = (mockCollections[mood.toLowerCase()] || mockCollections.calm).slice(0, 5);

        const recommendations = [];
        for (const song of result) {
            recommendations.push({
                ...song,
                platform: 'youtube',
                url: await resolveDirectUrl(song.title, song.artist)
            });
        }
        return recommendations;
    }

    const prompt = `
        You are a music recommendation system.
        Based on the mood "${mood}", recommend 5 real and well-known songs.
        Return ONLY a JSON array of objects.
        No explanation, no extra text.
        Each object must have:
        - title: The song title
        - artist: The artist name

        Example format:
        [
          {
            "title": "Song Name",
            "artist": "Artist Name"
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

        let songs = [];
        if (data.recommendations) songs = data.recommendations;
        else if (Array.isArray(data)) songs = data;
        else if (typeof data === 'object') {
            const firstKey = Object.keys(data)[0];
            if (Array.isArray(data[firstKey])) songs = data[firstKey];
        }

        const recommendations = [];
        for (const song of (Array.isArray(songs) ? songs : [])) {
            recommendations.push({
                ...song,
                platform: 'youtube',
                url: await resolveDirectUrl(song.title, song.artist)
            });
        }
        return recommendations;
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        throw error;
    }
}

module.exports = { getRecommendations };
