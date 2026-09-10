// UI Management
// Handles navigation, panels, modals, and general UI interactions

const UI = {
    currentView: 'listen-now',
    panels: {
        queue: null,
        lyrics: null,
        device: null
    },

    init() {
        this.setupNavigation();
        this.setupPanels();
        this.setupModals();
        this.setupTheme();
        this.setupMobileMenu();
        this.renderViews();
    },

    setupNavigation() {
        // Sidebar navigation
        document.querySelectorAll('.nav-link[data-view]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = link.dataset.view;
                this.navigateTo(view);
            });
        });

        // Custom navigation event
        window.addEventListener('navigateTo', (e) => {
            this.navigateTo(e.detail);
        });
    },

    navigateTo(viewName) {
        // Hide search results
        document.getElementById('searchResults')?.classList.remove('active');

        // Update nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-view="${viewName}"]`)?.classList.add('active');

        // Show view
        const views = document.querySelectorAll('.view');
        const targetView = document.getElementById(viewName + 'View');

        views.forEach(view => {
            if (view === targetView) {
                view.classList.add('active');
            } else {
                view.classList.remove('active');
            }
        });

        this.currentView = viewName;

        // Render view content if needed
        if (viewName === 'listen-now') {
            this.renderListenNow();
        } else if (viewName === 'browse') {
            this.renderBrowse();
        } else if (viewName === 'radio') {
            this.renderRadio();
        } else if (viewName === 'library') {
            this.renderLibrary();
        } else if (viewName === 'recently-added') {
            this.renderRecentlyAdded();
        } else if (viewName === 'made-for-you') {
            this.renderMadeForYouView();
        } else if (viewName === 'albums') {
            this.renderAlbums();
        } else if (viewName === 'artists') {
            this.renderArtists();
        } else if (viewName === 'songs') {
            this.renderSongs();
        }
    },

    setupPanels() {
        // Queue panel
        const btnQueue = document.getElementById('btnQueue');
        const btnCloseQueue = document.getElementById('btnCloseQueue');
        this.panels.queue = document.getElementById('queuePanel');

        btnQueue?.addEventListener('click', () => this.togglePanel('queue'));
        btnCloseQueue?.addEventListener('click', () => this.closePanel('queue'));

        // Lyrics panel
        const btnLyrics = document.getElementById('btnLyrics');
        const btnCloseLyrics = document.getElementById('btnCloseLyrics');
        this.panels.lyrics = document.getElementById('lyricsPanel');

        btnLyrics?.addEventListener('click', () => this.togglePanel('lyrics'));
        btnCloseLyrics?.addEventListener('click', () => this.closePanel('lyrics'));

        // Device panel
        const btnDevice = document.getElementById('btnDevice');
        const btnCloseDevice = document.getElementById('btnCloseDevice');
        this.panels.device = document.getElementById('devicePanel');

        btnDevice?.addEventListener('click', () => this.togglePanel('device'));
        btnCloseDevice?.addEventListener('click', () => this.closePanel('device'));

        // Listen for queue updates
        window.addEventListener('queueChanged', () => this.renderQueue());
    },

    togglePanel(panelName) {
        const panel = this.panels[panelName];
        if (!panel) return;

        const isOpen = panel.classList.contains('open');

        // Close all panels
        Object.values(this.panels).forEach(p => p?.classList.remove('open'));

        // Toggle this panel
        if (!isOpen) {
            panel.classList.add('open');

            // Render content
            if (panelName === 'queue') {
                this.renderQueue();
            } else if (panelName === 'lyrics') {
                this.renderLyrics();
            } else if (panelName === 'device') {
                this.renderDevices();
            }
        }
    },

    closePanel(panelName) {
        this.panels[panelName]?.classList.remove('open');
    },

    setupModals() {
        // Now Playing Modal
        const nowPlayingModal = document.getElementById('nowPlayingModal');
        const btnCloseNowPlaying = document.getElementById('btnCloseNowPlaying');

        btnCloseNowPlaying?.addEventListener('click', () => {
            nowPlayingModal?.classList.remove('open');
        });

        // Close on backdrop click
        nowPlayingModal?.addEventListener('click', (e) => {
            if (e.target === nowPlayingModal) {
                nowPlayingModal.classList.remove('open');
            }
        });
    },

    setupTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const savedTheme = Storage.getTheme();

        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
        }

        themeToggle?.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const newTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
            Storage.setTheme(newTheme);
        });
    },

    setupMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const sidebar = document.querySelector('.sidebar');

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);

        mobileMenuToggle?.addEventListener('click', () => {
            sidebar?.classList.toggle('open');
            overlay.classList.toggle('visible');
        });

        overlay.addEventListener('click', () => {
            sidebar?.classList.remove('open');
            overlay.classList.remove('visible');
        });
    },

    renderViews() {
        this.renderListenNow();
    },

    renderListenNow() {
        this.renderHero();
        this.renderRecentlyPlayed();
        this.renderMadeForYou();
        this.renderNewReleases();
    },

    renderBrowse() {
        const container = document.getElementById('browseGrid');
        if (!container) return;

        container.innerHTML = MUSIC_DATA.getAlbums()
            .map(album => this.renderAlbumCardFromAlbum(album))
            .join('');
        this.attachAlbumCardListeners(container);
    },

    renderRadio() {
        const container = document.getElementById('radioGrid');
        if (!container) return;

        container.innerHTML = MUSIC_DATA.getRandomSongs(12)
            .map(song => this.renderAlbumCard(song))
            .join('');
        this.attachAlbumCardListeners(container);
    },

    renderLibrary() {
        const container = document.getElementById('libraryContent');
        if (!container) return;

        const songs = Storage.getFavorites()
            .map(id => MUSIC_DATA.getSongById(id))
            .filter(song => song);

        container.innerHTML = songs.length > 0
            ? `<div class="songs-list" id="librarySongs">${songs.map((song, index) => PlaylistManager.renderSongItem(song, index)).join('')}</div>`
            : '<div class="empty-state">Favorite songs will appear here.</div>';

        const librarySongs = document.getElementById('librarySongs');
        if (librarySongs) this.attachSongListeners(librarySongs);
    },

    renderRecentlyAdded() {
        const container = document.getElementById('recentlyAddedGrid');
        if (!container) return;

        container.innerHTML = MUSIC_DATA.songs
            .slice(-12)
            .reverse()
            .map(song => this.renderAlbumCard(song))
            .join('');
        this.attachAlbumCardListeners(container);
    },

    renderMadeForYouView() {
        const container = document.getElementById('madeForYouGrid');
        if (!container) return;

        container.innerHTML = MUSIC_DATA.getRandomSongs(12)
            .map(song => this.renderAlbumCard(song))
            .join('');
        this.attachAlbumCardListeners(container);
    },

    renderHero() {
        const heroSection = document.getElementById('heroSection');
        if (!heroSection) return;

        const featuredSong = MUSIC_DATA.songs[Math.floor(Math.random() * MUSIC_DATA.songs.length)];

        heroSection.innerHTML = `
            <div class="hero-backdrop">
                <img src="${featuredSong.cover}" alt="">
            </div>
            <div class="hero-content">
                <h2 class="hero-title">${featuredSong.title}</h2>
                <p class="hero-subtitle">${featuredSong.artist} • ${featuredSong.album}</p>
                <div class="hero-actions">
                    <button class="btn-primary" data-song-id="${featuredSong.id}">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        <span>Play</span>
                    </button>
                    <button class="btn-secondary">
                        <span>Add to Library</span>
                    </button>
                </div>
            </div>
        `;

        heroSection.querySelector('.btn-primary')?.addEventListener('click', () => {
            Player.playSong(featuredSong.id);
        });
    },

    renderRecentlyPlayed() {
        const container = document.getElementById('recentlyPlayed');
        if (!container) return;

        const recentIds = Storage.getRecentlyPlayed();
        const recentSongs = recentIds.map(id => MUSIC_DATA.getSongById(id)).filter(s => s);

        if (recentSongs.length === 0) {
            const randomSongs = MUSIC_DATA.getRandomSongs(6);
            container.innerHTML = randomSongs.map(song => this.renderAlbumCard(song)).join('');
        } else {
            container.innerHTML = recentSongs.slice(0, 6).map(song => this.renderAlbumCard(song)).join('');
        }

        this.attachAlbumCardListeners(container);
    },

    renderMadeForYou() {
        const container = document.getElementById('madeForYou');
        if (!container) return;

        const songs = MUSIC_DATA.getRandomSongs(6);
        container.innerHTML = songs.map(song => this.renderAlbumCard(song)).join('');
        this.attachAlbumCardListeners(container);
    },

    renderNewReleases() {
        const container = document.getElementById('newReleases');
        if (!container) return;

        const albums = MUSIC_DATA.getAlbums().slice(0, 6);
        container.innerHTML = albums.map(album => this.renderAlbumCardFromAlbum(album)).join('');
        this.attachAlbumCardListeners(container);
    },

    renderAlbums() {
        const container = document.getElementById('albumsGrid');
        if (!container) return;

        const albums = MUSIC_DATA.getAlbums();
        container.innerHTML = albums.map(album => this.renderAlbumCardFromAlbum(album)).join('');
        this.attachAlbumCardListeners(container);
    },

    renderArtists() {
        const container = document.getElementById('artistsGrid');
        if (!container) return;

        const artists = MUSIC_DATA.getArtists();
        container.innerHTML = artists.map(artist => `
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
        `).join('');
        this.attachAlbumCardListeners(container);
    },

    renderSongs() {
        const container = document.getElementById('songsList');
        if (!container) return;

        container.innerHTML = MUSIC_DATA.songs.map((song, index) =>
            PlaylistManager.renderSongItem(song, index)
        ).join('');

        this.attachSongListeners(container);
    },

    renderAlbumCard(song) {
        return `
            <div class="album-card" data-song-id="${song.id}">
                <div class="album-artwork-container">
                    <img src="${song.cover}" alt="${song.title}" class="album-artwork">
                    <div class="album-overlay">
                        <button class="btn-play" aria-label="Play">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="album-info">
                    <div class="album-title">${song.title}</div>
                    <div class="album-artist">${song.artist}</div>
                </div>
            </div>
        `;
    },

    renderAlbumCardFromAlbum(album) {
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

    attachAlbumCardListeners(container) {
        container.querySelectorAll('.album-card').forEach(card => {
            const playBtn = card.querySelector('.btn-play');

            playBtn?.addEventListener('click', (e) => {
                e.stopPropagation();

                const rect = playBtn.getBoundingClientRect();
                Animations.createMusicNoteBurst(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2
                );

                if (card.dataset.songId) {
                    const songId = card.dataset.songId;
                    Player.playSong(songId);
                } else if (card.dataset.album) {
                    const songs = MUSIC_DATA.getSongsByAlbum(card.dataset.album);
                    if (songs.length > 0) {
                        Player.playSong(songs[0].id, songs.map(s => s.id));
                    }
                } else if (card.dataset.artist) {
                    const songs = MUSIC_DATA.getSongsByArtist(card.dataset.artist);
                    if (songs.length > 0) {
                        Player.playSong(songs[0].id, songs.map(s => s.id));
                    }
                }
            });
        });
    },

    attachSongListeners(container) {
        container.querySelectorAll('.song-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.song-favorite') || e.target.closest('.song-more')) return;

                const songId = item.dataset.songId;
                const allSongIds = Array.from(container.querySelectorAll('.song-item'))
                    .map(el => el.dataset.songId);

                Player.playSong(songId, allSongIds);

                const rect = item.getBoundingClientRect();
                Animations.createMusicNoteBurst(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2
                );
            });
        });

        container.querySelectorAll('.song-favorite').forEach(btn => {
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

    renderQueue() {
        const queueContent = document.getElementById('queueContent');
        if (!queueContent) return;

        const queue = Player.queue;
        const currentIndex = Player.queueIndex;

        if (queue.length === 0) {
            queueContent.innerHTML = '<div class="queue-empty">No songs in queue</div>';
            return;
        }

        let html = '';

        // Currently Playing
        if (currentIndex >= 0 && currentIndex < queue.length) {
            const currentSong = MUSIC_DATA.getSongById(queue[currentIndex]);
            if (currentSong) {
                html += `
                    <div class="queue-section">
                        <div class="queue-section-title">Now Playing</div>
                        ${this.renderQueueItem(currentSong, true)}
                    </div>
                `;
            }
        }

        // Up Next
        const upNext = queue.slice(currentIndex + 1);
        if (upNext.length > 0) {
            html += `
                <div class="queue-section">
                    <div class="queue-section-title">Up Next</div>
                    ${upNext.map(id => {
                        const song = MUSIC_DATA.getSongById(id);
                        return song ? this.renderQueueItem(song, false) : '';
                    }).join('')}
                </div>
            `;
        }

        queueContent.innerHTML = html;
    },

    renderQueueItem(song, isPlaying) {
        return `
            <div class="queue-item ${isPlaying ? 'playing' : ''}" data-song-id="${song.id}">
                <div class="queue-artwork">
                    <img src="${song.cover}" alt="${song.title}">
                </div>
                <div class="queue-details">
                    <div class="queue-title">${song.title}</div>
                    <div class="queue-artist">${song.artist}</div>
                </div>
                ${!isPlaying ? `
                    <button class="btn-icon queue-remove" data-song-id="${song.id}" aria-label="Remove">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                ` : ''}
            </div>
        `;
    },

    renderLyrics() {
        const lyricsContent = document.getElementById('lyricsContent');
        if (!lyricsContent) return;

        if (!Player.currentSong) {
            lyricsContent.innerHTML = '<div class="lyrics-empty">No song playing</div>';
            return;
        }

        // Sample lyrics
        const lyrics = [
            "This is a sample lyric line",
            "Showing how lyrics would appear",
            "In the actual implementation",
            "You would load real lyrics",
            "From a lyrics API or database",
            "",
            "The current line would be highlighted",
            "As the song plays",
            "Creating a karaoke-like experience"
        ];

        lyricsContent.innerHTML = lyrics.map((line, index) =>
            `<div class="lyrics-line ${index === 0 ? 'active' : ''}">${line || '<br>'}</div>`
        ).join('');
    },

    renderDevices() {
        const deviceContent = document.getElementById('deviceContent');
        if (!deviceContent) return;

        const devices = [
            { name: 'This Browser', type: 'Computer', connected: true },
            { name: 'Living Room', type: 'Speaker', connected: false },
            { name: 'Bluetooth Speaker', type: 'Speaker', connected: false },
            { name: 'Smart TV', type: 'TV', connected: false }
        ];

        deviceContent.innerHTML = devices.map(device => `
            <div class="device-item ${device.connected ? 'connected' : ''}" data-device="${device.name}">
                <div class="device-radio"></div>
                <div class="device-info">
                    <div class="device-name">${device.name}</div>
                    <div class="device-type">${device.type}</div>
                </div>
            </div>
        `).join('');

        // Add click listeners
        deviceContent.querySelectorAll('.device-item').forEach(item => {
            item.addEventListener('click', () => {
                deviceContent.querySelectorAll('.device-item').forEach(d => d.classList.remove('connected'));
                item.classList.add('connected');
                Animations.showToast(`Connected to ${item.dataset.device}`, 'success');
            });
        });
    }
};
