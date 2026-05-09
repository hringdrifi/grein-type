/**
 * AudioManager - Grein Type の音響演出を管理するクラス
 * Web Audio API を使用して低遅延なSE再生とBGM管理を行う
 */
class AudioManager {
    private context: AudioContext | null = null;
    private bgmGain: GainNode | null = null;
    private seGain: GainNode | null = null;
    private currentBGM: HTMLAudioElement | null = null;
    private pendingBGM: keyof typeof this.bgmUrls | null = null;
    private initialized = false;

    private bgmUrls = {
        opening: '',
        title: '',
        playing: ''
    };

    constructor() {
        // コンストラクタでは何もしない（ユーザー操作後に初期化）
    }

    /**
     * ブラウザのオーディオポリシーに対応するため、ユーザー操作時に呼び出す
     */
    public async init() {
        if (this.initialized) return;

        try {
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            this.bgmGain = this.context.createGain();
            this.bgmGain.connect(this.context.destination);
            this.bgmGain.gain.value = 0.4;

            this.seGain = this.context.createGain();
            this.seGain.connect(this.context.destination);
            this.seGain.gain.value = 0.6;

            if (this.context.state === 'suspended') {
                await this.context.resume();
            }

            this.initialized = true;
            console.log('AudioManager initialized');

            // 初期化前にリクエストされていたBGMがあれば再生
            if (this.pendingBGM) {
                this.playBGM(this.pendingBGM);
                this.pendingBGM = null;
            }
        } catch (e) {
            console.error('Failed to initialize AudioManager:', e);
        }
    }

    /**
     * BGMを再生（クロスフェード付き）
     */
    public playBGM(_type: keyof typeof this.bgmUrls) {
        // 外部リソースエラー回避のため、現在BGM再生は無効化されています
        return;
    }

    public stopBGM() {
        if (this.currentBGM) {
            this.currentBGM.pause();
            this.currentBGM = null;
        }
    }

    /**
     * 効果音（SE）をリアルタイム合成して再生
     */
    public playSE(type: 'type' | 'error' | 'clear' | 'decay' | 'gameover' | 'ascension') {
        if (!this.initialized || !this.context) return;

        switch (type) {
            case 'type':
                this.playTypeSound();
                break;
            case 'error':
                this.playErrorSound();
                break;
            case 'clear':
                this.playClearSound();
                break;
            case 'decay':
                this.playDecaySound();
                break;
            case 'gameover':
                this.playGameOverSound();
                break;
            case 'ascension':
                this.playAscensionSound();
                break;
        }
    }

    private playTypeSound() {
        const ctx = this.context!;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // 木を叩くようなコンッという音 (Woody click)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.seGain!);

        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    }

    private playErrorSound() {
        const ctx = this.context!;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // 鈍い不協和音 (Dull thud/buzz)
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(this.seGain!);

        osc.start();
        osc.stop(ctx.currentTime + 0.2);
    }

    private playClearSound() {
        const ctx = this.context!;
        const now = ctx.currentTime;
        
        // 清らかなチャイム音 (Harp-like chime)
        const frequencies = [880, 1109, 1318, 1760]; // A5, C#6, E6, A6 (A Major)
        
        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.05);
            
            gain.gain.setValueAtTime(0, now + i * 0.05);
            gain.gain.linearRampToValueAtTime(0.1, now + i * 0.05 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.8);
            
            osc.connect(gain);
            gain.connect(this.seGain!);
            
            osc.start(now + i * 0.05);
            osc.stop(now + i * 0.05 + 0.8);
        });
    }

    private playDecaySound() {
        const ctx = this.context!;
        // 乾いた葉が落ちるようなノイズ音 (Dry rustle)
        const bufferSize = ctx.sampleRate * 0.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.5);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.seGain!);
        
        noise.start();
    }

    private playGameOverSound() {
        const ctx = this.context!;
        // 終焉を告げる低い鐘のような音 (Deep gong)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(60, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 3.0);
        
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.0);
        
        osc.connect(gain);
        gain.connect(this.seGain!);
        
        osc.start();
        osc.stop(ctx.currentTime + 3.0);
    }

    private playAscensionSound() {
        const ctx = this.context!;
        const now = ctx.currentTime;
        
        // 不協和音を避けるため、ピッチ上昇を廃止し、完全倍音（オーバートーン）を重ねる
        // 基本周波数 110Hz (A2) からの自然な倍音列
        const baseFreq = 110;
        const harmonics = [1, 2, 3, 4, 5, 6, 8, 10, 12]; // A2, A3, E4, A4, C#5, E5, A5, C#6, E6
        
        harmonics.forEach((h, i) => {
            const freq = baseFreq * h;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            
            // アタックをさらに滑らかに (ホワーという音)
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.04 / h, now + 1.2 + (i * 0.05)); // 高音ほど音量を抑える
            gain.gain.exponentialRampToValueAtTime(0.001, now + 4.5);
            
            osc.connect(gain);
            gain.connect(this.seGain!);
            
            osc.start(now);
            osc.stop(now + 4.5);
        });

        // わずかな残響感をシミュレートするための低域のハミング
        const lowOsc = ctx.createOscillator();
        const lowGain = ctx.createGain();
        lowOsc.type = 'sine';
        lowOsc.frequency.setValueAtTime(55, now); // A1
        lowGain.gain.setValueAtTime(0, now);
        lowGain.gain.linearRampToValueAtTime(0.03, now + 2.0);
        lowGain.gain.exponentialRampToValueAtTime(0.001, now + 5.0);
        lowOsc.connect(lowGain);
        lowGain.connect(this.seGain!);
        lowOsc.start(now);
        lowOsc.stop(now + 5.0);
    }
}

export const audioManager = new AudioManager();
