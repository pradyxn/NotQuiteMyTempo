// HTML5 Audio Player Engine
// Core playback functionality

const Player = {
    audio: null,
    currentSong: null,
    queue: [],
    queueIndex: -1,
    originalQueue: [],
    isShuffled: false,
    repeatMode: 'off', // 'off', 'all', 'one'
    isPlaying: false,

    init() {
        this.audio = document.getElementById('audioPlayer');
        if (!this.audio) {
            console.error('Audio element not found');
            return;
        }

        this.setupEventListeners();
        this.loadState();
        this.updateUI();
    },

    setupEventListeners() {
        // Audio events
        this.audio.addEventListener('loadedmetadata', () => this.onLoadedMetadata());
        this.audio.addEventListener('timeupdate', () => this.onTimeUpdate());
        this.audio.addEventListener('ended', () => this.onEnded());
        this.audio.addEventListener('play', () => this.onPlay());
        this.audio.addEventListener('pause', () => this.onPause());
        this.audio.addEventListener('error', (e) => this.onError(e));

        // Player controls
        document.getElementById('btnPlayPause')?.addEventListener('click', () => this.togglePlayPause());
        document.getElementById('btnNext')?.addEventListener('click', () => this.next());
        document.getElementById('btnPrevious')?.addEventListener('click', () => this.previous());
        document.getElementById('btnShuffle')?.addEventListener('click', () => this.toggleShuffle());
        document.getElementById('btnRepeat')?.addEventListener('click', () => this.cycleRepeat());

        // Progress bar
        const progressContainer = document.getElementById('progressBarContainer');
        if (progressContainer) {
            progressContainer.addEventListener('click', (e) => this.seek(e));
        }

        // Volume
        document.getElementById('btnMute')?.addEventListener('click', () => this.toggleMute());
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            volumeSlider.addEventListener('click', (e) => this.setVolumeFromClick(e));
        }

        // Player artwork click
        document.getElementById('playerArtwork')?.addEventListener('click', () => this.openNowPlaying());

        // Favorite
        document.getElementById('playerFavorite')?.addEventListener('click', () => this.toggleFavorite());
        document.getElementById('nowPlayingFavorite')?.addEventListener('click', () => this.toggleFavorite());
    },

    loadState() {
        const volume = Storage.getVolume();
        this.audio.volume = volume;
        this.updateVolumeUI(volume);

        this.isShuffled = Storage.getShuffle();
        this.repeatMode = Storage.getRepeat();
        this.updateControlsUI();
    },

    playSong(songId, queueSongs = null) {
        const song = MUSIC_DATA.getSongById(songId);
        if (!song) return;

        // If new queue provided, use it
        if (queueSongs) {
            this.queue = [...queueSongs];
            this.originalQueue = [...queueSongs];
            this.queueIndex = this.queue.indexOf(songId);

            if (this.isShuffled) {
                this.shuffleQueue();
            }
        } else if (this.queue.length === 0) {
            // If no queue, create one with all songs
            this.queue = MUSIC_DATA.songs.map(s => s.id);
            this.originalQueue = [...this.queue];
            this.queueIndex = this.queue.indexOf(songId);

            if (this.isShuffled) {
                this.shuffleQueue();
            }
        } else {
            // Find song in existing queue
            this.queueIndex = this.queue.indexOf(songId);
            if (this.queueIndex === -1) {
                // Song not in queue, add it
                this.queue.push(songId);
                this.queueIndex = this.queue.length - 1;
            }
        }

        this.currentSong = song;
        this.audio.src = song.audio;
        this.audio.load();

        this.play().then(() => {
            Storage.addToRecentlyPlayed(songId);
            this.updateUI();
            this.updateQueue();

            // Dispatch event for other components
            window.dispatchEvent(new CustomEvent('songChanged', { detail: song }));
        });
    },

    async play() {
        try {
            await this.audio.play();
            this.isPlaying = true;
        } catch (error) {
            console.error('Playback failed:', error);
            Animations.showToast('Unable to play this track', 'error');
        }
    },

    pause() {
        this.audio.pause();
        this.isPlaying = false;
    },

    togglePlayPause() {
        if (!this.currentSong) {
            const songs = MUSIC_DATA.songs;
            if (songs.length > 0) {
                this.playSong(songs[0].id, songs.map(s => s.id));
            }
            return;
        }

        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    },

    next() {
        if (this.queue.length === 0) return;

        if (this.repeatMode === 'one') {
            this.audio.currentTime = 0;
            this.play();
            return;
        }

        this.queueIndex++;

        if (this.queueIndex >= this.queue.length) {
            if (this.repeatMode === 'all') {
                this.queueIndex = 0;
            } else {
                this.pause();
                return;
            }
        }

        const nextSongId = this.queue[this.queueIndex];
        this.playSong(nextSongId);
    },

    previous() {
        if (this.audio.currentTime > 3) {
            this.audio.currentTime = 0;
            return;
        }

        if (this.queue.length === 0) return;

        this.queueIndex--;

        if (this.queueIndex < 0) {
            if (this.repeatMode === 'all') {
                this.queueIndex = this.queue.length - 1;
            } else {
                this.queueIndex = 0;
                this.audio.currentTime = 0;
                return;
            }
        }

        const prevSongId = this.queue[this.queueIndex];
        this.playSong(prevSongId);
    },

    seek(event) {
        const rect = event.currentTarget.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;
        this.audio.currentTime = percent * this.audio.duration;
    },

    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        Storage.setShuffle(this.isShuffled);

        if (this.isShuffled) {
            this.shuffleQueue();
            Animations.showToast('Shuffle on', 'success');
        } else {
            this.restoreQueue();
            Animations.showToast('Shuffle off', 'info');
        }

        this.updateControlsUI();
        this.updateQueue();
    },

    shuffleQueue() {
        if (this.queue.length === 0) return;

        const currentSongId = this.queue[this.queueIndex];
        const remaining = this.queue.slice(this.queueIndex + 1);
        const shuffledRemaining = shuffleArray(remaining);

        this.queue = [currentSongId, ...shuffledRemaining];
        this.queueIndex = 0;
    },

    restoreQueue() {
        if (this.originalQueue.length === 0) return;

        const currentSongId = this.queue[this.queueIndex];
        this.queue = [...this.originalQueue];
        this.queueIndex = this.queue.indexOf(currentSongId);
    },

    cycleRepeat() {
        const modes = ['off', 'all', 'one'];
        const currentIndex = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentIndex + 1) % modes.length];
        Storage.setRepeat(this.repeatMode);

        const messages = {
            off: 'Repeat off',
            all: 'Repeat all',
            one: 'Repeat one'
        };

        Animations.showToast(messages[this.repeatMode], 'info');
        this.updateControlsUI();
    },

    toggleMute() {
        if (this.audio.volume > 0) {
            this.lastVolume = this.audio.volume;
            this.audio.volume = 0;
        } else {
            this.audio.volume = this.lastVolume || 0.5;
        }
        this.updateVolumeUI(this.audio.volume);
        Storage.setVolume(this.audio.volume);
    },

    setVolumeFromClick(event) {
        const rect = event.currentTarget.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;
        const volume = Math.max(0, Math.min(1, percent));
        this.audio.volume = volume;
        this.updateVolumeUI(volume);
        Storage.setVolume(volume);
    },

    toggleFavorite() {
        if (!this.currentSong) return;

        const isFavorite = Storage.toggleFavorite(this.currentSong.id);

        document.querySelectorAll('.player-favorite, .now-playing-favorite').forEach(btn => {
            btn.classList.toggle('active', isFavorite);
        });

        const message = isFavorite ? 'Added to Favorites' : 'Removed from Favorites';
        Animations.showToast(message, 'success');

        window.dispatchEvent(new Event('favoritesChanged'));
    },

    openNowPlaying() {
        const modal = document.getElementById('nowPlayingModal');
        if (modal) {
            modal.classList.add('open');
            this.updateNowPlayingUI();
        }
    },

    // Event handlers
    onLoadedMetadata() {
        const duration = document.getElementById('timeDuration');
        if (duration) {
            duration.textContent = formatDuration(this.audio.duration);
        }
    },

    onTimeUpdate() {
        if (!this.audio.duration) return;

        const progress = (this.audio.currentTime / this.audio.duration) * 100;
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.setProperty('--progress', progress + '%');
        }

        const currentTime = document.getElementById('timeCurrent');
        if (currentTime) {
            currentTime.textContent = formatDuration(this.audio.currentTime);
        }
    },

    onEnded() {
        this.next();
    },

    onPlay() {
        this.isPlaying = true;
        document.getElementById('btnPlayPause')?.classList.add('playing');
    },

    onPause() {
        this.isPlaying = false;
        document.getElementById('btnPlayPause')?.classList.remove('playing');
    },

    onError(error) {
        console.error('Audio error:', error);
        Animations.showToast('Error playing track', 'error');
    },

    // UI Updates
    updateUI() {
        if (!this.currentSong) return;

        // Player artwork
        const playerArtworkImg = document.getElementById('playerArtworkImg');
        if (playerArtworkImg) {
            Animations.crossfadeArtwork(playerArtworkImg, this.currentSong.cover);
        }

        // Player info
        const playerTitle = document.getElementById('playerTitle');
        const playerArtist = document.getElementById('playerArtist');
        if (playerTitle) playerTitle.textContent = this.currentSong.title;
        if (playerArtist) playerArtist.textContent = this.currentSong.artist;

        // Favorite button
        const isFavorite = Storage.isFavorite(this.currentSong.id);
        document.querySelectorAll('.player-favorite, .now-playing-favorite').forEach(btn => {
            btn.classList.toggle('active', isFavorite);
        });

        // Play/pause button
        document.getElementById('btnPlayPause')?.classList.toggle('playing', this.isPlaying);

        // Now Playing
        this.updateNowPlayingUI();
    },

    updateNowPlayingUI() {
        if (!this.currentSong) return;

        const artwork = document.getElementById('nowPlayingArtwork');
        const title = document.getElementById('nowPlayingTitle');
        const artist = document.getElementById('nowPlayingArtist');
        const backdrop = document.getElementById('nowPlayingBackdrop');

        if (artwork) artwork.src = this.currentSong.cover;
        if (title) title.textContent = this.currentSong.title;
        if (artist) artist.textContent = this.currentSong.artist;
        if (backdrop) {
            backdrop.style.backgroundImage = `url(${this.currentSong.cover})`;
        }
    },

    updateControlsUI() {
        const shuffleBtn = document.getElementById('btnShuffle');
        const repeatBtn = document.getElementById('btnRepeat');

        if (shuffleBtn) {
            shuffleBtn.classList.toggle('active', this.isShuffled);
        }

        if (repeatBtn) {
            repeatBtn.classList.remove('active', 'repeat-one');
            if (this.repeatMode === 'all') {
                repeatBtn.classList.add('active');
            } else if (this.repeatMode === 'one') {
                repeatBtn.classList.add('active', 'repeat-one');
            }
        }
    },

    updateVolumeUI(volume) {
        const volumeBar = document.getElementById('volumeBar');
        if (volumeBar) {
            volumeBar.style.setProperty('--volume', (volume * 100) + '%');
        }

        const muteBtn = document.getElementById('btnMute');
        if (muteBtn) {
            muteBtn.classList.remove('low', 'muted');
            if (volume === 0) {
                muteBtn.classList.add('muted');
            } else if (volume < 0.5) {
                muteBtn.classList.add('low');
            }
        }
    },

    updateQueue() {
        // This will be called by queue UI component
        window.dispatchEvent(new Event('queueChanged'));
    },

    addToQueue(songId) {
        if (!this.queue.includes(songId)) {
            this.queue.push(songId);
            this.updateQueue();
            Animations.showToast('Added to queue', 'success');
        }
    },

    removeFromQueue(songId) {
        const index = this.queue.indexOf(songId);
        if (index > -1 && index !== this.queueIndex) {
            this.queue.splice(index, 1);
            if (index < this.queueIndex) {
                this.queueIndex--;
            }
            this.updateQueue();
            Animations.showToast('Removed from queue', 'info');
        }
    },

    clearQueue() {
        const currentSong = this.queue[this.queueIndex];
        this.queue = [currentSong];
        this.queueIndex = 0;
        this.updateQueue();
        Animations.showToast('Queue cleared', 'info');
    }
};
