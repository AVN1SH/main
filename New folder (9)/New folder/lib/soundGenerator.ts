export const Sound = {
    ctx: null as AudioContext | null,
    init: () => {
        if (!Sound.ctx) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
                Sound.ctx = new AudioContext();
            }
        }
        if (Sound.ctx && Sound.ctx.state === 'suspended') {
            Sound.ctx.resume();
        }
    },
    playTone: (freq: number, type: OscillatorType, duration: number, slide?: number) => {
        const settings = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('whirly_settings') || '{"music":true,"sfx":true}' : '{"music":true,"sfx":true}');
        if (!settings.sfx) return;
        if (!Sound.ctx) Sound.init();
        if (!Sound.ctx) return;
        
        try {
            const osc = Sound.ctx.createOscillator();
            const gain = Sound.ctx.createGain();
            osc.type = type;
            osc.connect(gain);
            gain.connect(Sound.ctx.destination);
            
            const now = Sound.ctx.currentTime;
            osc.frequency.setValueAtTime(freq, now);
            if (slide) osc.frequency.exponentialRampToValueAtTime(slide, now + duration);
            
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            osc.start(now);
            osc.stop(now + duration);
        } catch (e) {
            console.error('Audio play error', e);
        }
    },
    jump: () => Sound.playTone(300, 'sine', 0.2, 600),
    die: () => Sound.playTone(150, 'sawtooth', 0.4, 50),
    musicInterval: null as any,
    startMusic: () => {
        const settings = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('whirly_settings') || '{"music":true,"sfx":true}' : '{"music":true,"sfx":true}');
        if (!settings.music) return;
        if (Sound.musicInterval) clearInterval(Sound.musicInterval);
        Sound.init();
        const notes = [261.63, 329.63, 392.00, 523.25]; // C E G C
        Sound.musicInterval = setInterval(() => {
            const currentSettings = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('whirly_settings') || '{"music":true,"sfx":true}' : '{"music":true,"sfx":true}');
            if (!currentSettings.music) return;
            const note = notes[Math.floor(Math.random() * notes.length)];
            // Lower volume background notes
            if (!Sound.ctx) return;
            try {
                const osc = Sound.ctx.createOscillator();
                const gain = Sound.ctx.createGain();
                osc.type = 'sine';
                osc.connect(gain);
                gain.connect(Sound.ctx.destination);
                
                const now = Sound.ctx.currentTime;
                osc.frequency.setValueAtTime(note, now);
                gain.gain.setValueAtTime(0.02, now); // very quiet
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
                
                osc.start(now);
                osc.stop(now + 0.5);
            } catch (e) {}
        }, 600);
    },
    stopMusic: () => {
        if (Sound.musicInterval) {
            clearInterval(Sound.musicInterval);
            Sound.musicInterval = null;
        }
    }
};
