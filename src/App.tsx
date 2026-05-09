import { useState, useEffect, useCallback, useRef } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { OpeningScene } from './components/OpeningScene';
import { audioManager } from './game/AudioManager';
import './App.css';

function App() {
  // ゲームの進行状態を管理
  const [gameState, setGameState] = useState<'opening' | 'title' | 'playing' | 'gameover'>('opening');
  const [inputValue, setInputValue] = useState('');
  const [vitality, setVitality] = useState(60);
  const [errors, setErrors] = useState(0);
  const [wordsCleared, setWordsCleared] = useState(0);
  const [isDamaged, setIsDamaged] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // スコアと統計
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [isNoDecay, setIsNoDecay] = useState(true);
  const [lastSessionStats, setLastSessionStats] = useState({
    wpm: 0,
    accuracy: 0,
    newTitles: [] as string[],
    baseScore: 0,
    bonus: 0
  });

  // 統計用の状態

  const [cumulativeWords, setCumulativeWords] = useState<number>(() => {
    const saved = localStorage.getItem('grein-total-words');
    return saved ? parseInt(saved) : 0;
  });

  // 永続化された称号
  const [unlockedTitles, setUnlockedTitles] = useState<string[]>(() => {
    const saved = localStorage.getItem('grein-titles');
    return saved ? JSON.parse(saved) : [];
  });

  // オーディオ初期化の管理
  const initAudio = useCallback(async () => {
    await audioManager.init();
  }, []);

  const handleStart = async () => {
    await initAudio();
    setGameState('playing');
    setInputValue(''); // 入力値をリセット
    setVitality(60);
    setErrors(0);
    setWordsCleared(0);
    setScore(0);
    setTotalChars(0);
    setIsNoDecay(true);

    setStartTime(Date.now());

    // エンジン側の入力状態もクリア
    window.dispatchEvent(new CustomEvent('typing-input', { detail: '' }));

    audioManager.playBGM('playing');
    audioManager.playSE('type'); // フィードバック用
  };

  useEffect(() => {
    // PixiJSからの各種イベントを受け取る
    const handleClear = (e: any) => {
      const { word, count, noMiss } = e.detail;
      setInputValue('');
      setWordsCleared(prev => prev + count);


      // WPM（タイピング速度）の計算用には、実際に打った1単語分のみを加算
      setTotalChars(prev => prev + word.length);

      // スコア計算：正確性加算 (ミスなしで単語をクリアした際、1.2 倍のボーナス)
      const baseWordScore = word.length * 100 * count;
      const finalWordScore = noMiss ? Math.floor(baseWordScore * 1.2) : baseWordScore;
      setScore(prev => prev + finalWordScore);

      audioManager.playSE('clear');
      window.dispatchEvent(new CustomEvent('typing-input', { detail: '' }));
    };

    const handleUpdateVitality = (e: any) => setVitality(e.detail);

    const handleLeafFallen = () => {
      setIsNoDecay(false);
      triggerDamage();
      audioManager.playSE('decay');
    };

    const handleTypingError = () => {
      setErrors(prev => prev + 1);
      setInputValue(''); // ミス時に強制リセット（最初から打ち直し）
      window.dispatchEvent(new CustomEvent('typing-input', { detail: '' }));
      triggerDamage();
      audioManager.playSE('error');
    };

    const handleGameOver = () => {
      setGameState('gameover');
      audioManager.playSE('gameover');
    };

    const handleAscensionRequest = () => {
      audioManager.playSE('ascension');
    };

    const triggerDamage = () => {
      setIsDamaged(true);
      setTimeout(() => setIsDamaged(false), 200);
    };

    window.addEventListener('clear-input', handleClear);
    window.addEventListener('update-vitality', handleUpdateVitality);
    window.addEventListener('leaf-fallen', handleLeafFallen);
    window.addEventListener('typing-error', handleTypingError);
    window.addEventListener('game-over', handleGameOver);
    window.addEventListener('request-ascension', handleAscensionRequest);

    return () => {
      window.removeEventListener('clear-input', handleClear);
      window.removeEventListener('update-vitality', handleUpdateVitality);
      window.removeEventListener('leaf-fallen', handleLeafFallen);
      window.removeEventListener('typing-error', handleTypingError);
      window.removeEventListener('game-over', handleGameOver);
      window.removeEventListener('request-ascension', handleAscensionRequest);
    };
  }, [initAudio]);

  // ゲームオーバー時のリザルト計算（gameStateの変化を検知）
  useEffect(() => {
    if (gameState === 'gameover') {
      const newTitles: string[] = [];
      const checkAndAddTitle = (id: string, condition: boolean) => {
        if (condition && !unlockedTitles.includes(id)) {
          newTitles.push(id);
        }
      };

      const bonus = 0; // ボーナス廃止
      const finalScore = score;
      setScore(finalScore);

      // 称号獲得判定
      if (wordsCleared === 0) {
        // 何も入力せずに終了した場合の特別な称号
        checkAndAddTitle('灰を眺める者', true);
        setLastSessionStats({ wpm: 0, accuracy: 0, newTitles, baseScore: 0, bonus });
      } else {
        const endTime = Date.now();
        const durationSec = (endTime - startTime) / 1000;
        const durationMin = durationSec / 60;
        const wpm = durationMin > 0 ? Math.round((totalChars / 5) / durationMin) : 0;
        const accuracy = (wordsCleared + errors) > 0
          ? Math.round((wordsCleared / (wordsCleared + errors)) * 100)
          : 0;

        checkAndAddTitle('灰を払う者', wordsCleared >= 10);
        checkAndAddTitle('神速の語り手', wpm >= 60);
        checkAndAddTitle('瞬きの風', wpm >= 100);
        checkAndAddTitle('絶対の調律師', errors === 0 && wordsCleared >= 50);

        // プレイスタイル系
        checkAndAddTitle('静寂の観察者', accuracy >= 98 && wordsCleared >= 30);
        checkAndAddTitle('森の守護者', isNoDecay && wordsCleared >= 50);
        checkAndAddTitle('終焉を生きる者', !isNoDecay && wordsCleared >= 50);

        // スコア・神話系
        checkAndAddTitle('死の淵を歩む者', score >= 5000);
        checkAndAddTitle('ヴァルハラの賓客', score >= 15000);
        checkAndAddTitle('世界樹の再誕者', score >= 30000);
        checkAndAddTitle('ユグドラシルの守護者', score >= 60000);
        checkAndAddTitle('ラグナロクの覇者', score >= 100000);

        // 累計実績
        const newTotalWords = cumulativeWords + wordsCleared;
        setCumulativeWords(newTotalWords);
        localStorage.setItem('grein-total-words', newTotalWords.toString());
        checkAndAddTitle('根を張る者', newTotalWords >= 500);
        checkAndAddTitle('ユミルの溜息', newTotalWords >= 2000);

        // 特殊条件
        const hour = new Date().getHours();
        checkAndAddTitle('夜空の観測者', hour >= 0 && hour <= 4);
        checkAndAddTitle('時を刻む芽', durationMin >= 10);

        setLastSessionStats({ wpm, accuracy, newTitles, baseScore: score, bonus });
      }

      if (newTitles.length > 0) {
        const updated = [...unlockedTitles, ...newTitles];
        setUnlockedTitles(updated);
        localStorage.setItem('grein-titles', JSON.stringify(updated));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  // BGMの切り替え管理
  useEffect(() => {
    if (gameState === 'title') {
      // audioManager.playBGM('title');
      audioManager.stopBGM();
    } else if (gameState === 'opening') {
      // オープニング内での制御に任せるが、一応止めておく
      audioManager.stopBGM();
    }
  }, [gameState]);

  // SNSシェア機能
  const handleShare = () => {
    const text = `Grein Type — ユグドラシルの芽 — で世界樹を育てました！\nスコア: ${score.toLocaleString()}\nWPM: ${lastSessionStats.wpm} | 正確率: ${lastSessionStats.accuracy}%\n#GreinType #タイピングゲーム\n`;
    const url = "https://hringdrifi.github.io/grein-type/";
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    if (value.length > inputValue.length) {
      audioManager.playSE('type');
    }
    setInputValue(value);
    // 1文字入力するごとにPixiJS側へ通知し、自動判定させる
    window.dispatchEvent(new CustomEvent('typing-input', { detail: value }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Space または Escape で入力をキャンセルしてフォーカスを解除
    if (e.key === ' ' || e.key === 'Escape') {
      e.preventDefault();
      setInputValue('');
      window.dispatchEvent(new CustomEvent('typing-input', { detail: '' }));
    } else if (e.key === 'Tab') {
      // Tabキーによるフォーカス移動を防止
      e.preventDefault();
    }
  };

  return (
    <div className={`app ${isDamaged ? 'damaged' : ''}`}>
      {/* ゲーム描画レイヤー（PixiJS） */}
      <GameCanvas
        gameState={gameState}
        unlockedTitlesCount={unlockedTitles.length}
        onAscensionComplete={() => setGameState('title')}
      />

      {/* UIレイヤー */}
      <div
        className="ui-layer"
        onMouseDown={(e) => {
          // プレイ中は画面のどこをクリックしても入力を妨げないようにフォーカスを戻す
          if (gameState === 'playing') {
            e.preventDefault();
            inputRef.current?.focus();
          }
        }}
      >

        {/* オープニング演出 */}
        {gameState === 'opening' && (
          <OpeningScene onComplete={() => setGameState('title')} />
        )}

        {/* タイトル画面（世界樹の庭） */}
        {gameState === 'title' && (
          <div className="scene-container title-scene">
            <header>
              <h1 className="main-title">Grein Type</h1>
              <p className="subtitle">— ユグドラシルの芽 —</p>
            </header>

            <main>
              <div className="garden-status">
                <p>世界樹の庭: {unlockedTitles.length > 5 ? '生い茂る森' : unlockedTitles.length > 0 ? '若木' : '灰の地'}</p>
                <div className="titles-badge-container">
                  {unlockedTitles.map(t => <span key={t} className="title-badge">{t}</span>)}
                </div>
              </div>
              <button className="start-button" onClick={handleStart}>
                START
              </button>
            </main>
          </div>
        )}

        {/* プレイ画面（タイピング・HUD） */}
        {gameState === 'playing' && (
          <div className="scene-container play-scene">
            <div className="top-hud">
              <div className="hud-item">
                <span className="label">VITALITY</span>
                <span className="value">{Math.ceil(vitality)}s</span>
              </div>
              <div className="hud-item score-display">
                <span className="label">SCORE</span>
                <span className="value">{score.toLocaleString()}</span>
              </div>
            </div>

            <div className="input-area">
              <div className="spell-label">SPELL</div>
              <input
                ref={inputRef}
                type="text"
                className="game-input"
                autoFocus
                placeholder=""
                autoComplete="off"
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={(e) => {
                  // フォーカスが外れたら即座に戻す（プレイ中のみ）
                  if (gameState === 'playing') {
                    e.target.focus();
                  }
                }}
              />
              <div className="input-stats">
                CLEARED: {wordsCleared} <span className="separator">|</span> ERROR: {errors}
              </div>
            </div>
          </div>
        )}

        {/* ゲームオーバー画面（タイムアップ・記憶の登録） */}
        {gameState === 'gameover' && (
          <div className="scene-container gameover-scene">
            <header>
              <h1 className="timeup-title">Time Up</h1>
              <p className="subtitle">生命力が尽き、大樹は夜空の記憶となった…</p>
            </header>

            <main className="result-main">
              <div className="result-grid">
                <div className="result-item score-hero">
                  <span className="label">FINAL SCORE</span>
                  <span className="value score-animate">{score.toLocaleString()}</span>
                </div>

                <div className="result-stats-row">
                  <div className="result-item">
                    <span className="label">WPM</span>
                    <span className="value">{lastSessionStats.wpm}</span>
                  </div>
                  <div className="result-item">
                    <span className="label">ACCURACY</span>
                    <span className="value">{lastSessionStats.accuracy}%</span>
                  </div>
                  <div className="result-item">
                    <span className="label">CLEARED</span>
                    <span className="value">{wordsCleared}</span>
                  </div>
                  <div className="result-item">
                    <span className="label">ERRORS</span>
                    <span className="value">{errors}</span>
                  </div>
                </div>
              </div>

              {lastSessionStats.newTitles.length > 0 && (
                <div className="new-titles-container">
                  <div className="new-titles-header">
                    <span className="line"></span>
                    <span className="new-titles-label">NEW TITLES</span>
                    <span className="line"></span>
                  </div>
                  <div className="titles-badge-container">
                    {lastSessionStats.newTitles.map(t => <span key={t} className="title-badge new">{t}</span>)}
                  </div>
                </div>
              )}
            </main>

            <footer>
              <button
                className="start-button share-button"
                onClick={handleShare}
              >
                結果をシェア
              </button>
              <button
                className="start-button back-to-title"
                onClick={() => window.dispatchEvent(new CustomEvent('request-ascension'))}
              >
                タイトルへ戻る
              </button>
            </footer>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
