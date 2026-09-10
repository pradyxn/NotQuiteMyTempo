// Search Functionality
// Handles real-time search across songs, albums, and artists

const Search = {
    searchInput: null,
    searchResults: null,
    debounceTimer: null,

    init() {
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
        this.searchClear = document.getElementById('searchClear');

        if (!this.searchInput) return;

        this.setupEventListeners();
    },

    setupEventListeners() {
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.performSearch(e.target.value);
            }, 200);
        });

        this.searchClear?.addEventListener('click', () => {
            this.clearSearch();
        });

        this.searchInput.addEventListener('focus', () => {
            if (this.searchInput.value.trim()) {
                this.searchResults.classList.add('active');
            }
        });
    },

    performSearch(query) {
        const trimmed = query.trim();

        if (!trimmed) {
            this.clearSearch();
            return;
        }

        const results = MUSIC_DATA.search(trimmed);
        this.renderResults(results, trimmed);
        this.searchResults.classList.add('active');

        // Hide other views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
    },

    renderResults(results, query) {
        const { songs, albums, artists } = results;

        if (songs.length === 0 && albums.length === 0 && artists.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-empty">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <h3>No results found</h3>
                    <p>Try searching for something else</p>
                </div>
            `;
            return;
        }

        let html = `<h1 class="view-title">Search Results for "${query}"</h1>`;

        // Songs
        if (songs.length > 0) {
            html += `
                <div class="search-results-group">
                    <h2 class="search-results-title">Songs</h2>
                    <div class="songs-list">
                        ${songs.slice(0, 10).map((song, index) =>
                            this.renderSongItem(song, index)
                        ).join('')}
                    </div>
                </div>
            `;
        }

        // Albums
        if (albums.length > 0) {
            html += `
                <div class="search-results-group">
                    <h2 class="search-results-title">Albums</h2>
                    <div class="albums-grid">
                        ${albums.slice(0, 8).map(album =>
                            this.renderAlbumCard(album)
                        ).join('')}
                    </div>
                </div>
            `;
        }

        // Artists
        if (artists.length > 0) {
            html += `
                <div class="search-results-group">
                    <h2 class="search-results-title">Artists</h2>
                    <div class="artists-grid">
                        ${artists.slice(0, 8).map(artist =>
                            this.renderArtistCard(artist)
                        ).join('')}
                    </div>
                </div>
            `;
        }

        this.searchResults.innerHTML = html;

        // Add event listeners
        this.attachResultListeners();
    },

    renderSongItem(song, index) {
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

    renderAlbumCard(album) {
        return `
            <div class="album-card" data-album="${album.title}">
                <div class="album-artwork-container">
                    <img src="${album.cover}" alt="${album.title}" class="album-artwork">
                    <div class="album-overlay">
                        <button class="btn-play" aria-label="Play">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="album-info">
                    <div class="album-title">${album.title}</div>
                    <div class="album-artist">${album.artist}</div>
                </div>
            </div>
        `;
    },

    renderArtistCard(artist) {
        return `
            <div class="album-card" data-artist="${artist.name}">
                <div class="album-artwork-container">
                    <img src="${artist.cover}" alt="${artist.name}" class="album-artwork" style="border-radius: 50%;">
                    <div class="album-overlay">
                        <button class="btn-play" aria-label="Play">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="album-info">
                    <div class="album-title">${artist.name}</div>
                    <div class="album-artist">${artist.songCount} song${artist.songCount !== 1 ? 's' : ''}</div>
                </div>
            </div>
        `;
    },

    attachResultListeners() {
        // Song items
        this.searchResults.querySelectorAll('.song-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.song-favorite') || e.target.closest('.song-more')) return;

                const songId = item.dataset.songId;
                const allSongIds = Array.from(this.searchResults.querySelectorAll('.song-item'))
                    .map(el => el.dataset.songId);

                Player.playSong(songId, allSongIds);

                // Music note animation
                const rect = item.getBoundingClientRect();
                Animations.createMusicNoteBurst(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2
                );
            });
        });

        // Album cards
        this.searchResults.querySelectorAll('[data-album]').forEach(card => {
            const albumTitle = card.dataset.album;
            const playBtn = card.querySelector('.btn-play');

            playBtn?.addEventListener('click', (e) => {
                e.stopPropagation();
                const songs = MUSIC_DATA.getSongsByAlbum(albumTitle);
                if (songs.length > 0) {
                    Player.playSong(songs[0].id, songs.map(s => s.id));

                    const rect = playBtn.getBoundingClientRect();
                    Animations.createMusicNoteBurst(
                        rect.left + rect.width / 2,
                        rect.top + rect.height / 2
                    );
                }
            });
        });

        // Artist cards
        this.searchResults.querySelectorAll('[data-artist]').forEach(card => {
            const artistName = card.dataset.artist;
            const playBtn = card.querySelector('.btn-play');

            playBtn?.addEventListener('click', (e) => {
                e.stopPropagation();
                const songs = MUSIC_DATA.getSongsByArtist(artistName);
                if (songs.length > 0) {
                    Player.playSong(songs[0].id, songs.map(s => s.id));

                    const rect = playBtn.getBoundingClientRect();
                    Animations.createMusicNoteBurst(
                        rect.left + rect.width / 2,
                        rect.top + rect.height / 2
                    );
                }
            });
        });

        // Favorite buttons
        this.searchResults.querySelectorAll('.song-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const songId = btn.dataset.songId;
                const isFavorite = Storage.toggleFavorite(songId);
                btn.classList.toggle('active', isFavorite);

                const message = isFavorite ? 'Added to Favorites' : 'Removed from Favorites';
                Animations.showToast(message, 'success');
            });
        });
    },

    clearSearch() {
        this.searchInput.value = '';
        this.searchResults.classList.remove('active');
        this.searchResults.innerHTML = '';

        // Show the active view again
        const activeNav = document.querySelector('.nav-link.active');
        if (activeNav) {
            const viewName = activeNav.dataset.view || 'listen-now';
            window.dispatchEvent(new CustomEvent('navigateTo', { detail: viewName }));
        }
    }
};
