import { useEffect, useState, useCallback } from 'react';
import { audioManager } from '../game/AudioManager';
import './OpeningScene.css';

interface OpeningSceneProps {
    onComplete: () => void;
}

export function OpeningScene({ onComplete }: OpeningSceneProps) {
    const [step, setStep] = useState(0);
    const [fading, setFading] = useState(false);

    const startFade = useCallback(async () => {
        if (fading) return;
        // オーディオ初期化は非同期で行う（ユーザー操作がない場合は保留されるため待機しない）
        audioManager.init();
        setFading(true);
        setTimeout(onComplete, 1500);
    }, [fading, onComplete]);

    useEffect(() => {
        // ステップごとに演出を進める
        const timers = [
            setTimeout(() => setStep(1), 1000), // ユグドラシルの記述1
            setTimeout(() => {
                setStep(2);
                // 映像開始タイミングでBGMも開始を試みる
                // 注意: ユーザー操作がないと再生されないが、クリックされた際にinitされる
                audioManager.playBGM('opening');
            }, 4000), 
            setTimeout(() => setStep(3), 7000), // 沈黙
            setTimeout(() => setStep(5), 10000), // 静寂・暗転開始
            setTimeout(() => setStep(6), 11000), // 芽吹き + 映像2開始 + 最終行
            setTimeout(() => setStep(7), 20000), // 完了
        ];

        return () => timers.forEach(clearTimeout);
    }, []);

    useEffect(() => {
        if (step === 7) {
            startFade();
        }
    }, [step]);

    return (
        <div className={`opening-overlay ${fading ? 'fading' : ''}`} onClick={startFade}>
            <div className={`quote-container ${step >= 1 ? 'visible' : ''}`}>
                {step >= 1 && step <= 4 && (
                    <div className="quote-block">
                        <p className={`quote-line ${step >= 1 ? 'active' : 'hidden'}`}>
                            かつて世界を支えた大樹—ユグドラシル—は、
                        </p>
                        <p className={`quote-line ${step >= 2 ? 'active' : 'hidden'}`}>
                            終末の炎に焼かれ、灰となって崩れ落ちた。
                        </p>
                        <p className={`quote-line ${step >= 3 ? 'active' : 'hidden'}`}>
                            神々の黄昏が過ぎ去り、世界は沈黙に包まれた。
                        </p>
                    </div>
                )}
                {step >= 5 && (
                    <p className={`quote-line highlight ${step >= 6 ? 'active' : 'hidden'}`}>
                        だが、滅びの記憶は、灰の中から新たな「芽」を呼び覚ます。
                    </p>
                )}
            </div>

            <div className="video-background-layer">
                {step >= 2 && step <= 5 && (
                    <video
                        className="opening-video active"
                        autoPlay
                        muted
                        playsInline
                    >
                        <source src="/burn.mp4" type="video/mp4" />
                    </video>
                )}
                {step >= 6 && step <= 7 && (
                    <video
                        className="opening-video active long"
                        autoPlay
                        muted
                        playsInline
                    >
                        <source src="/sprout.mp4" type="video/mp4" />
                    </video>
                )}
                {/* 暗転中（step 5）は背景の黒が見える */}
            </div>

            <div className="skip-hint">
                CLICK TO SKIP
            </div>
        </div>
    );
}
