// LocalStorage Management
// Handles all persistent state

const STORAGE_KEYS = {
    FAVORITES: 'musicPlayer_favorites',
    PLAYLISTS: 'musicPlayer_playlists',
    RECENTLY_PLAYED: 'musicPlayer_recentlyPlayed',
    VOLUME: 'musicPlayer_volume',
    THEME: 'musicPlayer_theme',
    SHUFFLE: 'musicPlayer_shuffle',
    REPEAT: 'musicPlayer_repeat',
    QUEUE: 'musicPlayer_queue'
};

const Storage = {
    // Get item from localStorage
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    },

    // Set item in localStorage
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error writing to localStorage:', error);
        }
    },

    // Remove item from localStorage
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    },

    // Clear all storage
    clear() {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    },

    // Favorites
    getFavorites() {
        return this.get(STORAGE_KEYS.FAVORITES, []);
    },

    setFavorites(favorites) {
        this.set(STORAGE_KEYS.FAVORITES, favorites);
    },

    isFavorite(songId) {
        const favorites = this.getFavorites();
        return favorites.includes(songId);
    },

    toggleFavorite(songId) {
        const favorites = this.getFavorites();
        const index = favorites.indexOf(songId);

        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push(songId);
        }

        this.setFavorites(favorites);
        return index === -1;
    },

    // Playlists
    getPlaylists() {
        const stored = this.get(STORAGE_KEYS.PLAYLISTS);
        if (!stored) {
            this.setPlaylists(DEFAULT_PLAYLISTS);
            return DEFAULT_PLAYLISTS;
        }
        return stored;
    },

    setPlaylists(playlists) {
        this.set(STORAGE_KEYS.PLAYLISTS, playlists);
    },

    getPlaylist(playlistId) {
        const playlists = this.getPlaylists();
        return playlists.find(p => p.id === playlistId);
    },

    addPlaylist(playlist) {
        const playlists = this.getPlaylists();
        playlists.push(playlist);
        this.setPlaylists(playlists);
    },

    updatePlaylist(playlistId, updates) {
        const playlists = this.getPlaylists();
        const index = playlists.findIndex(p => p.id === playlistId);
        if (index > -1) {
            playlists[index] = { ...playlists[index], ...updates };
            this.setPlaylists(playlists);
        }
    },

    deletePlaylist(playlistId) {
        const playlists = this.getPlaylists();
        const filtered = playlists.filter(p => p.id !== playlistId && !p.isDefault);
        this.setPlaylists(filtered);
    },

    addToPlaylist(playlistId, songId) {
        const playlist = this.getPlaylist(playlistId);
        if (playlist && !playlist.songs.includes(songId)) {
            playlist.songs.push(songId);
            this.updatePlaylist(playlistId, playlist);
        }
    },

    removeFromPlaylist(playlistId, songId) {
        const playlist = this.getPlaylist(playlistId);
        if (playlist) {
            playlist.songs = playlist.songs.filter(id => id !== songId);
            this.updatePlaylist(playlistId, playlist);
        }
    },

    // Recently Played
    getRecentlyPlayed() {
        return this.get(STORAGE_KEYS.RECENTLY_PLAYED, []);
    },

    addToRecentlyPlayed(songId) {
        let recent = this.getRecentlyPlayed();
        recent = recent.filter(id => id !== songId);
        recent.unshift(songId);
        recent = recent.slice(0, 20);
        this.set(STORAGE_KEYS.RECENTLY_PLAYED, recent);
    },

    // Volume
    getVolume() {
        return this.get(STORAGE_KEYS.VOLUME, 1);
    },

    setVolume(volume) {
        this.set(STORAGE_KEYS.VOLUME, volume);
    },

    // Theme
    getTheme() {
        return this.get(STORAGE_KEYS.THEME, 'dark');
    },

    setTheme(theme) {
        this.set(STORAGE_KEYS.THEME, theme);
    },

    // Shuffle
    getShuffle() {
        return this.get(STORAGE_KEYS.SHUFFLE, false);
    },

    setShuffle(shuffle) {
        this.set(STORAGE_KEYS.SHUFFLE, shuffle);
    },

    // Repeat
    getRepeat() {
        return this.get(STORAGE_KEYS.REPEAT, 'off');
    },

    setRepeat(repeat) {
        this.set(STORAGE_KEYS.REPEAT, repeat);
    },

    // Queue
    getQueue() {
        return this.get(STORAGE_KEYS.QUEUE, []);
    },

    setQueue(queue) {
        this.set(STORAGE_KEYS.QUEUE, queue);
    }
};
