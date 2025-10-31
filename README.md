# 🐕‍🦺 Kerb Stop Challenge

A mobile-first web game where users guide a guide dog puppy to stop at kerbs by tapping the screen. Perfect timing = successful training!

## 🎮 Game Overview

Help train a guide dog puppy by mastering the essential skill of stopping at kerbs. Press SPACE or tap the screen to make the puppy stop at the right moment. Complete 10 kerbs to finish the training!

### Features

- **Mobile-optimized gameplay** - Designed for iPhone, iPad, and all mobile devices
- **Progressive difficulty** - 3 difficulty levels with increasing speed
- **Scoring system** - Earn 10 points for perfect stops, 5 for good stops
- **3 attempts per kerb** - Master each kerb or move on
- **Procedural sound effects** - No external audio files needed
- **Share your score** - Social media integration
- **Guide Dogs fundraising** - Direct links to Guide Dogs UK donation page

## 🚀 Quick Start

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/pdewouters/Kerb-stop-challenge.git
cd Kerb-stop-challenge
```

2. Start a local server:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

3. Open in browser:
```
http://localhost:8000
```

## 📁 Project Structure

```
kerb-challenge/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styles (mobile-first)
├── js/
│   ├── main.js         # Entry point
│   ├── game.js         # Main game loop and logic
│   ├── puppy.js        # Puppy class with canvas drawing
│   ├── kerb.js         # Kerb and KerbManager classes
│   ├── ui.js           # UI management
│   ├── audio.js        # Web Audio API sound generation
│   └── utils.js        # Utility functions and helpers
└── assets/
    └── sounds/         # (Optional external sounds)
```

## 🎯 Game Mechanics

### Scoring
- **Perfect Stop** (center of zone): 10 points + "Excellent!"
- **Good Stop** (edge of zone): 5 points + "Good job!"
- **Miss**: 0 points, retry (max 3 attempts)
- **Maximum Score**: 100 points (10 kerbs × 10 points)

### Difficulty Progression
- **Kerbs 1-3:** Slow speed (2 px/frame), large stop zone
- **Kerbs 4-7:** Medium speed (3.5 px/frame), medium zone
- **Kerbs 8-10:** Fast speed (5 px/frame), tight zone

### Controls
- **Desktop:** SPACEBAR to stop
- **Mobile:** TAP anywhere on the game area
- **Pause:** Pause button (top right)
- **Mute:** Sound toggle (top right)

## 🎨 Visual Design

The game uses programmatic canvas drawing for all graphics:

- **Puppy:** Drawn with canvas arcs and ellipses (golden labrador style)
- **Environment:** Pavement texture, road, and kerb edge
- **Effects:** Confetti particles for celebrations
- **UI:** Clean, modern CSS design with smooth animations

## 🔊 Audio

All sounds are generated procedurally using the Web Audio API:

- Walk sound (soft paw steps)
- Sit sound (gentle thud)
- Success chime (ascending notes)
- Perfect sound (3-note melody)
- Miss sound (descending tone)
- Level complete fanfare

No external audio files required!

## 📱 Mobile Optimization

- Responsive design (works on all screen sizes)
- Touch controls optimized
- Prevents default scroll/zoom behaviors
- Web Audio unlock for iOS Safari
- PWA-ready (can be installed on home screen)

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest, including iOS)
- Edge (latest)

Requires:
- HTML5 Canvas
- Web Audio API
- ES6+ JavaScript

## 🎁 Fundraising Integration

The game includes built-in fundraising features:

- **Donation Modal:** Shows after game completion
- **Preset Amounts:** £5, £15, £50, or custom
- **External Links:** Direct to Guide Dogs UK donation page
- **UTM Tracking:** Tracks referrals from the game
- **Social Sharing:** Twitter, Facebook, WhatsApp

All donation links open in a new tab - no payment processing in the game itself.

## 🔧 Configuration

### Adjusting Difficulty

Edit `js/game.js`:

```javascript
this.difficultySettings = {
    1: { speed: 2, label: 'Easy' },      // Kerbs 1-3
    2: { speed: 3.5, label: 'Medium' },  // Kerbs 4-7
    3: { speed: 5, label: 'Hard' }       // Kerbs 8-10
};
```

### Changing Number of Kerbs

Edit `js/kerb.js`:

```javascript
this.totalKerbs = 10; // Change to desired number
```

### Customizing Colors

Edit `js/puppy.js` and `js/kerb.js` for color schemes:

```javascript
this.colorBody = '#FFD700';  // Golden yellow
this.colorDark = '#DAA520';  // Darker gold
// ... etc
```

## 🚀 Deployment

### Netlify (Recommended)

1. Push to GitHub
2. Connect to Netlify
3. Deploy (automatic)

### Vercel

```bash
vercel
```

### GitHub Pages

```bash
git add .
git commit -m "Deploy game"
git push origin main
```

Enable GitHub Pages in repository settings.

## 📊 Analytics (Post-Launch)

To add analytics, include in `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>

<!-- OR Plausible (privacy-friendly) -->
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

## 🐛 Troubleshooting

### Sound not playing on mobile
- Sounds require user interaction to unlock
- Tap the start button to unlock audio context
- Check mute button isn't active

### Canvas not displaying correctly
- Check browser console for errors
- Ensure canvas size is set correctly
- Try hard refresh (Ctrl+Shift+R)

### Touch controls not working
- Ensure `touch-action: none` is set
- Check for event listener conflicts
- Test on actual device (not just dev tools)

## 🤝 Contributing

This is a fundraising project for Guide Dogs UK. Contributions welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (especially on mobile)
5. Submit a pull request

## 📝 License

MIT License - Feel free to use and modify for your own fundraising projects!

## 🙏 Credits

- Game concept: Guide dog training simulator
- Built with: Vanilla JavaScript, HTML5 Canvas, Web Audio API
- Inspired by: Guide Dogs UK's amazing work training assistance dogs

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Contact: [Your contact info]

---

**Remember:** It costs £56,000 to train a guide dog. Every share and donation helps! 🐕‍🦺💛
