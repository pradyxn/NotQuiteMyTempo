// Music Data Loader
// Loads canonical music database from music.json

let MUSIC_DATA = {
    songs: [],
    albums: [],
    artists: [],
    loaded: false
};

// Load music data from JSON
async function loadMusicData() {
    try {
        const response = await fetch('assets/data/music.json');
        if (!response.ok) {
            throw new Error(`Music database request failed: ${response.status}`);
        }
        const data = await response.json();

        MUSIC_DATA.songs = data.songs || [];
        MUSIC_DATA.albums = data.albums || [];
        MUSIC_DATA.artists = data.artists || [];
        MUSIC_DATA.loaded = true;

        console.log('✅ Music database loaded:', {
            songs: MUSIC_DATA.songs.length,
            albums: MUSIC_DATA.albums.length,
            artists: MUSIC_DATA.artists.length
        });

        return MUSIC_DATA;
    } catch (error) {
        console.error('❌ Failed to load music database:', error);
        throw error;
    }
}

// Get methods
MUSIC_DATA.getSongById = function(id) {
    return this.songs.find(song => song.id === id);
};

MUSIC_DATA.getAlbumById = function(id) {
    return this.albums.find(album => album.id === id);
};

MUSIC_DATA.getArtistById = function(id) {
    return this.artists.find(artist => artist.id === id);
};

MUSIC_DATA.getAlbums = function() {
    return this.albums;
};

MUSIC_DATA.getArtists = function() {
    return this.artists.map(artist => ({
        ...artist,
        songCount: this.getSongsByArtist(artist.name).length
    }));
};

MUSIC_DATA.getSongsByAlbum = function(albumTitle) {
    return this.songs.filter(song =>
        song.album.toLowerCase() === albumTitle.toLowerCase()
    );
};

MUSIC_DATA.getSongsByArtist = function(artistName) {
    return this.songs.filter(song =>
        song.artist.toLowerCase().includes(artistName.toLowerCase())
    );
};

MUSIC_DATA.getSongsByGenre = function(genre) {
    return this.songs.filter(song =>
        song.genre && song.genre.toLowerCase() === genre.toLowerCase()
    );
};

MUSIC_DATA.getRandomSongs = function(count = 10) {
    const shuffled = [...this.songs].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
};

MUSIC_DATA.search = function(query) {
    const lowerQuery = query.toLowerCase();

    const songs = this.songs.filter(song =>
        song.title.toLowerCase().includes(lowerQuery) ||
        song.artist.toLowerCase().includes(lowerQuery) ||
        song.album.toLowerCase().includes(lowerQuery)
    );

    const albums = this.albums.filter(album =>
        album.title.toLowerCase().includes(lowerQuery) ||
        album.artist.toLowerCase().includes(lowerQuery)
    );

    const artists = this.artists.filter(artist =>
        artist.name.toLowerCase().includes(lowerQuery)
    );

    return { songs, albums, artists };
};

// Default playlists
const DEFAULT_PLAYLISTS = [
    {
        id: 'favorites',
        name: 'Favorites',
        description: 'Your favorite tracks',
        cover: 'assets/covers/blonde.jpg',
        songs: [],
        isDefault: true
    },
    {
        id: 'chill',
        name: 'Chill',
        description: 'Relaxing vibes',
        cover: 'assets/covers/blonde.jpg',
        songs: [],
        isDefault: true
    },
    {
        id: 'workout',
        name: 'Workout',
        description: 'High energy tracks',
        cover: 'assets/covers/rodeo.jpg',
        songs: [],
        isDefault: true
    },
    {
        id: 'late-night',
        name: 'Late Night',
        description: 'Late night moods',
        cover: 'assets/covers/trilogy.jpg',
        songs: [],
        isDefault: true
    },
    {
        id: 'coding',
        name: 'Coding',
        description: 'Focus and flow',
        cover: 'assets/covers/am.jpg',
        songs: [],
        isDefault: true
    }
];

// Format duration from seconds to MM:SS
function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
