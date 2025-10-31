# Image Optimization Guide

## Current Status

The puppy image (`assets/images/28599.jpg`) is currently **3.2MB**, which is quite large for a web game.

For optimal performance, especially on mobile devices, the image should be optimized.

## Recommended Optimizations

### Option 1: Online Tools (Easiest on iPad)

1. **TinyJPG** (https://tinyjpg.com)
   - Upload your image
   - Download the optimized version
   - Replace the file in the repo
   - Target size: ~200-500KB

2. **Squoosh** (https://squoosh.app)
   - Works in browser
   - Drag and drop image
   - Adjust quality slider (70-80% is usually good)
   - Download optimized version

### Option 2: Desktop Tools

If you have access to a desktop computer:

```bash
# Using ImageMagick
convert assets/images/28599.jpg -quality 80 -resize 800x600 assets/images/28599-optimized.jpg

# Using ffmpeg
ffmpeg -i assets/images/28599.jpg -q:v 3 assets/images/28599-optimized.jpg
```

### Option 3: GitHub Actions (Automated)

We could set up automated image optimization on push, but that requires additional setup.

## Target Specifications

For best game performance:

- **File size**: 200-500KB (currently 3.2MB)
- **Dimensions**: 800x600px or smaller (image will be scaled in-game anyway)
- **Format**: JPEG at 75-85% quality, or convert to PNG if you need transparency
- **File name**: Keep as `28599.jpg` or rename to `puppy.jpg`

## Impact

**Before optimization:**
- Load time: 3-5 seconds on 3G
- Total game size: ~3.3MB

**After optimization:**
- Load time: <1 second on 3G
- Total game size: ~500KB
- No visible quality loss in the game

## Next Steps

1. Visit https://tinyjpg.com on your iPad
2. Upload `28599.jpg`
3. Download the optimized version
4. Replace the file on GitHub:
   - Go to: https://github.com/pdewouters/Kerb-stop-challenge/blob/claude/kerb-stop-challenge-game-011CUfGSBBiTwBYWShw5Y1sb/assets/images/28599.jpg
   - Click the "..." menu → "Delete file"
   - Then "Upload files" → drag the optimized version
   - Commit changes

The game will work fine with the current image, but optimization will make it load much faster!
