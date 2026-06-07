import { useState, useEffect, useCallback, useRef } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { OpeningScene } from './components/OpeningScene';
import { HowToPlayPopup } from './components/HowToPlayPopup';
import { CollectionPopup } from './components/CollectionPopup';
import { GoogleAnalytics } from './components/GoogleAnalytics';
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
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showCollection, setShowCollection] = useState(false);
  const [isImeOn, setIsImeOn] = useState(false);
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
  const [sessionMaxDepth, setSessionMaxDepth] = useState(0); // 追加: 今回のプレイの最大深度
  const [treeImage, setTreeImage] = useState<string | null>(null); // 追加: キャプチャした世界樹の画像
  const [metBoundaryGuardian, setMetBoundaryGuardian] = useState(false); // 追加: 境界の守護者フラグ
  const vitalityRef = useRef(vitality);

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

  // 常に最新の生命力を参照するためのRef
  useEffect(() => {
    vitalityRef.current = vitality;
  }, [vitality]);

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
    setMetBoundaryGuardian(false);
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
      
      // 境界の守護者：残り体力が極めて低い（5以下）状態で単語をクリア
      if (vitalityRef.current <= 5) {
        setMetBoundaryGuardian(true);
      }

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

    const handleGameOver = (e: any) => {
      setSessionMaxDepth(e.detail?.maxDepth || 0);
      setGameState('gameover');
      audioManager.playSE('gameover');
    };

    const handleAscensionRequest = () => {
      audioManager.playSE('ascension');
    };

    const handleTreeCaptured = (e: any) => {
      setTreeImage(e.detail);
    };

    const triggerDamage = () => {
      setIsDamaged(true);
      setTimeout(() => setIsDamaged(false), 200);
    };

    const handleResetInput = () => {
      setInputValue('');
    };

    window.addEventListener('reset-input', handleResetInput);
    window.addEventListener('clear-input', handleClear);
    window.addEventListener('update-vitality', handleUpdateVitality);
    window.addEventListener('leaf-fallen', handleLeafFallen);
    window.addEventListener('typing-error', handleTypingError);
    window.addEventListener('game-over', handleGameOver);
    window.addEventListener('request-ascension', handleAscensionRequest);
    window.addEventListener('tree-captured', handleTreeCaptured);

    window.addEventListener('request-ascension', handleAscensionRequest);
    window.addEventListener('tree-captured', handleTreeCaptured);

    return () => {
      window.removeEventListener('reset-input', handleResetInput); // 追加
      window.removeEventListener('clear-input', handleClear);
      window.removeEventListener('update-vitality', handleUpdateVitality);
      window.removeEventListener('leaf-fallen', handleLeafFallen);
      window.removeEventListener('typing-error', handleTypingError);
      window.removeEventListener('game-over', handleGameOver);
      window.removeEventListener('request-ascension', handleAscensionRequest);
      window.removeEventListener('tree-captured', handleTreeCaptured);
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
        checkAndAddTitle('芽吹きの予感', wpm >= 20);
        checkAndAddTitle('灰を穿つ者', wpm >= 40);
        checkAndAddTitle('神速の語り手', wpm >= 60);
        checkAndAddTitle('疾風の剪定士', wpm >= 80);
        checkAndAddTitle('瞬きの風', wpm >= 100);
        checkAndAddTitle('極光の旋律', wpm >= 120);
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
        checkAndAddTitle('一枝の探究者', sessionMaxDepth >= 15);

        // 累計実績
        const newTotalWords = cumulativeWords + wordsCleared;
        setCumulativeWords(newTotalWords);
        localStorage.setItem('grein-total-words', newTotalWords.toString());
        checkAndAddTitle('根を張る者', newTotalWords >= 500);
        checkAndAddTitle('ユミルの溜息', newTotalWords >= 2000);

        // 特殊条件
        const hour = new Date().getHours();
        checkAndAddTitle('夜空の観測者', hour >= 0 && hour <= 4);
        checkAndAddTitle('悠久を夢見る蕾', durationMin >= 5);
        checkAndAddTitle('終焉を拒む意志', durationMin >= 10);
        checkAndAddTitle('境界の守護者', metBoundaryGuardian);

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

  // リザルト画面での滞在時間を計測（隠し称号：開拓者の休息用）
  useEffect(() => {
    if (gameState !== 'gameover') return;

    const timer = setTimeout(() => {
      if (!unlockedTitles.includes('開拓者の休息')) {
        const updated = [...unlockedTitles, '開拓者の休息'];
        setUnlockedTitles(updated);
        localStorage.setItem('grein-titles', JSON.stringify(updated));
      }
    }, 5 * 60 * 1000); // 5分

    return () => clearTimeout(timer);
  }, [gameState, unlockedTitles]);

  // SNSシェア機能
  const handleShare = () => {
    const text = `Grein Type — ユグドラシルの芽 — で世界樹を育てました！\nスコア: ${score.toLocaleString()}\nWPM: ${lastSessionStats.wpm} | 正確率: ${lastSessionStats.accuracy}%\n#GreinType #タイピングゲーム\n`;
    const url = "https://hringdrifi.github.io/grein-type/";
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  // 画像として保存機能
  const handleDownloadImage = () => {
    if (!treeImage) return;

    // キャンバスを作成して合成
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 背景（グラデーション）
    const grad = ctx.createLinearGradient(0, 0, 0, 630);
    grad.addColorStop(0, '#0a0f1a');
    grad.addColorStop(1, '#1a2533');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 630);

    // 装飾的な円（オーロラ風）
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#4facfe';
    ctx.beginPath();
    ctx.arc(1000, 100, 300, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#00f2fe';
    ctx.beginPath();
    ctx.arc(200, 500, 400, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // テキスト描画
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px "Inter", sans-serif';
    ctx.fillText('Grein Type', 60, 80);
    ctx.font = '20px "Inter", sans-serif';
    ctx.fillText('— 再生の記憶 —', 280, 75);

    // スコア情報
    ctx.font = 'bold 120px "Inter", sans-serif';
    ctx.fillStyle = '#e0ffff';
    ctx.fillText(score.toLocaleString(), 60, 240);
    ctx.font = '24px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('FINAL SCORE', 65, 140);

    // 統計
    ctx.font = '20px "Inter", sans-serif';
    ctx.fillText('WPM', 65, 300);
    ctx.font = 'bold 40px "Inter", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(lastSessionStats.wpm.toString(), 65, 350);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '20px "Inter", sans-serif';
    ctx.fillText('ACCURACY', 220, 300);
    ctx.font = 'bold 40px "Inter", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${lastSessionStats.accuracy}%`, 220, 350);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '20px "Inter", sans-serif';
    ctx.fillText('MAX DEPTH', 450, 300);
    ctx.font = 'bold 40px "Inter", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${sessionMaxDepth} Layers`, 450, 350);

    // 称号
    ctx.font = '18px "Inter", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    lastSessionStats.newTitles.slice(0, 3).forEach((title, i) => {
      ctx.fillText(`称号: ${title}`, 65, 420 + i * 35);
    });

    // 世界樹の画像を合成
    const img = new Image();
    img.onload = () => {
      // 木を右側に配置
      const treeScale = 0.8;
      const tw = img.width * treeScale;
      const th = img.height * treeScale;
      // グロー効果
      ctx.shadowBlur = 40;
      ctx.shadowColor = 'rgba(224, 255, 255, 0.5)';
      ctx.drawImage(img, 1100 - tw, 315 - th / 2, tw, th);
      ctx.shadowBlur = 0;

      // フッター
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '16px "Inter", sans-serif';
      ctx.fillText('hringdrifi.github.io/grein-type/', 65, 580);

      // ダウンロード
      const link = document.createElement('a');
      link.download = `grein-type-result-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = treeImage;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const isComposing = (e.nativeEvent as any).isComposing;

    // 全角文字の混入またはIME入力中を検知
    if (isComposing || /[^\x01-\x7E]/.test(rawValue)) {
      if (!isImeOn) setIsImeOn(true);
      // 入力値をクリアして PixiJS 側をリセット
      setInputValue('');
      window.dispatchEvent(new CustomEvent('typing-input', { detail: '' }));
      return;
    }

    // 通常の入力処理
    if (isImeOn) setIsImeOn(false);

    const value = rawValue.toUpperCase();
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
      <GoogleAnalytics gameState={gameState} />
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
                <p className="garden-status-main">
                  世界樹の庭: {
                    unlockedTitles.length >= 25 ? '悠久なる再生の地' :
                    unlockedTitles.length >= 19 ? 'ユグドラシルの庭' :
                    unlockedTitles.length >= 13 ? '生い茂る森' :
                    unlockedTitles.length >= 8 ? '清らかな森' :
                    unlockedTitles.length >= 4 ? '若木' :
                    unlockedTitles.length >= 1 ? '芽吹きの兆し' : '灰の地'
                  }
                </p>
                <p className="garden-status-sub">
                  {
                    unlockedTitles.length >= 25 ? 'すべての生命が調律された、約束の地。' :
                    unlockedTitles.length >= 19 ? '八足の馬が駆け、頂には鷲が翼を広げる。' :
                    unlockedTitles.length >= 13 ? '栗鼠のラタトスクが駆け、山羊のヘイズルーンが葉を食んでいる。' :
                    unlockedTitles.length >= 8 ? '木々の影で、牝牛や蛇たちが穏やかに過ごす。' :
                    unlockedTitles.length >= 4 ? '枝先に小さな花が咲き、根元には雄鹿が静かに佇んでいる。' :
                    unlockedTitles.length >= 1 ? '灰の中からカラスが現れ、遠くを見つめている。' : '生命の気配は、まだない。'
                  }
                </p>
                <div className="titles-badge-container">
                  {unlockedTitles.map(t => <span key={t} className="title-badge">{t}</span>)}
                </div>
              </div>
              <div className="button-group-vertical">
                <button className="start-button" onClick={handleStart}>
                  START
                </button>
                <div className="button-group-horizontal">
                  <button className="how-to-play-btn" onClick={() => setShowHowToPlay(true)}>
                    HOW TO PLAY
                  </button>
                  <button className="how-to-play-btn" onClick={() => setShowCollection(true)}>
                    COLLECTION
                  </button>
                </div>
              </div>
            </main>

            <a
              href="https://github.com/hringdrifi/grein-type"
              target="_blank"
              rel="noopener noreferrer"
              className="github-link"
            >
              <svg height="16" width="16" viewBox="0 0 16 16" version="1.1" aria-hidden="true" fill="currentColor" className="github-icon">
                <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.35 2.69.91 0 .63.01 1.13.01 1.13 0 .21-.15.46-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
              </svg>
              GitHub
            </a>
          </div>
        )}

        {/* 遊び方ポップアップ */}
        {showHowToPlay && (
          <HowToPlayPopup onClose={() => setShowHowToPlay(false)} />
        )}

        {/* コレクションポップアップ */}
        {showCollection && (
          <CollectionPopup 
            unlockedTitles={unlockedTitles} 
            onClose={() => setShowCollection(false)} 
          />
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
              {isImeOn && (
                <div className="ime-warning">
                  ⚠️ IMEがONになっています。半角英数に切り替えてください。
                </div>
              )}
              <div className="spell-label">SPELL</div>
              <input
                ref={inputRef}
                type="text"
                className="game-input"
                autoFocus
                placeholder=""
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                inputMode="url"
                lang="en"
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                 onBlur={(e) => {
                  // フォーカスが外れたら即座に戻す（プレイ中のみ）
                  if (gameState === 'playing') {
                    e.target.focus();
                  }
                }}
                onCompositionStart={() => {
                  setIsImeOn(true);
                  setInputValue('');
                  window.dispatchEvent(new CustomEvent('typing-input', { detail: '' }));
                }}
                onCompositionUpdate={() => {
                  if (!isImeOn) setIsImeOn(true);
                }}
                onCompositionEnd={() => {
                  setIsImeOn(false);
                  setInputValue('');
                  window.dispatchEvent(new CustomEvent('typing-input', { detail: '' }));
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
            <div className="result-ethereal-bg"></div>
            
            <header className="result-header">
              <h1 className="timeup-title">Night Sky Memory</h1>
              <p className="subtitle">生命力は夜空へと還り、一時の記憶を刻む…</p>
            </header>
  
            <main className="result-main-enhanced">
              <div className="tree-silhouette-container">
                {treeImage ? (
                  <img src={treeImage} alt="Your World Tree" className="tree-silhouette" />
                ) : (
                  <div className="tree-loading">Capturing the tree...</div>
                )}
                <div className="tree-glow"></div>
              </div>

              <div className="result-stats-panel">
                <div className="result-item-main">
                  <span className="label">FINAL SCORE</span>
                  <span className="value score-large">{score.toLocaleString()}</span>
                </div>
  
                <div className="stats-grid-compact">
                  <div className="stat-box">
                    <span className="label">WPM</span>
                    <span className="value">{lastSessionStats.wpm}</span>
                  </div>
                  <div className="stat-box">
                    <span className="label">ACCURACY</span>
                    <span className="value">{lastSessionStats.accuracy}%</span>
                  </div>
                  <div className="stat-box">
                    <span className="label">MAX DEPTH</span>
                    <span className="value">{sessionMaxDepth}</span>
                  </div>
                  <div className="stat-box">
                    <span className="label">CLEARED</span>
                    <span className="value">{wordsCleared}</span>
                  </div>
                </div>
  
                {lastSessionStats.newTitles.length > 0 && (
                  <div className="new-titles-section">
                    <p className="section-title">NEW TITLES</p>
                    <div className="titles-badge-container-compact">
                      {lastSessionStats.newTitles.map(t => (
                        <span key={t} className="title-badge new-glow">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </main>
  
            <footer className="result-footer">
              <div className="button-group">
                <button className="action-button share" onClick={handleShare}>
                  <span className="icon">𝕏</span> Share
                </button>
                <button className="action-button download" onClick={handleDownloadImage} disabled={!treeImage}>
                  <span className="icon">💾</span> Save Image
                </button>
              </div>
              <button
                className="back-to-garden-btn"
                onClick={() => window.dispatchEvent(new CustomEvent('request-ascension'))}
              >
                RETURN TO GARDEN
              </button>
            </footer>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
