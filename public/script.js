let currentMood = null;

async function fetchLatest() {
    try {
        const response = await fetch('/api/latest');
        const data = await response.json();

        if (data.mood && data.mood !== currentMood) {
            updateUI(data);
            currentMood = data.mood;
        }
    } catch (error) {
        console.error('Error fetching latest recommendations:', error);
    }
}

function updateUI(data) {
    const moodDisplay = document.getElementById('mood-display');
    const songList = document.getElementById('song-list');

    if (data.mood === 'none') {
        moodDisplay.textContent = 'Waiting for mood...';
        songList.innerHTML = '<div class="empty-state">The rhythm is waiting for your device to pick a mood.</div>';
        return;
    }

    moodDisplay.textContent = data.mood;

    if (data.recommendations && data.recommendations.length > 0) {
        songList.innerHTML = data.recommendations.map(song => `
            <a href="${song.url}" target="_blank" class="song-item">
                <div class="song-info">
                    <span class="song-title">${song.title}</span>
                    <span class="song-artist">${song.artist}</span>
                </div>
                <div class="platform-icon">
                    ${getPlatformIcon(song.platform)}
                </div>
            </a>
        `).join('');
    } else {
        songList.innerHTML = '<div class="empty-state">Generating recommendations...</div>';
    }
}

function getPlatformIcon(platform) {
    if (platform === 'youtube') {
        return '<svg width="20" height="20" viewBox="0 0 24 24" fill="#ff0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>';
    } else if (platform === 'spotify') {
        return '<svg width="20" height="20" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.31c-.22.36-.677.472-1.037.252-2.85-1.74-6.438-2.134-10.663-1.17-.407.094-.817-.16-.91-.567-.095-.407.16-.817.567-.91 4.633-1.06 8.59-.61 11.782 1.34.36.22.472.677.252 1.037zm1.47-3.26c-.277.45-.867.594-1.317.317-3.262-2.004-8.23-2.587-12.083-1.417-.51.155-1.043-.135-1.198-.646-.153-.51.137-1.043.647-1.2 4.4-1.336 9.875-.688 13.633 1.62.45.277.595.867.317 1.317zm.126-3.41c-3.914-2.324-10.363-2.538-14.122-1.4-1.604-.183-1.206-.923-.626-1.106 4.314-1.306 11.434-1.05 15.903 1.6.537.32.713 1.01.393 1.547-.32.536-1.01.712-1.547.393z"/></svg>';
    }
    return '';
}

// Poll every 3 seconds
setInterval(fetchLatest, 3000);

// Initial fetch
fetchLatest();
