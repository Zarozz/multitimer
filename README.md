# Multiplayer Board Game Timer

A touch-friendly web-based timer application designed for multiplayer board games. Features individual player timers, turn management, configurable time banks, and team collaboration timers.

## 🎮 Features

- **2-12 Players**: Support for various group sizes with intelligent grid layouts
- **Per-Turn Timers**: Optional time limits for each turn that switch to bank time when expired
- **Bank Time Management**: Individual time banks that only count down after per-turn time expires
- **Team Bank Timer**: Shared time pool for rules clarifications and non-player activities
- **Turn Order Management**: Drag-and-drop turn order customization with clockwise flow
- **Color Customization**: 12 beautiful gradient colors inspired by classic board game pieces
- **Touch Optimized**: Large buttons and responsive design perfect for tablets and touch devices
- **Visual Feedback**: Clear active player indicators, next player arrows, and timer state displays

## 🚀 Live Demo

Visit the live application: [https://zarozz.github.io/multitimer](https://zarozz.github.io/multitimer)

## 📱 Usage

### Quick Start
1. Open the application in any modern web browser
2. Configure your game settings using the ⚙️ Settings button
3. Customize players and turn order using the 🔄 Turn Order button
4. Tap the active player's tile to start the timer
5. Tap the same tile again to end the turn and advance to the next player

### Timer Hierarchy
- **Turn Timer**: Counts down first (if enabled)
- **Bank Timer**: Starts counting when turn timer expires
- **No Auto-Advance**: Players control when to end their turn, even after turn timer expires

### Settings Options
- **Player Count**: 2-12 players
- **Bank Time**: 1-180 minutes per player
- **Per-Turn Time**: 10-600 seconds (optional)
- **Team Bank**: 0-60 minutes of shared time
- **Turn Time Toggle**: Enable/disable per-turn time limits

### Player Management
- **Add/Remove Players**: Adjust player count during setup
- **Custom Colors**: Choose from 12 vibrant gradient colors
- **Name Editing**: Customize player names
- **Turn Order**: Drag and drop to reorder players
- **Clockwise Flow**: Automatic clockwise turn progression

## 🛠️ Installation & Development

### Local Development
```bash
# Clone the repository
git clone https://github.com/yourusername/multitimer.git
cd multitimer

# Open in your browser
# Simply open index.html in any modern web browser
# No build process required - it's pure HTML, CSS, and JavaScript
```

### File Structure
```
multitimer/
├── index.html          # Main application page
├── styles.css          # Complete styling and responsive design
├── script.js           # Timer logic and game management
├── README.md           # This file
└── .github/
    └── workflows/
        └── deploy.yml   # GitHub Pages deployment
```

## 🌐 GitHub Pages Deployment

This repository is configured for automatic GitHub Pages deployment. Follow these steps:

### Automatic Deployment (Recommended)

1. **Fork or Clone** this repository to your GitHub account

2. **Enable GitHub Pages**:
   - Go to your repository settings
   - Scroll to "Pages" section
   - Under "Source", select "GitHub Actions"
   - The workflow will automatically deploy on every push to main/master

3. **Access Your Site**:
   - Your timer will be available at: `https://yourusername.github.io/multitimer`
   - Replace `yourusername` with your actual GitHub username

### Manual Deployment

If you prefer manual deployment:

1. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Under "Source", select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

2. **Access Your Site**:
   - Visit `https://yourusername.github.io/multitimer`

## 🎯 Perfect For

- **Board Game Nights**: Keep track of player turns and thinking time
- **Chess & Strategy Games**: Manage time banks and per-move limits  
- **Tournament Play**: Professional timer management for competitive games
- **Educational Games**: Classroom activities with time management
- **Team Games**: Coordinate individual and team timing

## 🔧 Customization

The application is built with pure HTML, CSS, and JavaScript, making it easy to customize:

- **Colors**: Modify the `boardgameColors` array in `script.js`
- **Layout**: Adjust grid layouts in `styles.css`
- **Features**: Add new functionality in `script.js`
- **Styling**: Update appearance in `styles.css`

## 📱 Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support  
- **Safari**: Full support
- **Mobile Browsers**: Optimized for touch
- **Tablets**: Perfect for board game sessions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎲 Enjoy Your Games!

Perfect timing makes perfect games. Happy gaming! 🎮

---

**Built with ❤️ for the board gaming community**
