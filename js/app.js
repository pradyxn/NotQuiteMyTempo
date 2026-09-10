// Main Application Entry Point
// Initializes all modules and manages the application lifecycle

const App = {
    initialized: false,

    async init() {
        if (this.initialized) return;

        console.log('🎵 Initializing Music Player...');

        try {
            // Load music database first
            console.log('📀 Loading music database...');
            await loadMusicData();

            // Initialize storage
            this.initStorage();

            // Initialize core modules
            Player.init();
            PlaylistManager.init();
            Search.init();
            UI.init();

            // Setup global event listeners
            this.setupGlobalListeners();

            // Apply saved preferences
            this.applySavedPreferences();

            // Setup keyboard shortcuts
            this.setupKeyboardShortcuts();

            this.initialized = true;
            console.log('✅ Music Player initialized successfully');

            // Show welcome toast
            setTimeout(() => {
                Animations.showToast('Welcome to Music', 'success');
            }, 500);

        } catch (error) {
            console.error('❌ Failed to initialize Music Player:', error);
            Animations.showToast('Failed to initialize player', 'error');
        }
    },

    initStorage() {
        // Ensure storage is working
        try {
            const testKey = 'musicPlayer_test';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
        } catch (error) {
            console.error('LocalStorage not available:', error);
            Animations.showToast('Storage not available', 'error');
        }
    },

    setupGlobalListeners() {
        // Window events
        window.addEventListener('beforeunload', () => {
            this.saveState();
        });

        // Visibility change - pause when tab is hidden (optional)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && Player.isPlaying) {
                // Optionally pause when tab is hidden
                // Player.pause();
            }
        });

        // Online/offline status
        window.addEventListener('online', () => {
            Animations.showToast('Back online', 'success');
        });

        window.addEventListener('offline', () => {
            Animations.showToast('No internet connection', 'error');
        });

        // Media session API for system controls
        if ('mediaSession' in navigator) {
            this.setupMediaSession();
        }

        // Error handling
        window.addEventListener('error', (e) => {
            console.error('Global error:', e);
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e);
        });
    },

    setupMediaSession() {
        // Update media session when song changes
        window.addEventListener('songChanged', (e) => {
            const song = e.detail;
            if (!song) return;

            navigator.mediaSession.metadata = new MediaMetadata({
                title: song.title,
                artist: song.artist,
                album: song.album,
                artwork: [
                    { src: song.cover, sizes: '512x512', type: 'image/jpeg' }
                ]
            });
        });

        // Media session action handlers
        navigator.mediaSession.setActionHandler('play', () => {
            Player.play();
        });

        navigator.mediaSession.setActionHandler('pause', () => {
            Player.pause();
        });

        navigator.mediaSession.setActionHandler('previoustrack', () => {
            Player.previous();
        });

        navigator.mediaSession.setActionHandler('nexttrack', () => {
            Player.next();
        });

        navigator.mediaSession.setActionHandler('seekto', (details) => {
            if (details.seekTime && Player.audio) {
                Player.audio.currentTime = details.seekTime;
            }
        });
    },

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // Space - Play/Pause
            if (e.code === 'Space') {
                e.preventDefault();
                Player.togglePlayPause();
            }

            // Arrow Right - Next track
            if (e.code === 'ArrowRight' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                Player.next();
            }

            // Arrow Left - Previous track
            if (e.code === 'ArrowLeft' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                Player.previous();
            }

            // Arrow Up - Volume up
            if (e.code === 'ArrowUp' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                const newVolume = Math.min(1, Player.audio.volume + 0.1);
                Player.audio.volume = newVolume;
                Player.updateVolumeUI(newVolume);
                Storage.setVolume(newVolume);
            }

            // Arrow Down - Volume down
            if (e.code === 'ArrowDown' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                const newVolume = Math.max(0, Player.audio.volume - 0.1);
                Player.audio.volume = newVolume;
                Player.updateVolumeUI(newVolume);
                Storage.setVolume(newVolume);
            }

            // M - Mute/Unmute
            if (e.code === 'KeyM' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                Player.toggleMute();
            }

            // S - Shuffle
            if (e.code === 'KeyS' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                Player.toggleShuffle();
            }

            // R - Repeat
            if (e.code === 'KeyR' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                Player.cycleRepeat();
            }

            // F - Favorite current song
            if (e.code === 'KeyF' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                Player.toggleFavorite();
            }

            // L - Lyrics
            if (e.code === 'KeyL' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                UI.togglePanel('lyrics');
            }

            // Q - Queue
            if (e.code === 'KeyQ' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                UI.togglePanel('queue');
            }

            // / or Cmd+K - Focus search
            if (e.code === 'Slash' || (e.code === 'KeyK' && (e.metaKey || e.ctrlKey))) {
                e.preventDefault();
                document.getElementById('searchInput')?.focus();
            }

            // Escape - Close panels/modals
            if (e.code === 'Escape') {
                e.preventDefault();
                Object.keys(UI.panels).forEach(panelName => {
                    UI.closePanel(panelName);
                });
                document.getElementById('nowPlayingModal')?.classList.remove('open');
                document.getElementById('searchInput')?.blur();
            }
        });
    },

    applySavedPreferences() {
        // Theme
        const theme = Storage.getTheme();
        if (theme === 'light') {
            document.body.classList.add('light-theme');
        }

        // Volume
        const volume = Storage.getVolume();
        if (Player.audio) {
            Player.audio.volume = volume;
            Player.updateVolumeUI(volume);
        }

        // Shuffle
        const shuffle = Storage.getShuffle();
        Player.isShuffled = shuffle;
        Player.updateControlsUI();

        // Repeat
        const repeat = Storage.getRepeat();
        Player.repeatMode = repeat;
        Player.updateControlsUI();
    },

    saveState() {
        // Save current state before page unload
        Storage.setVolume(Player.audio?.volume || 1);
        Storage.setShuffle(Player.isShuffled);
        Storage.setRepeat(Player.repeatMode);
    },

    // Utility: Check browser compatibility
    checkCompatibility() {
        const features = {
            audio: !!document.createElement('audio').canPlayType,
            localStorage: (() => {
                try {
                    return 'localStorage' in window && window.localStorage !== null;
                } catch (e) {
                    return false;
                }
            })(),
            flexbox: CSS.supports('display', 'flex'),
            grid: CSS.supports('display', 'grid')
        };

        const unsupported = Object.entries(features)
            .filter(([, supported]) => !supported)
            .map(([feature]) => feature);

        if (unsupported.length > 0) {
            console.warn('Unsupported features:', unsupported);
            return false;
        }

        return true;
    },

    // Debug utilities
    debug: {
        logState() {
            console.group('🎵 Player State');
            console.log('Current Song:', Player.currentSong);
            console.log('Queue:', Player.queue);
            console.log('Queue Index:', Player.queueIndex);
            console.log('Shuffle:', Player.isShuffled);
            console.log('Repeat:', Player.repeatMode);
            console.log('Volume:', Player.audio?.volume);
            console.log('Playing:', Player.isPlaying);
            console.groupEnd();
        },

        logStorage() {
            console.group('💾 Storage');
            console.log('Favorites:', Storage.getFavorites());
            console.log('Playlists:', Storage.getPlaylists());
            console.log('Recently Played:', Storage.getRecentlyPlayed());
            console.log('Theme:', Storage.getTheme());
            console.groupEnd();
        },

        clearAll() {
            if (confirm('Clear all data?')) {
                Storage.clear();
                location.reload();
            }
        }
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

// Expose to window for debugging
window.MusicApp = App;
window.Player = Player;
window.Storage = Storage;

// Service Worker registration (optional - for PWA support)
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', () => {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(reg => console.log('Service Worker registered'))
        //     .catch(err => console.error('Service Worker registration failed:', err));
    });
}

// Handle focus/blur for better UX
let lastInteractionTime = Date.now();
document.addEventListener('click', () => {
    lastInteractionTime = Date.now();
});

document.addEventListener('keydown', () => {
    lastInteractionTime = Date.now();
});

// Prevent accidental navigation
window.addEventListener('beforeunload', (e) => {
    if (Player.isPlaying && Date.now() - lastInteractionTime < 5000) {
        e.preventDefault();
        e.returnValue = '';
    }
});

console.log(`
╔═══════════════════════════════════════╗
║                                       ║
║     🎵  Apple Music-Inspired         ║
║        Music Player                   ║
║                                       ║
║     Built with HTML, CSS, JS          ║
║                                       ║
╚═══════════════════════════════════════╝
`);
