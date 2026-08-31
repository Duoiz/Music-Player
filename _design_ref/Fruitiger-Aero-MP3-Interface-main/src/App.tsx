import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Howl } from 'howler';
import './App.css';

interface Track {
  id: number;
  name: string;
  duration: number;
}

const TRACKS: Track[] = [
  { id: 1,  name: 'home menu',          duration: 245 },
  { id: 2,  name: 'reflections',        duration: 198 },
  { id: 3,  name: 'aero garden',        duration: 312 },
  { id: 4,  name: 'distant ocean',      duration: 267 },
  { id: 5,  name: 'crystal settings',   duration: 189 },
  { id: 6,  name: 'azure dreams',       duration: 223 },
  { id: 7,  name: 'glass whispers',     duration: 256 },
  { id: 8,  name: 'stellar glow',       duration: 301 },
  { id: 9,  name: 'luminescence',       duration: 175 },
  { id: 10, name: 'chrome horizon',     duration: 289 },
];

const BAR_COUNT = 20;
const WAVE_HEIGHTS = Array.from({ length: BAR_COUNT }, (_, i) => ({
  min: 4 + (i % 3) * 2,
  max: 16 + ((i * 7 + 13) % 22),
  duration: 0.35 + (i % 5) * 0.07,
  delay: (i % 4) * 0.06,
}));

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec < 10 ? '0' : ''}${sec}`;
}

export default function App() {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying]       = useState(false);
  const [currentTime, setCurrentTime]   = useState(0);
  const [volume, setVolume]             = useState(0.75);
  const [showPlaylist, setShowPlaylist] = useState(true);

  const audioRef  = useRef<Howl | null>(null);
  const timerRef  = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    audioRef.current = new Howl({
      src: ['data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=='],
      volume,
    });
  }, []);

  useEffect(() => { audioRef.current?.volume(volume); }, [volume]);

  useEffect(() => {
    clearInterval(timerRef.current);
    if (!isPlaying) return;
    timerRef.current = setInterval(() => {
      setCurrentTime(prev => {
        const next = prev + 1;
        if (next >= TRACKS[currentTrack].duration) {
          setCurrentTrack(t => (t + 1) % TRACKS.length);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [isPlaying, currentTrack]);

  const togglePlay = () => {
    if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
    else           { audioRef.current?.play();  setIsPlaying(true);  }
  };

  const handleNext = () => { setCurrentTrack(t => (t + 1) % TRACKS.length); setCurrentTime(0); };
  const handlePrev = () => { setCurrentTrack(t => (t - 1 + TRACKS.length) % TRACKS.length); setCurrentTime(0); };

  const selectTrack = (i: number) => { setCurrentTrack(i); setCurrentTime(0); };

  const progress = TRACKS[currentTrack].duration
    ? (currentTime / TRACKS[currentTrack].duration) * 100
    : 0;

  return (
    <div style={{ width:'100%', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' }}>

      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 20 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        transition={{ duration: 0.5, type: 'spring', damping: 18 }}
        style={{ width: '100%', maxWidth: '620px', zIndex: 10 }}
      >

        {/* ── Window ── */}
        <div className="glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>

          {/* Title Bar */}
          <div className="title-bar">
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <div className="green-orb" />
              <span className="font-orbitron" style={{ fontSize:'10px', letterSpacing:'2px' }}>
                DREAM OS · MEDIA
              </span>
            </div>
            <div style={{ display:'flex', gap:'6px' }}>
              {['#e0b830','#e0b830','#e03030'].map((c, i) => (
                <div key={i} style={{
                  width:'14px', height:'14px', borderRadius:'50%',
                  background: `radial-gradient(circle at 35% 35%, ${i===2?'#ff8080':i===1?'#ffe080':'#ffe080'}, ${c})`,
                  border:'1px solid rgba(0,0,0,0.12)', cursor:'pointer',
                  boxShadow:`0 0 4px ${c}88`
                }} />
              ))}
            </div>
          </div>

          {/* Visualizer / Now Playing */}
          <motion.div
            animate={{
              boxShadow: isPlaying
                ? ['0 0 15px rgba(0,200,255,0.3)','0 0 35px rgba(0,200,255,0.6)','0 0 15px rgba(0,200,255,0.3)']
                : '0 0 10px rgba(0,150,220,0.2)',
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
            style={{
              margin: '12px',
              borderRadius: '8px',
              padding: '20px 16px 16px',
              background: 'linear-gradient(180deg, rgba(0,20,50,0.75) 0%, rgba(0,40,90,0.65) 100%)',
              border: '1px solid rgba(0,120,200,0.45)',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4)',
              textAlign: 'center',
            }}
          >
            {/* Music note */}
            <div style={{ fontSize:'28px', marginBottom:'6px', filter:'drop-shadow(0 0 8px rgba(0,200,255,0.8))' }}>♪</div>

            {/* Track name */}
            <div style={{
              fontFamily:'Rajdhani, sans-serif',
              fontSize:'22px',
              fontWeight: 700,
              color:'rgba(120,230,255,0.95)',
              letterSpacing:'1px',
              textShadow:'0 0 14px rgba(0,200,255,0.7)',
              marginBottom:'4px',
              textTransform:'lowercase',
            }}>
              {TRACKS[currentTrack].name}
            </div>

            <div style={{ fontFamily:'Orbitron,sans-serif', fontSize:'10px', color:'rgba(100,190,255,0.6)', letterSpacing:'2px', marginBottom:'16px' }}>
              TRACK {String(currentTrack + 1).padStart(2,'0')} / {TRACKS.length}
            </div>

            {/* Waveform bars */}
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap:'3px', height:'40px' }}>
              {WAVE_HEIGHTS.map((bar, i) => (
                <motion.div
                  key={i}
                  animate={{ height: isPlaying ? [`${bar.min}px`, `${bar.max}px`, `${bar.min}px`] : `${bar.min}px` }}
                  transition={{ duration: bar.duration, delay: bar.delay, repeat: Infinity, repeatType:'mirror', ease:'easeInOut' }}
                  style={{
                    width: '5px',
                    borderRadius: '2px 2px 0 0',
                    background: 'linear-gradient(to top, #00c8ff, #40ffd0)',
                    boxShadow: isPlaying ? '0 0 5px rgba(0,200,255,0.6)' : 'none',
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Progress Bar */}
          <div style={{ padding:'0 12px 4px' }}>
            <div
              onClick={e => {
                const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                const pct  = (e.clientX - rect.left) / rect.width;
                setCurrentTime(Math.floor(pct * TRACKS[currentTrack].duration));
              }}
              style={{
                height:'8px',
                background:'rgba(0,40,80,0.55)',
                borderRadius:'4px',
                border:'1px solid rgba(0,100,180,0.35)',
                cursor:'pointer',
                position:'relative',
                overflow:'visible',
              }}
            >
              <div style={{
                width:`${progress}%`,
                height:'100%',
                borderRadius:'4px',
                background:'linear-gradient(90deg,#0090ff,#00ffc8)',
                boxShadow:'0 0 8px rgba(0,200,255,0.7)',
                position:'relative',
                transition:'width 0.4s linear',
              }}>
                <div style={{
                  position:'absolute', right:'-6px', top:'50%', transform:'translateY(-50%)',
                  width:'12px', height:'12px',
                  background:'radial-gradient(circle at 35% 35%, #fff, #80e8ff)',
                  borderRadius:'50%',
                  boxShadow:'0 0 8px rgba(0,220,255,1)',
                }} />
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:'5px' }}>
              <span style={{ fontFamily:'Orbitron,sans-serif', fontSize:'10px', color:'rgba(0,180,255,0.7)' }}>{formatTime(currentTime)}</span>
              <span style={{ fontFamily:'Orbitron,sans-serif', fontSize:'10px', color:'rgba(0,150,220,0.5)' }}>{formatTime(TRACKS[currentTrack].duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', padding:'6px 12px 10px', flexWrap:'wrap' }}>
            <button className="button-xp" onClick={handlePrev}>⏮ Prev</button>

            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={togglePlay}
              style={{
                padding:'6px 22px',
                borderRadius:'7px',
                fontFamily:'Rajdhani,sans-serif',
                fontWeight: 700,
                fontSize:'14px',
                border:'1px solid rgba(255,255,255,0.7)',
                cursor:'pointer',
                letterSpacing:'0.5px',
                background: isPlaying
                  ? 'linear-gradient(180deg,rgba(255,100,100,0.85),rgba(200,40,40,0.8))'
                  : 'linear-gradient(180deg,rgba(100,240,150,0.85),rgba(20,180,80,0.8))',
                color: 'rgba(255,255,255,0.95)',
                boxShadow: isPlaying
                  ? '0 0 16px rgba(255,80,80,0.5),inset 0 1px 0 rgba(255,255,255,0.4)'
                  : '0 0 16px rgba(0,220,100,0.5),inset 0 1px 0 rgba(255,255,255,0.4)',
                textShadow:'0 1px 2px rgba(0,0,0,0.3)',
              }}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </motion.button>

            <button className="button-xp" onClick={handleNext}>Next ⏭</button>
            <button className="button-xp" onClick={() => setShowPlaylist(p => !p)}>
              {showPlaylist ? '▲ Hide' : '▼ List'}
            </button>
          </div>

          {/* Volume */}
          <div style={{
            margin:'0 12px 10px',
            padding:'8px 12px',
            borderRadius:'6px',
            background:'rgba(0,30,70,0.4)',
            border:'1px solid rgba(0,100,180,0.3)',
            display:'flex',
            alignItems:'center',
            gap:'10px',
          }}>
            <span style={{ fontFamily:'Orbitron,sans-serif', fontSize:'9px', color:'rgba(0,180,255,0.7)', letterSpacing:'1px', minWidth:'26px' }}>VOL</span>
            <input
              type="range" min="0" max="1" step="0.01" value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              style={{ flex:1 }}
            />
            <span style={{ fontFamily:'Orbitron,sans-serif', fontSize:'9px', color:'rgba(0,180,255,0.7)', minWidth:'32px', textAlign:'right' }}>
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Playlist */}
          <AnimatePresence>
            {showPlaylist && (
              <motion.div
                initial={{ height:0, opacity:0 }}
                animate={{ height:'auto', opacity:1 }}
                exit={{ height:0, opacity:0 }}
                transition={{ duration:0.25 }}
                style={{ overflow:'hidden' }}
              >
                <div style={{
                  borderTop:'1px solid rgba(255,255,255,0.25)',
                  background:'rgba(0,25,60,0.45)',
                }}>
                  {/* Playlist header */}
                  <div style={{
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    padding:'5px 12px',
                    borderBottom:'1px solid rgba(255,255,255,0.12)',
                    background:'rgba(255,255,255,0.06)',
                  }}>
                    <span style={{ fontFamily:'Orbitron,sans-serif', fontSize:'9px', color:'rgba(0,180,255,0.7)', letterSpacing:'2px' }}>PLAYLIST</span>
                    <span style={{ fontFamily:'Orbitron,sans-serif', fontSize:'9px', color:'rgba(0,150,200,0.5)' }}>{TRACKS.length} TRACKS</span>
                  </div>

                  {/* Track list */}
                  <div style={{ maxHeight:'200px', overflowY:'auto' }}>
                    {TRACKS.map((track, i) => (
                      <motion.div
                        key={track.id}
                        onClick={() => selectTrack(i)}
                        whileHover={{ background:'rgba(0,180,255,0.15)' }}
                        style={{
                          display:'flex', alignItems:'center', gap:'10px',
                          padding:'6px 12px',
                          borderBottom:'1px solid rgba(255,255,255,0.07)',
                          cursor:'pointer',
                          background: i === currentTrack ? 'rgba(0,160,255,0.2)' : 'transparent',
                          borderLeft: i === currentTrack ? '2px solid rgba(0,200,255,0.8)' : '2px solid transparent',
                          transition:'background 0.15s',
                        }}
                      >
                        {/* Number / icon */}
                        <span style={{
                          fontFamily:'Orbitron,sans-serif', fontSize:'9px',
                          color: i === currentTrack ? 'rgba(0,220,255,0.9)' : 'rgba(0,150,200,0.5)',
                          minWidth:'20px', textAlign:'right',
                        }}>
                          {i === currentTrack
                            ? <motion.span animate={{ opacity:[1,0.4,1] }} transition={{ duration:1, repeat:Infinity }}>♫</motion.span>
                            : String(i+1).padStart(2,'0')}
                        </span>

                        {/* Name */}
                        <span style={{
                          flex:1,
                          fontFamily:'Rajdhani,sans-serif',
                          fontSize:'13px',
                          fontWeight: i === currentTrack ? 700 : 500,
                          color: i === currentTrack ? 'rgba(180,240,255,0.95)' : 'rgba(120,200,240,0.75)',
                          textTransform:'lowercase',
                          letterSpacing:'0.3px',
                          textShadow: i === currentTrack ? '0 0 10px rgba(0,200,255,0.5)' : 'none',
                        }}>
                          {track.name}
                        </span>

                        {/* Duration */}
                        <span style={{
                          fontFamily:'Orbitron,sans-serif', fontSize:'9px',
                          color: i === currentTrack ? 'rgba(0,200,255,0.8)' : 'rgba(0,150,200,0.5)',
                          letterSpacing:'1px',
                        }}>
                          {formatTime(track.duration)}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position:'absolute',
            width: i % 2 === 0 ? '8px' : '5px',
            height: i % 2 === 0 ? '8px' : '5px',
            borderRadius:'50%',
            background:'rgba(100,220,255,0.4)',
            boxShadow:'0 0 6px rgba(0,200,255,0.6)',
            left:`${10 + i * 14}%`,
            top:`${20 + i * 11}%`,
            zIndex:1,
          }}
          animate={{ y:[-15,15,-15], x:[-8,8,-8], opacity:[0.3,0.6,0.3] }}
          transition={{ duration: 5 + i * 1.2, repeat:Infinity, ease:'easeInOut' }}
        />
      ))}
    </div>
  );
}
