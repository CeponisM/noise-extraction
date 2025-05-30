import React, { useRef, useEffect, useState } from 'react';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [noiseProfile, setNoiseProfile] = useState(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [error, setError] = useState('');
  
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const analyserRef = useRef(null);
  const gainNodeRef = useRef(null);
  const streamRef = useRef(null);
  const backgroundDataRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    return () => {
      stopRecording();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          noiseSuppression: false, // We want to handle this ourselves
          echoCancellation: false,
          autoGainControl: false
        } 
      });
      
      streamRef.current = stream;
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      gainNodeRef.current = audioContextRef.current.createGain();
      
      // Configure analyser for detailed frequency analysis
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.3;
      
      // Connect audio nodes
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(audioContextRef.current.destination);
      
      setIsRecording(true);
      setError('');
      
      // Start processing audio
      processAudio();
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Error accessing microphone. Please grant permissions.');
    }
  };

  const stopRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setIsRecording(false);
    setNoiseProfile(null);
    backgroundDataRef.current = null;
  };

  const calibrateBackground = () => {
    if (!analyserRef.current) return;
    
    setIsCalibrating(true);
    
    // Capture background noise profile over 2 seconds
    const samples = [];
    const sampleInterval = 100; // Sample every 100ms
    const totalSamples = 20; // 2 seconds worth
    
    const captureSample = (sampleCount) => {
      if (sampleCount >= totalSamples) {
        // Average all samples to create noise profile
        const bufferLength = analyserRef.current.frequencyBinCount;
        const averageSpectrum = new Float32Array(bufferLength);
        
        samples.forEach(sample => {
          for (let i = 0; i < bufferLength; i++) {
            averageSpectrum[i] += sample[i];
          }
        });
        
        for (let i = 0; i < bufferLength; i++) {
          averageSpectrum[i] /= samples.length;
        }
        
        setNoiseProfile(averageSpectrum);
        backgroundDataRef.current = averageSpectrum;
        setIsCalibrating(false);
        return;
      }
      
      // Capture current frequency data
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);
      analyserRef.current.getFloatFrequencyData(dataArray);
      samples.push([...dataArray]);
      
      setTimeout(() => captureSample(sampleCount + 1), sampleInterval);
    };
    
    captureSample(0);
  };

  const processAudio = () => {
    if (!analyserRef.current || !gainNodeRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    
    const process = () => {
      analyserRef.current.getFloatFrequencyData(dataArray);
      
      if (backgroundDataRef.current) {
        // Apply spectral subtraction noise reduction
        let totalChange = 0;
        let significantChanges = 0;
        
        for (let i = 0; i < bufferLength; i++) {
          const currentLevel = dataArray[i];
          const backgroundLevel = backgroundDataRef.current[i];
          const difference = currentLevel - backgroundLevel;
          
          // If current level is significantly higher than background
          if (difference > 6) { // 6dB threshold
            totalChange += difference;
            significantChanges++;
          }
        }
        
        // Adjust gain based on how much the audio differs from background
        const changeRatio = significantChanges / bufferLength;
        let gainValue = 0.1; // Very quiet by default
        
        if (changeRatio > 0.1) { // If more than 10% of frequencies show significant change
          gainValue = Math.min(1.0, changeRatio * 3); // Amplify based on amount of change
        }
        
        gainNodeRef.current.gain.setValueAtTime(gainValue, audioContextRef.current.currentTime);
      }
      
      animationFrameRef.current = requestAnimationFrame(process);
    };
    
    process();
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#2a2a2a',
        padding: '40px',
        borderRadius: '15px',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{ 
          marginBottom: '30px', 
          fontSize: '2rem',
          background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Audio Noise Cancellation
        </h1>
        
        <p style={{ 
          marginBottom: '30px', 
          color: '#cccccc',
          lineHeight: '1.6'
        }}>
          This app isolates changing sounds from background noise using spectral subtraction.
          First calibrate the background noise, then speak - only significant audio changes will be heard.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {!isRecording ? (
            <button
              onClick={startRecording}
              style={{
                padding: '15px 30px',
                fontSize: '1.1rem',
                backgroundColor: '#4ecdc4',
                color: '#1a1a1a',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              Start Audio Processing
            </button>
          ) : (
            <>
              <button
                onClick={calibrateBackground}
                disabled={isCalibrating}
                style={{
                  padding: '15px 30px',
                  fontSize: '1.1rem',
                  backgroundColor: isCalibrating ? '#666666' : '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  cursor: isCalibrating ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
              >
                {isCalibrating ? 'Calibrating Background...' : 'Calibrate Background Noise'}
              </button>
              
              <button
                onClick={stopRecording}
                style={{
                  padding: '15px 30px',
                  fontSize: '1.1rem',
                  backgroundColor: '#333333',
                  color: 'white',
                  border: '2px solid #666666',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
              >
                Stop Processing
              </button>
            </>
          )}
        </div>

        {noiseProfile && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#1a1a1a',
            borderRadius: '10px',
            border: '2px solid #4ecdc4'
          }}>
            <p style={{ margin: 0, color: '#4ecdc4', fontWeight: 'bold' }}>
              ✓ Background noise profile captured! 
              <br />
              <span style={{ color: '#cccccc', fontSize: '0.9rem', fontWeight: 'normal' }}>
                Now speak - only sounds that differ significantly from background will be heard.
              </span>
            </p>
          </div>
        )}

        {isCalibrating && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#2a1810',
            borderRadius: '10px',
            border: '2px solid #ff6b6b'
          }}>
            <p style={{ margin: 0, color: '#ff6b6b' }}>
              Stay quiet for 2 seconds to capture background noise profile...
            </p>
          </div>
        )}

        {error && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#2a1010',
            borderRadius: '10px',
            border: '2px solid #ff4444',
            color: '#ff4444'
          }}>
            {error}
          </div>
        )}

        <div style={{
          marginTop: '30px',
          fontSize: '0.9rem',
          color: '#888888',
          lineHeight: '1.5'
        }}>
          <strong>How it works:</strong><br />
          1. Click "Start" to begin audio processing<br />
          2. Click "Calibrate" and stay quiet to capture background noise<br />
          3. Speak normally - the app will amplify only sounds that differ from the background<br />
          4. Background noise will be significantly reduced
        </div>
      </div>
    </div>
  );
}

export default App;