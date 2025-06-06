# Audio Noise Cancellation App

A real-time audio processing web application that uses spectral subtraction to isolate changing sounds from background noise. Built with React and the Web Audio API.

![Audio Noise Cancellation Demo](https://img.shields.io/badge/Status-Active-green) ![React](https://img.shields.io/badge/React-19.1.0-blue) ![Web Audio API](https://img.shields.io/badge/Web%20Audio-API-orange)

## 🎯 Features

- **Real-time noise cancellation** using spectral subtraction algorithm
- **Background noise profiling** with 2-second calibration period
- **Dynamic gain adjustment** based on audio content analysis
- **Modern UI** with gradient styling and smooth animations
- **Browser-based** - no server or external dependencies required
- **Microphone permission handling** with user-friendly error messages

## 🚀 How It Works

The application implements a spectral subtraction noise reduction technique:

1. **Audio Capture**: Accesses your microphone with noise suppression disabled for manual control
2. **Background Profiling**: Analyzes 2 seconds of background noise to create a frequency profile
3. **Real-time Analysis**: Compares incoming audio against the background profile
4. **Selective Amplification**: Only amplifies frequencies that significantly differ from background noise
5. **Dynamic Output**: Applies variable gain based on the amount of detected change

### Technical Implementation

- **FFT Size**: 2048 for detailed frequency analysis
- **Threshold**: 6dB difference required for sound amplification
- **Sampling**: 100ms intervals during calibration
- **Change Detection**: Monitors frequency bins for significant deviations

## 🛠️ Installation

### Prerequisites

- Node.js
- npm or yarn
- Modern web browser with Web Audio API support

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/CeponisM/noise-extraction.git
   cd noise-extraction
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

## 📱 Usage

### Step-by-Step Guide

1. **Start Audio Processing**
   - Click "Start Audio Processing" button
   - Grant microphone permissions when prompted

2. **Calibrate Background Noise**
   - Click "Calibrate Background Noise"
   - **Stay completely quiet** for 2 seconds
   - The app will capture and analyze ambient noise

3. **Begin Speaking**
   - After calibration, speak normally
   - Only sounds significantly different from background will be audible
   - Background noise will be substantially reduced

4. **Stop When Done**
   - Click "Stop Processing" to end the session

### Best Practices

- **Quiet Environment**: Calibrate in the same acoustic environment where you'll be speaking
- **Consistent Setup**: Keep microphone position consistent between calibration and use
- **Natural Speech**: Speak at normal volume - the app will automatically adjust gain

## 🔧 Configuration

### Audio Settings

The app disables browser-level audio processing to maintain full control:

```javascript
audio: {
  noiseSuppression: false,  // Manual noise handling
  echoCancellation: false,  // Preserve natural audio
  autoGainControl: false    // Custom gain management
}
```

### Adjustable Parameters

Key parameters can be modified in the code:

- **FFT Size**: `2048` (frequency resolution)
- **Smoothing**: `0.3` (temporal smoothing)
- **Threshold**: `6dB` (detection sensitivity)
- **Calibration Time**: `2 seconds` (background sampling)

## 🎨 UI Features

- **Dark Theme**: Professional dark interface reduces eye strain
- **Gradient Accents**: Modern visual styling with teal/coral gradients
- **Responsive Design**: Works on desktop and mobile devices
- **Status Indicators**: Clear visual feedback for each operation stage
- **Hover Effects**: Interactive button animations

## 🌐 Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Recommended for best performance |
| Firefox | ✅ Full | Excellent Web Audio API support |
| Safari | ✅ Full | May require user interaction to start |
| Edge | ✅ Full | Chromium-based versions |

## 🔒 Privacy & Security

- **Local Processing**: All audio processing happens in your browser
- **No Data Transmission**: Audio never leaves your device
- **Temporary Storage**: No permanent storage of audio data
- **Permission-Based**: Requires explicit microphone access approval

## 🏗️ Architecture

```
src/
├── App.js          # Main application component
└── index.js        # React DOM rendering

Key Components:
├── Audio Context    # Web Audio API management
├── Noise Profiler   # Background noise analysis
├── Spectral Analyzer # Real-time frequency processing
└── Gain Controller  # Dynamic volume adjustment
```

## 🔧 Development

### Available Scripts

- `npm start` - Run development server
- `npm test` - Execute test suite
- `npm run build` - Create production build
- `npm run eject` - Eject from Create React App

### Building for Production

```bash
npm run build
```

Creates optimized build in `build/` directory ready for deployment.

## 🚨 Troubleshooting

### Common Issues

**"Error accessing microphone"**
- Ensure microphone permissions are granted
- Check if another application is using the microphone
- Try refreshing the page and granting permissions again

**Poor noise cancellation performance**
- Recalibrate in a quieter environment
- Ensure consistent microphone positioning
- Check that background noise is relatively stable

**No audio output**
- Verify browser audio settings
- Check system volume levels
- Ensure speakers/headphones are connected

### Performance Optimization

- Use Chrome for optimal Web Audio API performance
- Close unnecessary browser tabs to free up processing power
- Ensure stable internet connection (though processing is local)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgements

- Web Audio API documentation and community
- React team for the excellent framework
- Spectral subtraction research papers and implementations

---

**Note**: This application requires a modern web browser with Web Audio API support and microphone access. Best performance is achieved in quiet environments with consistent background noise.
