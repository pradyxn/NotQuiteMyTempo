// Playlist Management
// Handles playlist creation, editing, and song management

const PlaylistManager = {
    playlists: [],

    init() {
        this.playlists = Storage.getPlaylists();
        this.render();
        this.setupEventListeners();
    },

    setupEventListeners() {
        document.getElementById('btnNewPlaylist')?.addEventListener('click', () => this.createPlaylist());

        window.addEventListener('favoritesChanged', () => {
            this.updateFavoritesPlaylist();
        });
    },

    render() {
        this.renderSidebarPlaylists();
    },

    renderSidebarPlaylists() {
        const container = document.getElementById('playlistsNav');
        if (!container) return;

        const userPlaylists = this.playlists.filter(p => !p.isDefault || p.id === 'favorites');

        container.innerHTML = userPlaylists.map(playlist => `
            <a href="#" class="nav-link" data-playlist-id="${playlist.id}">
                <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18V5l12-2v13"></path>
                    <circle cx="6" cy="18" r="3"></circle>
                    <circle cx="18" cy="16" r="3"></circle>
                </svg>
                <span>${playlist.name}</span>
            </a>
        `).join('');

        container.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const playlistId = link.dataset.playlistId;
                this.openPlaylist(playlistId);
            });
        });
    },

    createPlaylist() {
        const name = prompt('Playlist name:');
        if (!name || !name.trim()) return;

        const playlist = {
            id: 'playlist_' + Date.now(),
            name: name.trim(),
            description: '',
            cover: 'assets/covers/blonde.jpg',
            songs: [],
            isDefault: false,
            createdAt: Date.now()
        };

        Storage.addPlaylist(playlist);
        this.playlists = Storage.getPlaylists();
        this.render();

        Animations.showToast(`Playlist "${name}" created`, 'success');
    },

    deletePlaylist(playlistId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist || playlist.isDefault) return;

        if (confirm(`Delete "${playlist.name}"?`)) {
            Storage.deletePlaylist(playlistId);
            this.playlists = Storage.getPlaylists();
            this.render();
            Animations.showToast('Playlist deleted', 'info');

            // Go back to Listen Now
            window.dispatchEvent(new CustomEvent('navigateTo', { detail: 'listen-now' }));
        }
    },

    renamePlaylist(playlistId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist || playlist.isDefault) return;

        const newName = prompt('New name:', playlist.name);
        if (!newName || !newName.trim()) return;

        Storage.updatePlaylist(playlistId, { name: newName.trim() });
        this.playlists = Storage.getPlaylists();
        this.render();

        Animations.showToast('Playlist renamed', 'success');
    },

    addSongToPlaylist(playlistId, songId) {
        Storage.addToPlaylist(playlistId, songId);
        this.playlists = Storage.getPlaylists();

        const playlist = this.playlists.find(p => p.id === playlistId);
        if (playlist) {
            Animations.showToast(`Added to ${playlist.name}`, 'success');
        }

        window.dispatchEvent(new Event('playlistsChanged'));
    },

    removeSongFromPlaylist(playlistId, songId) {
        Storage.removeFromPlaylist(playlistId, songId);
        this.playlists = Storage.getPlaylists();

        Animations.showToast('Removed from playlist', 'info');
        window.dispatchEvent(new Event('playlistsChanged'));
    },

    updateFavoritesPlaylist() {
        const favorites = Storage.getFavorites();
        Storage.updatePlaylist('favorites', { songs: favorites });
        this.playlists = Storage.getPlaylists();
    },

    openPlaylist(playlistId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist) return;

        const view = document.getElementById('playlistView');
        const header = document.getElementById('playlistHeader');
        const songsList = document.getElementById('playlistSongs');

        if (!view || !header || !songsList) return;

        // Update header
        header.innerHTML = `
            <div class="playlist-header-content">
                <div class="playlist-header-artwork">
                    <img src="${playlist.cover}" alt="${playlist.name}">
                </div>
                <div class="playlist-header-info">
                    <div class="playlist-type">Playlist</div>
                    <h1 class="playlist-title">${playlist.name}</h1>
                    <p class="playlist-description">${playlist.description || ''}</p>
                    <div class="playlist-meta">
                        ${playlist.songs.length} song${playlist.songs.length !== 1 ? 's' : ''}
                    </div>
                    <div class="playlist-actions">
                        <button class="btn-primary" id="playPlaylist">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                            <span>Play</span>
                        </button>
                        <button class="btn-secondary" id="shufflePlaylist">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                                <polyline points="16 3 21 3 21 8"></polyline>
                                <line x1="4" y1="20" x2="21" y2="3"></line>
                                <polyline points="21 16 21 21 16 21"></polyline>
                                <line x1="15" y1="15" x2="21" y2="21"></line>
                                <line x1="4" y1="4" x2="9" y2="9"></line>
                            </svg>
                            <span>Shuffle</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Render songs
        const songs = playlist.songs
            .map(id => MUSIC_DATA.getSongById(id))
            .filter(song => song);

        songsList.innerHTML = songs.length > 0
            ? songs.map((song, index) => this.renderSongItem(song, index, playlistId)).join('')
            : '<div class="empty-state">No songs in this playlist</div>';

        // Event listeners
        document.getElementById('playPlaylist')?.addEventListener('click', () => {
            if (songs.length > 0) {
                Player.playSong(songs[0].id, playlist.songs);
            }
        });

        document.getElementById('shufflePlaylist')?.addEventListener('click', () => {
            if (songs.length > 0) {
                const shuffled = shuffleArray([...playlist.songs]);
                Player.playSong(shuffled[0], shuffled);
            }
        });

        // Add song click listeners
        songsList.querySelectorAll('.song-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.song-favorite') || e.target.closest('.song-more')) return;
                const songId = item.dataset.songId;
                Player.playSong(songId, playlist.songs);
            });
        });

        // Show view
        window.dispatchEvent(new CustomEvent('navigateTo', { detail: 'playlist' }));
    },

    renderSongItem(song, index, playlistId = null) {
        const isFavorite = Storage.isFavorite(song.id);

        return `
            <div class="song-item" data-song-id="${song.id}">
                <div class="song-artwork">
                    <img src="${song.cover}" alt="${song.title}">
                    <div class="song-play-btn">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                    </div>
                </div>
                <div class="song-details">
                    <div class="song-title">${song.title}</div>
                    <div class="song-artist">${song.artist}</div>
                </div>
                <div class="song-duration">${formatDuration(song.duration)}</div>
                <button class="btn-icon song-favorite ${isFavorite ? 'active' : ''}"
                        data-song-id="${song.id}" aria-label="Favorite">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
                <button class="btn-icon song-more" data-song-id="${song.id}" aria-label="More options">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                    </svg>
                </button>
            </div>
        `;
    },

    showAddToPlaylistMenu(songId, x, y) {
        const contextMenu = document.getElementById('contextMenu');
        if (!contextMenu) return;

        const userPlaylists = this.playlists.filter(p => !p.isDefault);

        contextMenu.innerHTML = `
            <div class="context-menu-item" data-action="create-new">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Create New Playlist</span>
            </div>
            <div class="context-menu-divider"></div>
            ${userPlaylists.map(playlist => `
                <div class="context-menu-item" data-playlist-id="${playlist.id}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 18V5l12-2v13"></path>
                        <circle cx="6" cy="18" r="3"></circle>
                        <circle cx="18" cy="16" r="3"></circle>
                    </svg>
                    <span>${playlist.name}</span>
                </div>
            `).join('')}
        `;

        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
        contextMenu.classList.add('open');

        // Event listeners
        contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', () => {
                if (item.dataset.action === 'create-new') {
                    this.createPlaylist();
                } else {
                    const playlistId = item.dataset.playlistId;
                    this.addSongToPlaylist(playlistId, songId);
                }
                contextMenu.classList.remove('open');
            });
        });

        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                contextMenu.classList.remove('open');
                document.removeEventListener('click', closeMenu);
            });
        }, 10);
    }
};
