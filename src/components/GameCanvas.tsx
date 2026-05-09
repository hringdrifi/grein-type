import { useEffect, useRef } from 'react';
import { Engine } from '../game/Engine';

interface GameCanvasProps {
    gameState: 'opening' | 'title' | 'playing' | 'gameover';
    unlockedTitlesCount: number;
    onAscensionComplete?: () => void;
}

export const GameCanvas = ({ gameState, unlockedTitlesCount, onAscensionComplete }: GameCanvasProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<Engine | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        let isMounted = true;
        const container = containerRef.current;
        const engine = new Engine();
        engineRef.current = engine;

        // 初期化（非同期）
        engine.init(container).then(() => {
            if (!isMounted) {
                // 初期化完了前にアンマウントされていた場合、即座に破棄する
                engine.destroy();
                return;
            }
            console.log('Grein Engine Initialized');
            // 初期化完了時に現在の状態に合わせて開始
            if (gameState === 'playing') {
                engine.startPlay();
            } else if (gameState === 'title') {
                engine.showGarden(unlockedTitlesCount);
            }
        }).catch(err => {
            console.error('Engine init error:', err);
        });

        // クリーンアップ
        return () => {
            isMounted = false;
            if (engineRef.current) {
                engineRef.current.destroy();
                engineRef.current = null;
            }
        };
    }, []);

    // gameStateが変更されたら、プレイ開始をエンジンに通知する
    useEffect(() => {
        if (gameState === 'playing' && engineRef.current) {
            engineRef.current.startPlay();
        } else if (gameState === 'title' && engineRef.current) {
            engineRef.current.showGarden(unlockedTitlesCount);
        } else if (gameState === 'opening' && engineRef.current) {
            engineRef.current.reset();
        }
    }, [gameState, unlockedTitlesCount]);

    // React側の文字入力イベントをPixiJS側に伝える
    useEffect(() => {
        const handleTypingInput = (e: any) => {
            if (engineRef.current && engineRef.current.isInitialized) {
                engineRef.current.worldTree.onTypingInput(e.detail);
            }
        };

        window.addEventListener('typing-input', handleTypingInput);
        return () => window.removeEventListener('typing-input', handleTypingInput);
    }, []);

    // 昇天エフェクトの要求を監視
    useEffect(() => {
        const handleRequestAscension = () => {
            if (engineRef.current && engineRef.current.isInitialized) {
                engineRef.current.triggerAscension(() => {
                    if (onAscensionComplete) onAscensionComplete();
                });
            } else {
                // エンジンがない場合は即座にコールバックを呼ぶ
                if (onAscensionComplete) onAscensionComplete();
            }
        };

        window.addEventListener('request-ascension', handleRequestAscension);
        return () => window.removeEventListener('request-ascension', handleRequestAscension);
    }, [onAscensionComplete]);

    // ゲームオーバー時のキャプチャ要求
    useEffect(() => {
        const handleGameOver = async () => {
            if (engineRef.current && engineRef.current.isInitialized) {
                // キャプチャ実行
                const imgData = await engineRef.current.captureTree();
                window.dispatchEvent(new CustomEvent('tree-captured', { detail: imgData }));
            }
        };

        window.addEventListener('game-over', handleGameOver);
        return () => window.removeEventListener('game-over', handleGameOver);
    }, []);

    return (
        <div 
            ref={containerRef} 
            className="game-container"
            style={{ 
                width: '100vw', 
                height: '100vh', 
                position: 'fixed', 
                top: 0, 
                left: 0,
                backgroundColor: 'transparent',
                overflow: 'hidden'
            }} 
        />
    );
};
