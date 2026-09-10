# 🎵 Apple Music-Inspired Web Player

A high-fidelity, premium music streaming web application built from scratch using vanilla HTML, CSS, and JavaScript. This project demonstrates professional frontend development skills with Apple-inspired design aesthetics, smooth animations, and complete music player functionality.

![Music Player](./preview.png)

## ✨ Features

### 🎨 Premium Design
- **Apple-inspired UI/UX** with San Francisco typography
- **Dark and Light themes** with smooth transitions
- **Glassmorphism effects** and subtle translucency
- **Sophisticated animations** using spring physics
- **Responsive design** for desktop, tablet, and mobile

### 🎵 Music Playback
- **Full HTML5 audio engine** with play, pause, seek
- **Queue management** with shuffle and repeat modes
- **Previous/Next track** with smart restart logic
- **Volume control** with mute functionality
- **Progress tracking** with real-time updates
- **Now Playing** full-screen modal experience

### 📚 Library Management
- **33 curated songs** from your personal collection
- **Dynamic playlists** with create, edit, delete
- **Favorites system** with persistent storage
- **Recently Played** automatic tracking
- **Album and Artist views** organized by metadata

### 🔍 Search
- **Real-time search** across songs, albums, and artists
- **Instant results** with debounced input
- **Grouped results** by content type
- **Search highlighting** and filtering

### 🎭 Interactive Features
- **Music note animations** on play button clicks
- **Magnetic button effects** for major CTAs
- **Toast notifications** for user feedback
- **Context menus** for song options
- **Artwork transitions** with crossfade effects
- **Device connection** simulation UI

### 💾 Data Persistence
- **LocalStorage** for all user data
- **Favorites** saved across sessions
- **Playlists** persist between visits
- **Volume and preferences** remembered
- **Recently played** history maintained

### ⌨️ Keyboard Shortcuts
- `Space` - Play/Pause
- `Cmd/Ctrl + →` - Next track
- `Cmd/Ctrl + ←` - Previous track
- `Cmd/Ctrl + ↑` - Volume up
- `Cmd/Ctrl + ↓` - Volume down
- `Cmd/Ctrl + M` - Mute/Unmute
- `Cmd/Ctrl + S` - Toggle shuffle
- `Cmd/Ctrl + R` - Cycle repeat
- `Cmd/Ctrl + F` - Favorite current song
- `Cmd/Ctrl + L` - Open lyrics
- `Cmd/Ctrl + Q` - Open queue
- `Cmd/Ctrl + K` or `/` - Focus search
- `Esc` - Close panels/modals

### ♿ Accessibility
- **Semantic HTML5** structure
- **ARIA labels** for screen readers
- **Keyboard navigation** fully supported
- **Focus states** clearly visible
- **Reduced motion** support
- **High contrast** mode compatible

## 🛠️ Technology Stack

### Core Technologies
- **HTML5** - Semantic structure and Audio API
- **CSS3** - Custom properties, Grid, Flexbox, animations
- **Vanilla JavaScript** - ES6+ features, no frameworks

### Web APIs Used
- **HTML5 Audio API** - Music playback
- **LocalStorage API** - Data persistence
- **Media Session API** - System media controls
- **Intersection Observer** - Performance optimizations

### Design System
- **CSS Variables** - Theming and consistency
- **San Francisco Pro** - Typography (with fallbacks)
- **Spring animations** - Natural motion physics
- **Component architecture** - Reusable patterns

## 📁 Project Structure

```
apple-music-player/
│
├── index.html                 # Main HTML structure
│
├── css/
│   ├── style.css             # Core styles and design system
│   ├── animations.css        # Animations and transitions
│   └── responsive.css        # Responsive breakpoints
│
├── js/
│   ├── app.js                # Main application entry point
│   ├── player.js             # Audio player engine
│   ├── music-data.js         # Music library and metadata
│   ├── playlists.js          # Playlist management
│   ├── search.js             # Search functionality
│   ├── storage.js            # LocalStorage management
│   ├── animations.js         # Animation utilities
│   └── ui.js                 # UI rendering and navigation
│
├── Music/                    # Source music files
├── assets/
│   ├── covers/               # Extracted album artwork
│   └── data/                 # Generated music metadata
│
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (for audio file loading)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/apple-music-player.git
   cd apple-music-player
   ```

2. **Add album artwork** (optional)
   - Place album cover images in `assets/covers/`
   - Images should be square (1:1 aspect ratio)
   - Recommended size: 512x512px or higher
   - Format: JPG, PNG, or WebP

3. **Run a local server**

   **Option 1: Python**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```

   **Option 2: Node.js (http-server)**
   ```bash
   npx http-server -p 8000
   ```

   **Option 3: PHP**
   ```bash
   php -S localhost:8000
   ```

   **Option 4: VS Code Live Server**
   - Install "Live Server" extension
   - Right-click `index.html` → "Open with Live Server"

4. **Open in browser**
   ```
   http://localhost:8000
   ```

## 🎨 Customization

### Changing the Color Scheme

Edit `css/style.css` and modify the CSS variables:

```css
:root {
    --color-accent: #fa2d48;        /* Primary accent color */
    --color-accent-hover: #ff4057;  /* Hover state */
}
```

### Adding Your Own Music

1. **Copy your audio files** to `Music/`
2. **Update** `js/music-data.js` with your song metadata:

```javascript
{
    id: 1,
    title: "Your Song Title",
    artist: "Artist Name",
    album: "Album Name",
   cover: "assets/covers/your-cover.jpg",
   audio: "Music/your-song.mp3",
    duration: 240,  // in seconds
    genre: "Genre"
}
```

3. **Add album artwork** to `assets/covers/`

### Changing Typography

The app uses San Francisco Pro with system font fallbacks. To change:

```css
:root {
    --font-display: "Your Display Font", sans-serif;
    --font-text: "Your Text Font", sans-serif;
}
```

## 🏗️ Architecture

### Component Overview

**Player Engine** (`player.js`)
- Manages audio playback and state
- Handles queue, shuffle, and repeat
- Controls volume and seeking
- Fires events for UI updates

**Storage Manager** (`storage.js`)
- Abstracts LocalStorage operations
- Manages favorites, playlists, preferences
- Handles data serialization

**UI Controller** (`ui.js`)
- Renders views and components
- Manages navigation and panels
- Updates DOM based on state changes

**Playlist Manager** (`playlists.js`)
- CRUD operations for playlists
- Song addition/removal
- Playlist rendering

**Search** (`search.js`)
- Real-time search across library
- Result filtering and rendering
- Debounced input handling

**Animations** (`animations.js`)
- Music note burst effects
- Toast notifications
- Transition utilities

### State Management

State is managed through a combination of:
- **Player state** in `Player` object
- **Persistent state** in `LocalStorage`
- **UI state** in `UI` object
- **Custom events** for cross-component communication

### Event System

Custom events for loose coupling:
- `songChanged` - When current song changes
- `queueChanged` - When queue is modified
- `favoritesChanged` - When favorites are updated
- `playlistsChanged` - When playlists are modified
- `navigateTo` - For view navigation

## 🎯 Features Demonstrated

### Frontend Skills
- **DOM Manipulation** - Dynamic content rendering
- **Event Handling** - User interactions and custom events
- **State Management** - Without frameworks
- **Modular Architecture** - Separated concerns
- **Responsive Design** - Mobile-first approach
- **Performance** - Optimized animations and rendering

### CSS Techniques
- **CSS Variables** - Dynamic theming
- **Grid & Flexbox** - Modern layouts
- **Animations** - Keyframes and transitions
- **Pseudo-elements** - Advanced selectors
- **Media Queries** - Responsive breakpoints
- **Backdrop Filter** - Glassmorphism

### JavaScript Patterns
- **Module Pattern** - Encapsulation
- **Event-Driven** - Loose coupling
- **Factory Functions** - Object creation
- **Debouncing** - Performance optimization
- **LocalStorage** - Data persistence
- **ES6+ Features** - Modern syntax

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+

## 🐛 Known Limitations

1. **Audio Format Support** - Browser-dependent (MP3 widely supported)
2. **LocalStorage Limits** - ~5-10MB depending on browser
3. **No Offline Support** - Requires server for audio loading
4. **No Real Lyrics API** - Uses sample lyrics
5. **Device Connection** - Simulated UI only

## 🚀 Future Enhancements

### Potential Improvements
- [ ] Real lyrics API integration (Genius, Musixmatch)
- [ ] Waveform visualization
- [ ] Equalizer controls
- [ ] Crossfade between tracks
- [ ] Gesture controls for mobile
- [ ] PWA support with service workers
- [ ] Social sharing features
- [ ] Collaborative playlists
- [ ] Import/export playlists
- [ ] Drag and drop queue reordering

### Backend Integration
- [ ] User authentication
- [ ] Cloud playlist sync
- [ ] Music streaming API
- [ ] Real device casting (Chromecast, AirPlay)
- [ ] Music recommendations
- [ ] Listen history analytics

## 📄 License

This project is for **portfolio and educational purposes**. 

**Important Notes:**
- Music files are NOT included in this repository
- Use only music you have rights to use
- Album artwork should be properly licensed
- Do not distribute copyrighted content

For actual deployment, ensure you have:
- Proper music licensing
- Copyright for all artwork
- Terms of service for streaming

## 🙏 Acknowledgments

- **Design Inspiration** - Apple Music
- **Typography** - San Francisco Pro (Apple)
- **Icons** - Feather Icons
- **Music Collection** - Personal library (not included)

## 👨‍💻 Development

### Debug Mode

Open browser console and use:

```javascript
// Log current player state
MusicApp.debug.logState()

// Log storage data
MusicApp.debug.logStorage()

// Clear all data
MusicApp.debug.clearAll()
```

### Performance Tips

1. **Optimize images** - Compress album artwork
2. **Lazy load** - Load images as needed
3. **Debounce** - Already implemented for search
4. **Reduce animations** - For lower-end devices

## 📞 Contact

Created by **[Your Name]**
- Portfolio: [your-portfolio.com]
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourusername)
- Email: your.email@example.com

## ⭐ Show Your Support

If you found this project helpful or impressive, please give it a star on GitHub!

---

**Built with ❤️ using vanilla HTML, CSS, and JavaScript**

*Last Updated: September 2026*
