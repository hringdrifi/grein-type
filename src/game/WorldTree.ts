import { Container, Text, TextStyle, Ticker, Graphics } from 'pixi.js';

// ゲーム内に登場する単語リスト（北欧神話、自然、再生に関連する言葉）
const WORD_DICTIONARY = [
    // 挨拶・時間 (Greetings & Time)
    "HELLO", "HI", "BYE", "GOOD", "MORNING", "AFTERNOON", "EVENING", "NIGHT", "YES", "NO", "THANK", "YOU", "SORRY", "PLEASE", "NAME", "FRIEND", "TODAY", "TOMORROW", "YESTERDAY", "WEEK", "MONTH", "YEAR", "TIME", "CLOCK", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY",
    
    // 数字 (Numbers)
    "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY", "HUNDRED", "FIRST", "SECOND", "THIRD",
    
    // 色・形 (Colors & Shapes)
    "RED", "BLUE", "GREEN", "YELLOW", "ORANGE", "PINK", "PURPLE", "BLACK", "WHITE", "BROWN", "GRAY", "GOLD", "SILVER", "CIRCLE", "SQUARE", "STAR", "HEART",
    
    // 動物・生き物 (Animals & Creatures)
    "DOG", "CAT", "BIRD", "FISH", "LION", "TIGER", "BEAR", "RABBIT", "MONKEY", "HORSE", "COW", "PIG", "SHEEP", "DUCK", "CHICKEN", "SNAKE", "FROG", "BEE", "ANT", "WHALE", "SHARK", "TURTLE", "FOX", "DEER", "WOLF", "ZEBRA", "GIRAFFE", "ELEPHANT", "PANDA", "KOALA",
    
    // 食べ物・飲み物 (Food & Drink)
    "APPLE", "BANANA", "ORANGE", "PEACH", "GRAPE", "MELON", "LEMON", "CHERRY", "CAKE", "BREAD", "MILK", "WATER", "TEA", "JUICE", "EGG", "RICE", "MEAT", "SOUP", "FISH", "POTATO", "TOMATO", "CARROT", "ONION", "CANDY", "COOKIE", "PIZZA", "COFFEE", "LUNCH", "DINNER",
    
    // 学校・教育 (School & Education)
    "SCHOOL", "PEN", "BOOK", "DESK", "CHAIR", "BAG", "BOX", "CLASS", "STUDENT", "TEACHER", "PENCIL", "ERASER", "RULER", "NOTEBOOK", "PAPER", "COMPUTER", "PHONE", "MUSIC", "ART", "MATH", "SPORTS", "SOCCER", "BASEBALL", "TENNIS", "PIANO", "GUITAR",
    
    // 家・場所 (Home & Places)
    "HOME", "ROOM", "BED", "TABLE", "DOOR", "WINDOW", "KITCHEN", "BATH", "HOUSE", "GARDEN", "PARK", "STORE", "SHOP", "STATION", "HOSPITAL", "BANK", "STREET", "ROAD", "TOWN", "CITY", "COUNTRY", "WORLD", "OFFICE", "LIBRARY", "MUSEUM",
    
    // 家族・人・体 (Family, People & Body)
    "FATHER", "MOTHER", "BROTHER", "SISTER", "BABY", "BOY", "GIRL", "MAN", "WOMAN", "DOCTOR", "NURSE", "POLICE", "COOK", "PILOT", "FARMER", "SINGER", "PLAYER", "HEAD", "FACE", "HAIR", "EYE", "EAR", "NOSE", "MOUTH", "HAND", "FOOT", "ARM", "LEG", "SHOULDER", "KNEE", "FINGER",
    
    // 自然・天気 (Nature & Weather)
    "SUN", "MOON", "STAR", "SKY", "CLOUD", "RAIN", "SNOW", "WIND", "SEA", "RIVER", "MOUNTAIN", "TREE", "LEAF", "FLOWER", "FOREST", "EARTH", "WOOD", "GRASS", "ROCK", "SUNNY", "CLOUDY", "RAINY", "SNOWY", "HOT", "COLD", "WARM", "COOL",
    
    // 動作 (Verbs)
    "GO", "COME", "EAT", "DRINK", "PLAY", "SING", "DANCE", "RUN", "WALK", "JUMP", "SEE", "LOOK", "READ", "WRITE", "SLEEP", "WASH", "COOK", "HELP", "SMILE", "STUDY", "TEACH", "LEARN", "SPEAK", "TALK", "LISTEN", "KNOW", "THINK", "WANT", "LIKE", "LOVE", "HAVE", "USE", "TAKE", "MAKE", "BUILD", "OPEN", "CLOSE", "START", "STOP", "WAIT", "PUSH", "PULL", "BRING", "CARRY", "FLY", "SWIM", "RIDE", "BUY", "SELL",
    
    // 状態・形容詞 (Adjectives)
    "HAPPY", "SAD", "ANGRY", "BIG", "SMALL", "HOT", "COLD", "NEW", "OLD", "NICE", "COOL", "CUTE", "FAST", "SLOW", "BUSY", "READY", "BEAUTIFUL", "WONDERFUL", "FAMOUS", "SPECIAL", "FAVORITE", "IMPORTANT", "DIFFICULT", "EASY", "HUNGRY", "THIRSTY", "STRONG", "WEAK", "LONG", "SHORT", "TALL", "HIGH", "LOW", "WIDE", "NEAR", "FAR", "CLEAN", "DIRTY", "DARK", "LIGHT", "RICH", "POOR"
];

interface Attractor {
    x: number;
    y: number;
    active: boolean;
}

interface Spirit {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    phase: number;
    targetNodeIndex: number;
}

interface Leaf {
    offsetX: number;
    offsetY: number;
    angle: number;
    size: number;
    phase: number;
}

interface GardenAnimal {
    x: number;
    y: number;
    type: 'raven' | 'squirrel' | 'stag' | 'horse' | 'cow' | 'snake' | 'eagle' | 'goat';
    opacity: number;
    targetOpacity: number;
    scale: number;
    phase: number;
    side: number; // 1 or -1 for direction
}

interface FallingLeaf {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rot: number;
    vrot: number;
    size: number;
    opacity: number;
    color: number;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    life: number;
    maxLife: number;
    color: number;
}

interface RootSegment {
    startX: number;
    startY: number;
    midX: number;
    midY: number;
    endX: number;
    endY: number;
    wRatioStart: number;
    wRatioEnd: number;
    progress: number;
    delay: number;
}

interface TreeNode {
    x: number;
    y: number;
    textX: number; // 枝の位置とは独立した、テキストの実際の表示X座標
    textY: number; // テキストの実際の表示Y座標
    word: string;
    textSprite: Text;
    timeOffset: number;
    opacity: number;
    parentIndex: number; // 親ノードへのインデックス
    radius: number; // レオナルドの法則による枝の太さ
    generation: number; // 根元からの深さ
    status: 'target' | 'cleared' | 'dead'; // タイピングターゲット、クリア済み、腐朽による死亡
    life: number; // 寿命（残り秒数）
    maxLife: number; // 最大寿命
    isFocused: boolean; // 現在の入力のターゲットになっているか
    shake: number; // ミス時の揺れ強度
    leafOpacity: number; // 葉っぱ自体のフェードイン用
    leaves: Leaf[]; // このノードに属する葉っぱ
    hasMissed: boolean; // この単語でミスをしたか
}

interface Branch {
    startIndex: number;
    endIndex: number;
    progress: number;
    controlPointOffset: number;
}

export class WorldTree {
    public container: Container;
    
    private graphics: Graphics;
    private nodesContainer: Container;
    
    private attractors: Attractor[] = [];
    private nodes: TreeNode[] = [];
    private branches: Branch[] = [];
    private roots: RootSegment[] = []; // 追加: 根の配列
    private spirits: Spirit[] = []; 
    private animals: GardenAnimal[] = []; // 追加: 庭の動物たち
    private fallingLeaves: FallingLeaf[] = []; // 散った葉
    private particles: Particle[] = []; // 汎用パーティクル
    private isAscending: boolean = false;
    private ascensionProgress: number = 0;
    private time: number = 0;
    private maxGeneration: number = 0; // 追加: 称号判定用の最大深度
    private currentInput: string = ""; // 現在の入力内容を保持
    private appRenderer: any = null; // レンダラーを保持（キャプチャ用）
    
    public vitality: number = 60; // 木の生命力（残り時間）
    public maxVitality: number = 60;
    
    private camera = { x: 0, y: 0, zoom: 1.2 }; 
    private targetCamera = { x: 0, y: 0, zoom: 1.2 }; 
    
    private screenWidth: number = 0;
    private screenHeight: number = 0;
    
    private isPlaying: boolean = false;
    private isGardenMode: boolean = false;
    private unlockedTitlesCount: number = 0; // 追加
    private textStyle: TextStyle;

    constructor() {
        this.container = new Container();
        
        this.graphics = new Graphics();
        this.container.addChild(this.graphics);
        
        this.nodesContainer = new Container();
        this.container.addChild(this.nodesContainer);
        
        this.textStyle = new TextStyle({
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 48,
            fill: '#ffffff',
            letterSpacing: 8,
            dropShadow: {
                alpha: 0.8,
                angle: 0,
                blur: 5,
                color: '#e0ffff',
                distance: 0,
            }
        });

    }

    public setRenderer(renderer: any) {
        this.appRenderer = renderer;
    }

    public clear() {
        this.isPlaying = false;
        this.isGardenMode = false;
        this.nodes.forEach(n => n.textSprite.destroy());
        this.nodes = [];
        this.branches = [];
        this.attractors = [];
        this.spirits = [];
        this.roots = [];
        this.fallingLeaves = [];
        this.particles = [];
        this.isAscending = false;
        this.ascensionProgress = 0;
        this.animals = [];
        this.nodesContainer.removeChildren();
        this.graphics.clear();
        this.maxGeneration = 0;
    }

    private spawnParticles(x: number, y: number, color: number, count: number = 10) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 2;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 3,
                life: 0,
                maxLife: 0.5 + Math.random() * 0.5,
                color
            });
        }
    }

    /**
     * 木を光にして天に還すエフェクトを開始する
     */
    /**
     * 木のシルエットをキャプチャしてDataURLを返す
     */
    public async captureTreeSilhouette(): Promise<string> {
        if (!this.appRenderer) return "";

        // キャプチャ用に一時的に状態を調整
        const originalTextVisibility = this.nodesContainer.visible;

        // テキストを非表示にする（シルエットのみ）
        this.nodesContainer.visible = false;

        // 全体を捉えるために境界を計算（必要に応じて将来的にズーム調整に使用可能）
        // let minX = 0, maxX = 0, minY = 0, maxY = 0;
        // this.nodes.forEach(n => {
        //     minX = Math.min(minX, n.x);
        //     maxX = Math.max(maxX, n.x);
        //     minY = Math.min(minY, n.y);
        //     maxY = Math.max(maxY, n.y);
        // });

        // キャプチャ実行
        try {
            const canvas = await this.appRenderer.extract.canvas(this.container);
            const dataUrl = canvas.toDataURL("image/png");
            
            // 元に戻す
            this.nodesContainer.visible = originalTextVisibility;
            
            return dataUrl;
        } catch (e) {
            console.error("Capture failed", e);
            this.nodesContainer.visible = originalTextVisibility;
            return "";
        }
    }

    public triggerAscension(callback: () => void) {
        if (this.isAscending) return;
        this.isAscending = true;
        this.ascensionProgress = 0;
        
        // エフェクト時間を短縮
        const duration = 800; // 0.8秒
        const start = Date.now();
        
        const tick = () => {
            const now = Date.now();
            this.ascensionProgress = Math.min(1, (now - start) / duration);
            
            if (this.ascensionProgress < 1) {
                requestAnimationFrame(tick);
            } else {
                callback();
            }
        };
        tick();
    }

    public startPlay() {
        if (this.isPlaying) return;
        
        // 前回のゲーム状態を完全にクリア
        this.clear();
        
        this.isPlaying = true;
        this.isGardenMode = false;
        this.time = 0;
        this.vitality = this.maxVitality; // 生命力を初期化
        
        // 樹冠（キャノピー）を形成する引き寄せポイント（栄養）を生成
        this.generateAttractors();
        
        // 初期のホタル（精霊）を10匹ほど生成
        for (let i = 0; i < 10; i++) {
            this.spirits.push({
                x: (Math.random() - 0.5) * 400,
                y: -100 - Math.random() * 400,
                vx: 0,
                vy: 0,
                size: 2 + Math.random() * 3,
                phase: Math.random() * Math.PI * 2,
                targetNodeIndex: -1
            });
        }
        
        // 最初の芽（根元）を追加
        this.addNode(0, 0, 'GREIN', -1);
    }

    /**
     * タイトル画面用の「世界樹の庭」を表示する
     * @param titlesCount 獲得している称号の数
     */
    public showGarden(titlesCount: number) {
        this.clear();
        this.isGardenMode = true;
        this.unlockedTitlesCount = titlesCount;
        this.isPlaying = false;
        this.time = 0;
        
        this.generateAttractors();
        
        // 称号数に応じたホタルの数（最低10匹、称号1つにつき5匹追加）
        const spiritCount = 10 + titlesCount * 5;
        for (let i = 0; i < spiritCount; i++) {
            this.spirits.push({
                x: (Math.random() - 0.5) * 800,
                y: -100 - Math.random() * 600,
                vx: 0,
                vy: 0,
                size: 2 + Math.random() * 3,
                phase: Math.random() * Math.PI * 2,
                targetNodeIndex: -1
            });
        }
        
        // 最初の芽
        this.addNode(0, 0, 'GREIN', -1);
        
        // 称号数に応じた成長段階（より豊かに成長するように再調整）
        if (titlesCount >= 1) {
            // 指定したノード群から新しい層を生成するヘルパー関数
            const growLayer = (layerNodes: number[], chance: number): number[] => {
                const nextLayer: number[] = [];
                layerNodes.forEach(idx => {
                    if (Math.random() < chance) {
                        const startLen = this.nodes.length;
                        this.growFromNode(idx);
                        for (let i = startLen; i < this.nodes.length; i++) {
                            nextLayer.push(i);
                        }
                    }
                });
                return nextLayer;
            };

            let currentLayer = [0];

            // 称号1個以上: 幹と基本の枝 (第1〜2層)
            currentLayer = growLayer(currentLayer, 1.0);
            currentLayer = growLayer(currentLayer, 1.0);

            // 称号4個以上: 若木 (第3〜4層)
            if (titlesCount >= 4) {
                currentLayer = growLayer(currentLayer, 0.9);
                currentLayer = growLayer(currentLayer, 0.8);
            }

            // 称号8個以上: 清らかな森 (第5〜6層)
            if (titlesCount >= 8) {
                currentLayer = growLayer(currentLayer, 0.8);
                currentLayer = growLayer(currentLayer, 0.7);
            }

            // 称号13個以上: 生い茂る森 (第7〜8層)
            if (titlesCount >= 13) {
                currentLayer = growLayer(currentLayer, 0.7);
                currentLayer = growLayer(currentLayer, 0.6);
            }

            // 称号19個以上: ユグドラシルの庭 (第9〜11層)
            if (titlesCount >= 19) {
                currentLayer = growLayer(currentLayer, 0.6);
                currentLayer = growLayer(currentLayer, 0.5);
                currentLayer = growLayer(currentLayer, 0.5);
            }

            // 称号25個以上: 悠久なる再生の地 (第12層〜)
            if (titlesCount >= 25) {
                currentLayer = growLayer(currentLayer, 0.5);
                currentLayer = growLayer(currentLayer, 0.4);
            }

            // 動物の追加
            this.addGardenAnimals(titlesCount);
        }

        // 庭モードではアニメーションを完了状態にする
        this.branches.forEach(b => b.progress = 1);
        this.roots.forEach(r => {
            r.progress = 1;
            r.delay = 0;
        });
        
        // カメラの構図を調整（木の上部をより広く見せるため y = -50 に設定）
        this.targetCamera.y = -50; 
        this.targetCamera.x = 0;
        this.targetCamera.zoom = 1.0; 

        this.nodes.forEach(n => {
            // 成長するほど言葉の記憶（テキスト）を少しずつ濃くする
            const baseOpacity = titlesCount === 0 ? 0.6 : 0.15 + (titlesCount * 0.05);
            n.opacity = Math.min(0.8, baseOpacity);
            n.leafOpacity = 1;
            n.status = 'cleared'; // ターゲット状態にしない（タイピングを無効化）
        });
    }

    /**
     * 称号数に応じた動物を庭に配置する
     */
    private addGardenAnimals(titlesCount: number) {
        this.animals = [];
        
        // レベル1: 鴉 (フギン & ムニン)
        if (titlesCount >= 1) {
            for (let i = 0; i < 2; i++) {
                this.animals.push({
                    x: (Math.random() - 0.5) * 600,
                    y: -200 - Math.random() * 200, // 見切れないように高さを下げる
                    type: 'raven',
                    opacity: 0,
                    targetOpacity: 0.6,
                    scale: 0.5 + Math.random() * 0.3,
                    phase: Math.random() * Math.PI * 2,
                    side: Math.random() > 0.5 ? 1 : -1
                });
            }
        }

        // レベル2: 雄鹿 (エイクスュルニル)
        if (titlesCount >= 4) {
            this.animals.push({
                x: -320, y: 50,
                type: 'stag',
                opacity: 0,
                targetOpacity: 0.8,
                scale: 0.8,
                phase: Math.random() * Math.PI * 2,
                side: -1
            });
        }

        // レベル3: 牝牛、蛇
        if (titlesCount >= 8) {
            // 牝牛 (アウドムラ) は左側根元に
            this.animals.push({
                x: -120, y: 100,
                type: 'cow',
                opacity: 0,
                targetOpacity: 0.6,
                scale: 1.1,
                phase: Math.random() * Math.PI * 2,
                side: 1
            });

            // 蛇 (ニーズヘッグ)
            this.animals.push({
                x: 160, y: 120,
                type: 'snake',
                opacity: 0,
                targetOpacity: 0.5,
                scale: 1.0,
                phase: Math.random() * Math.PI * 2,
                side: 1
            });
        }

        // レベル4: 栗鼠 (ラタトスク) と 山羊 (ヘイズルーン)
        if (titlesCount >= 13) {
            // 栗鼠
            this.animals.push({
                x: 150, y: -200,
                type: 'squirrel',
                opacity: 0,
                targetOpacity: 0.7,
                scale: 0.4,
                phase: Math.random() * Math.PI * 2,
                side: 1
            });
            // 山羊 (ヘイズルーン)
            this.animals.push({
                x: 80, y: 110,
                type: 'goat',
                opacity: 0,
                targetOpacity: 0.7,
                scale: 0.7,
                phase: Math.random() * Math.PI * 2,
                side: -1
            });
        }

        // レベル4: 八本足の馬 (スレイプニル) と 鷲 (フレズベルグ)
        if (titlesCount >= 19) {
            // スレイプニル
            this.animals.push({
                x: 300, y: 90, // 少し上に調整
                type: 'horse',
                opacity: 0,
                targetOpacity: 0.9,
                scale: 1.0,
                phase: Math.random() * Math.PI * 2,
                side: 1
            });

            // 鷲 (フレズベルグ) は木の最上部に
            this.animals.push({
                x: 0, y: -450, // 見切れないように下げる
                type: 'eagle',
                opacity: 0,
                targetOpacity: 0.8,
                scale: 1.2,
                phase: Math.random() * Math.PI * 2,
                side: 1
            });
        }
    }

    private generateAttractors() {
        const count = 300;
        const centerX = 0;
        const centerY = -400; 
        const radiusX = 600;  
        const radiusY = 400;  
        
        for (let i = 0; i < count; i++) {
            const r = Math.sqrt(Math.random());
            const theta = Math.random() * 2 * Math.PI;
            this.attractors.push({
                x: centerX + r * radiusX * Math.cos(theta),
                y: centerY + r * radiusY * Math.sin(theta),
                active: true
            });
        }
    }

    private addNode(x: number, y: number, word: string, parentIndex: number) {
        const textSprite = new Text({ text: word, style: this.textStyle });
        textSprite.anchor.set(0.5);
        textSprite.x = x;
        textSprite.y = y;
        textSprite.alpha = 0;
        
        this.nodesContainer.addChild(textSprite);
        
        const nodeIndex = this.nodes.length;
        const generation = parentIndex >= 0 ? this.nodes[parentIndex].generation + 1 : 0;
        const baseRadius = 1.5; 
        
        // プロシージャルな葉っぱを生成 (2〜4枚)
        const leafCount = Math.floor(Math.random() * 3) + 2; 
        const leaves: Leaf[] = [];
        for (let i = 0; i < leafCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 5 + Math.random() * 20; // 枝の先端を中心に散らす
            leaves.push({
                offsetX: Math.cos(angle) * dist,
                offsetY: Math.sin(angle) * dist,
                angle: Math.random() * Math.PI * 2,
                size: 4 + Math.random() * 6,
                phase: Math.random() * Math.PI * 2
            });
        }
        
        const maxLife = 15 + Math.random() * 15; // 15〜30秒で腐朽する
        
        this.nodes.push({
            x, y, 
            textX: x, textY: y, 
            word, textSprite,
            timeOffset: Math.random() * Math.PI * 2,
            opacity: 0,
            parentIndex,
            radius: baseRadius,
            generation,
            status: 'target',
            life: maxLife,
            maxLife: maxLife,
            isFocused: false,
            shake: 0,
            leafOpacity: 0,
            leaves,
            hasMissed: false
        });
        
        // 最大深度を更新
        if (generation > this.maxGeneration) {
            this.maxGeneration = generation;
        }
        
        if (parentIndex >= 0) {
            this.branches.push({
                startIndex: parentIndex,
                endIndex: nodeIndex,
                progress: 0,
                controlPointOffset: (Math.random() - 0.5) * 60
            });
            
            // レオナルド・ダ・ヴィンチの法則による太さ計算
            let currentIdx = parentIndex;
            while (currentIdx >= 0) {
                const node = this.nodes[currentIdx];
                node.radius = Math.sqrt(Math.pow(node.radius, 2) + Math.pow(baseRadius, 2));
                currentIdx = node.parentIndex;
            }
        }
    }
    
    public onTypingInput(input: string) {
        const trimmedInput = input.trim();
        this.currentInput = trimmedInput; // フォーカス判定のために保持
        
        if (!this.isPlaying || trimmedInput === '') {
            // 入力が空（またはスペースのみ）になったらすべてのフォーカスを解除
            this.nodes.forEach(n => n.isFocused = false);
            return;
        }
        
        const activeTargets = this.nodes.filter(n => n.status === 'target');
        
        // フォーカス状態の更新（入力文字列で始まる単語をフォーカス）
        this.nodes.forEach(n => {
            if (n.status === 'target') {
                n.isFocused = n.word.startsWith(this.currentInput);
            } else {
                n.isFocused = false;
            }
        });
        
        // 1. 完全一致する単語があるか？
        const matchedIndices: number[] = [];
        this.nodes.forEach((n, index) => {
            if (n.status === 'target' && n.word === this.currentInput) {
                matchedIndices.push(index);
            }
        });
        
        if (matchedIndices.length > 0) {
            // クリアされた単語の情報を通知（スコア計算用）
            const word = this.nodes[matchedIndices[0]].word;
            const count = matchedIndices.length;
            window.dispatchEvent(new CustomEvent('clear-input', { 
                detail: { 
                    word, 
                    count,
                    noMiss: !this.nodes[matchedIndices[0]].hasMissed 
                } 
            }));
            
            let totalRecovery = 0;
            
            matchedIndices.forEach(index => {
                const node = this.nodes[index];
                
                // クリア時のパーティクル
                this.spawnParticles(node.textX, node.textY, 0xe0ffff, 15);
                
                // 腐朽が進んでいる（寿命が短い）ほど回復量が増えるボーナス
                const decayRatio = 1.0 - (node.life / node.maxLife);
                const difficultyFactor = 1 + (this.nodes.length / 500);
                
                // 仕様：長い単語ほど大幅に回復。ベースは文字数に基づく（5文字で1秒、10文字で2秒程度）
                const baseRecovery = word.length * 0.2;
                const decayBonus = 1 + (decayRatio * 3); // 完全に腐る直前なら最大4倍の回復
                const recovery = (baseRecovery * decayBonus) / difficultyFactor;
                
                totalRecovery += recovery;
                
                node.status = 'cleared';
                this.growFromNode(index);
                
                // 言葉がクリアされた時に50%の確率で新しいホタルを1匹発生させる
                if (Math.random() > 0.5) {
                    this.spirits.push({
                        x: node.x,
                        y: node.y,
                        vx: (Math.random() - 0.5) * 2, // 飛び散る速度を抑える
                        vy: (Math.random() - 0.5) * 2,
                        size: 2 + Math.random() * 3,
                        phase: Math.random() * Math.PI * 2,
                        targetNodeIndex: -1
                    });
                }
            });
            
            // 計算した合計回復量を生命力に加算
            this.vitality = Math.min(this.maxVitality, this.vitality + totalRecovery);
            
            return;
        }
        
        // 2. 途中まで一致する単語（プレフィックス）があるかチェック（ミス判定）
        const isValidPrefix = activeTargets.some(n => n.word.startsWith(this.currentInput));
        if (!isValidPrefix) {
            // ミス！
            // 生命力を直接削るペナルティ（一律1秒）
            this.vitality = Math.max(0, this.vitality - 1);
            
            // フォーカスされていた単語があれば揺らす
            this.nodes.forEach(n => {
                if (n.isFocused) {
                    n.shake = 15;
                    n.hasMissed = true; // ミスを記録
                }
            });
            window.dispatchEvent(new CustomEvent('typing-error'));
        }
    }
    
    private growFromNode(parentIndex: number) {
        const killDistance = 60; 
        const myAttractors: Attractor[] = [];
        
        this.attractors.forEach(attr => {
            if (!attr.active) return;
            
            let minDistSq = Infinity;
            let closestNodeIndex = -1;
            
            for (let i = 0; i < this.nodes.length; i++) {
                const node = this.nodes[i];
                const distSq = (attr.x - node.x)**2 + (attr.y - node.y)**2;
                if (distSq < minDistSq) {
                    minDistSq = distSq;
                    closestNodeIndex = i;
                }
            }
            
            if (minDistSq < killDistance * killDistance) {
                attr.active = false;
                return;
            }
            
            if (closestNodeIndex === parentIndex) {
                myAttractors.push(attr);
            }
        });
        
        let dirX = 0;
        let dirY = 0;
        myAttractors.forEach(attr => {
            const node = this.nodes[parentIndex];
            const dist = Math.sqrt((attr.x - node.x)**2 + (attr.y - node.y)**2);
            dirX += (attr.x - node.x) / dist;
            dirY += (attr.y - node.y) / dist;
        });
        
        const len = Math.sqrt(dirX**2 + dirY**2);
        const parentNode = this.nodes[parentIndex];
        let baseAngle = -Math.PI / 2; 
        
        if (len > 0) {
            baseAngle = Math.atan2(dirY, dirX);
        } else {
            const crownCenterY = -400;
            baseAngle = Math.atan2(parentNode.y - crownCenterY, parentNode.x - 0);
            if (parentNode.y > -50) baseAngle = -Math.PI / 2;
        }
        
        // 成長のジレンマ：木が育つほど分岐が増え、管理すべき言葉が増える
        let spawnCount = 1;
        if (this.isGardenMode) {
            spawnCount = Math.random() > 0.6 ? 3 : 2;
        } else {
            // 成長のジレンマ：段階ごとに分岐確率を固定値で制御
            let p2 = 0;
            let p3 = 0;
            if (this.nodes.length < 5) {
                // 序盤（0〜5ノード）
                p2 = 0.35;
                p3 = 0.00;
            } else if (this.nodes.length < 40) {
                // 中盤（5〜40ノード）
                p2 = 0.40;
                p3 = 0.15;
            } else {
                // 終盤（40ノード〜）
                p2 = 0.45;
                p3 = 0.35;
            }

            const rand = Math.random();
            if (rand < p3) {
                spawnCount = 3;
            } else if (rand < p3 + p2) {
                spawnCount = 2;
            } else {
                spawnCount = 1;
            }
        }
        
        // 最初の単語（GREIN）をクリアした直後は、必ず1本だけ伸ばし、同時に根を生やす
        if (parentIndex === 0) {
            spawnCount = 1;
            this.generateRoots(parentNode.x, parentNode.y);
        }
        
        const segmentLength = 100;
        
        for (let i = 0; i < spawnCount; i++) {
            const angleOffset = spawnCount > 1 ? (i === 0 ? -0.4 : 0.4) : (Math.random() * 0.4 - 0.2);
            const angle = baseAngle + angleOffset;
            const distance = segmentLength * (0.8 + Math.random() * 0.4);
            
            const newX = parentNode.x + Math.cos(angle) * distance;
            const newY = parentNode.y + Math.sin(angle) * distance;
            
            const randomWord = WORD_DICTIONARY[Math.floor(Math.random() * WORD_DICTIONARY.length)];
            
            this.addNode(newX, newY, randomWord, parentIndex);
        }
    }

    /**
     * 指定された位置から下方へ向かって根（フラクタルツリー）を生成する
     */
    private generateRoots(startX: number, startY: number) {
        // 3〜4本のメインの根を下方に向けて生やす
        const rootCount = 3 + Math.floor(Math.random() * 2);
        // レオナルドの法則に基づいて、根1本あたりの初期太さ比率を計算
        const initialRatio = 1.0 / Math.sqrt(rootCount) * 1.5; 
        
        for (let i = 0; i < rootCount; i++) {
            // 真下(Math.PI/2)を中心に扇状に広がる
            const angle = Math.PI / 2 + (Math.random() - 0.5) * 1.5;
            this.buildRootFractal(startX, startY, initialRatio, angle, 0);
        }
    }

    private buildRootFractal(x: number, y: number, radiusRatio: number, angle: number, depth: number) {
        if (depth > 3) return; // 根の深さは最大4階層
        
        const length = 30 + Math.random() * 30 - depth * 10;
        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;
        
        // 根もベジェ曲線で少しうねらせる
        const midX = (x + endX) / 2 + (Math.random() - 0.5) * 20;
        const midY = (y + endY) / 2;
        
        const endRatio = radiusRatio * 0.6; // 先端ほど細く
        
        this.roots.push({
            startX: x, startY: y,
            midX, midY,
            endX, endY,
            wRatioStart: radiusRatio, wRatioEnd: endRatio,
            progress: 0,
            delay: depth * 15 // 階層が深いほど生え始めるのを遅らせる
        });
        
        // 次の階層への分岐（1〜2本）
        const branchCount = Math.random() > 0.4 ? 2 : 1;
        for (let j = 0; j < branchCount; j++) {
            const nextAngle = angle + (Math.random() - 0.5) * 1.0;
            this.buildRootFractal(endX, endY, endRatio, nextAngle, depth + 1);
        }
    }

    public resize(width: number, height: number) {
        this.screenWidth = width;
        this.screenHeight = height;
    }

    public update(ticker: Ticker) {
        if (!this.isPlaying && !this.isGardenMode) return;
        
        const dt = ticker.deltaTime;
        const deltaSec = ticker.deltaMS / 1000;
        this.time += dt * 0.05;
        
        // アクティブなターゲット（タイピング対象）を取得
        const activeTargets = this.nodes.filter(n => n.status === 'target');

        if (this.isPlaying) {
            // 難易度係数: ノードが増えるほど時間がわずかに速く進み、回復がわずかに減る
            const difficultyFactor = 1 + (this.nodes.length / 500);
            
            // 生命力の減少（時間経過による自然減少）
            this.vitality -= deltaSec * difficultyFactor;
            if (this.vitality <= 0) {
                this.vitality = 0;
                this.isPlaying = false;
                window.dispatchEvent(new CustomEvent('game-over', { 
                    detail: { maxDepth: this.maxGeneration } 
                }));
            }
            
            // HUDに生命力を伝達
            window.dispatchEvent(new CustomEvent('update-vitality', { detail: this.vitality }));
            
            // 単語の補充ロジック: 画面からターゲットが消えたら新しい「種」を根元に生成
            if (activeTargets.length === 0) {
                const randomWord = WORD_DICTIONARY[Math.floor(Math.random() * WORD_DICTIONARY.length)];
                this.addNode(0, 0, randomWord, -1);
            }
        }

        // 動物の更新
        this.animals.forEach(animal => {
            // 周期的にフェードイン・アウト（もっと頻繁に、かつ長く表示されるように調整）
            const cycle = Math.sin(this.time * 0.3 + animal.phase);
            animal.targetOpacity = cycle > -0.2 ? 0.7 : 0; // 表示される期間を大幅に増やす
            animal.opacity += (animal.targetOpacity - animal.opacity) * 0.05 * dt;

            // 種類ごとの微細な動き
            if (animal.type === 'raven') {
                // 大きく旋回
                animal.x += Math.cos(this.time * 0.2 + animal.phase) * 1.2 * dt * animal.side;
                animal.y += Math.sin(this.time * 0.3 + animal.phase) * 0.8 * dt;
            } else if (animal.type === 'squirrel') {
                // ちょこまかと動く
                animal.x += Math.sin(this.time * 1.5 + animal.phase) * 0.4 * dt;
            } else if (animal.type === 'horse') {
                // スレイプニルは力強く足踏み（徐々に上がっていかないようにcosでバウンドさせる）
                animal.y += Math.cos(this.time * 2 + animal.phase) * 0.6 * dt;
            } else if (animal.type === 'snake') {
                // 蛇はうねうねと動く
                animal.x += Math.sin(this.time * 0.3 + animal.phase) * 0.8 * dt;
            } else if (animal.type === 'eagle') {
                // 鷲はゆったりと羽ばたく
                animal.y += Math.sin(this.time * 0.15 + animal.phase) * 0.4 * dt;
            } else {
                // 雄鹿や牛は静かに呼吸するように上下
                animal.y += Math.sin(this.time * 0.1 + animal.phase) * 0.2 * dt;
            }
        });
        
        let minX = 0, maxX = 0, minY = 0, maxY = 0;
        
        // --- テキストの重なり回避（安定化ロジック） ---
        const visibleNodes = this.nodes.filter(n => n.opacity > 0.1);
        
        visibleNodes.forEach((node, i) => {
            // 元の位置に戻ろうとする微弱な引力
            node.textX += (node.x - node.textX) * 0.05;
            node.textY += (node.y - node.textY) * 0.05;
            
            for (let j = i + 1; j < visibleNodes.length; j++) {
                const other = visibleNodes[j];
                
                const dx = node.textX - other.textX;
                const dy = node.textY - other.textY;
                const distX = Math.abs(dx);
                const distY = Math.abs(dy);
                
                const minSpaceX = (node.textSprite.width + other.textSprite.width) / 2 + 10;
                const minSpaceY = 35; 
                
                if (distX < minSpaceX && distY < minSpaceY) {
                    // 重なっている場合のみ、少しだけ押し出す
                    // 方向はインデックスに基づいて固定し、振動を防ぐ
                    const moveX = (minSpaceX - distX) * 0.1;
                    const moveY = (minSpaceY - distY) * 0.1;
                    
                    const dirX = dx === 0 ? (i % 2 === 0 ? 1 : -1) : Math.sign(dx);
                    const dirY = dy === 0 ? (j % 2 === 0 ? 1 : -1) : Math.sign(dy);
                    
                    node.textX += moveX * dirX * 0.5;
                    node.textY += moveY * dirY * 0.5;
                    other.textX -= moveX * dirX * 0.5;
                    other.textY -= moveY * dirY * 0.5;
                }
            }
        });

        // テキストのアニメーション、腐朽処理、カメラ用バウンディングボックスの更新
        this.nodes.forEach((node) => {
            // 腐朽（デケイ）ロジック
            if (node.status === 'target') {
                node.life -= deltaSec;
                if (node.life <= 0) {
                    node.status = 'dead';
                    // 落葉ペナルティ！
                    this.vitality -= 5; // 5秒の強烈なダメージ
                    
                    // 落葉エフェクトの生成
                    node.leaves.forEach(leaf => {
                        this.fallingLeaves.push({
                            x: node.x + leaf.offsetX,
                            y: node.y + leaf.offsetY,
                            vx: (Math.random() - 0.5) * 2,
                            vy: 1 + Math.random() * 2,
                            rot: leaf.angle,
                            vrot: (Math.random() - 0.5) * 0.2,
                            size: leaf.size,
                            opacity: 0.7,
                            color: (node as any).currentColor || 0xe0ffff
                        });
                    });

                    window.dispatchEvent(new CustomEvent('leaf-fallen', { detail: node.word }));
                }
            }

            minX = Math.min(minX, node.textX);
            maxX = Math.max(maxX, node.textX);
            minY = Math.min(minY, node.textY);
            maxY = Math.max(maxY, node.textY);
            
            // 腐朽具合に応じた色の変化
            let nodeColor = 0xe0ffff; // ベースの新鮮なシアン
            if (node.status === 'target') {
                const decayRatio = 1.0 - (node.life / node.maxLife); // 0 (新鮮) -> 1 (死)
                
                // 通常時とフォーカス時でベースの明るさを変える
                if (node.isFocused) {
                    nodeColor = 0xffffff; // フォーカス時は白く発光
                }

                if (decayRatio > 0.4) {
                    const dangerRatio = (decayRatio - 0.4) * (1 / 0.6); 
                    // 朽ちていく色はオレンジ/黄色
                    const targetDecayColor = node.isFocused ? 0xffaa00 : 0xffcc00;
                    nodeColor = this.interpolateColor(nodeColor, targetDecayColor, dangerRatio);
                }
            }
            node.textSprite.tint = nodeColor;
            
            // 葉の色も連動させるために一時プロパティとして保存
            (node as any).currentColor = nodeColor;

            // シェイク処理とスケーリング
            let offsetX = 0;
            if (node.shake > 0) {
                offsetX = (Math.random() - 0.5) * node.shake;
                node.shake *= 0.8; // 減衰
                if (node.shake < 0.1) node.shake = 0;
            }

            // 状態に応じた透明度とスケールの目標値
            let targetOpacity = 0;
            let targetScale = 1.0;

            if (node.status === 'target') {
                targetOpacity = node.isFocused ? 1.0 : (this.currentInput.length > 0 ? 0.3 : 1.0);
                targetScale = node.isFocused ? 1.2 : (this.currentInput.length > 0 ? 0.7 : 1.0);
            } else {
                // dead or cleared
                targetOpacity = 0;
                targetScale = node.status === 'cleared' ? 1.5 : 0.8;
            }

            // 透明度とスケールの更新
            node.opacity += (targetOpacity - node.opacity) * 0.15;
            const currentScale = node.textSprite.scale.x;
            const newScale = currentScale + (targetScale - currentScale) * 0.2;
            node.textSprite.scale.set(newScale);

            // 完全に消えたら非表示
            node.textSprite.visible = node.opacity > 0.01;
            if (!node.textSprite.visible) return;

            node.textSprite.x = node.textX + offsetX;
            node.textSprite.y = node.textY + Math.sin(this.time * 0.8 + node.timeOffset) * 5;
            node.textSprite.alpha = node.opacity * (0.925 + Math.sin(this.time + node.timeOffset) * 0.075);

            // ハイライトスプライトの更新と、入力済み文字の消去
            if (node.isFocused && this.currentInput.length > 0) {
                // 入力済み文字を消した残り（未入力部分）を表示
                const remainingText = node.word.slice(this.currentInput.length);
                node.textSprite.text = remainingText;
                
                // 元の単語の全幅と、未入力部分の幅を取得して位置を調整
                // (anchorが0.5なので、右側に寄せる)
                const fullText = node.word;
                const tempText = new Text({ text: fullText, style: this.textStyle });
                const fullWidth = tempText.width;
                const remainingWidth = node.textSprite.width;
                tempText.destroy(); // 一時的なオブジェクトは破棄
                
                node.textSprite.x = node.textX + offsetX + (fullWidth / 2) - (remainingWidth / 2);
            } else {
                node.textSprite.text = node.word;
                node.textSprite.x = node.textX + offsetX;
            }
        });
        
        // カメラ制御（プレイ中は全体を捉える、庭モードは固定構図）
        if (!this.isGardenMode) {
            const treeCenterX = (minX + maxX) / 2;
            const treeCenterY = (minY + maxY) / 2;
            const treeWidth = Math.max(100, maxX - minX);
            const treeHeight = Math.max(100, maxY - minY);
            
            const paddingX = 300;
            const paddingY = 320; // 余白を少し削って表示を大きく
            const targetZoomX = this.screenWidth / (treeWidth + paddingX);
            const targetZoomY = (this.screenHeight * 0.85) / (treeHeight + paddingY); // 有効領域を85%に微増
            
            this.targetCamera.x = treeCenterX;
            this.targetCamera.y = treeCenterY;
            this.targetCamera.zoom = Math.min(1.2, targetZoomX, targetZoomY);
        }
        
        // 目標値へのスムーズな追従
        this.camera.x += (this.targetCamera.x - this.camera.x) * 0.05;
        this.camera.y += (this.targetCamera.y - this.camera.y) * 0.05;
        this.camera.zoom += (this.targetCamera.zoom - this.camera.zoom) * 0.05;
        
        this.graphics.clear();

        // 幹の太さを取得（根の太さの基準とする）
        const trunkRadius = this.nodes[0] ? this.nodes[0].radius : 1.5;

        // 根の描画
        this.roots.forEach(root => {
            if (root.delay > 0) {
                root.delay -= dt;
                return;
            }
            if (root.progress < 1) {
                root.progress += dt * 0.02;
                if (root.progress > 1) root.progress = 1;
            }
            if (root.progress > 0) {
                this.drawTaperedBranch(
                    this.graphics,
                    root.startX, root.startY,
                    root.midX, root.midY,
                    root.endX, root.endY,
                    root.wRatioStart * trunkRadius,
                    root.wRatioEnd * trunkRadius,
                    root.progress,
                    0.25 * root.progress // 根は地中なので枝より少し暗め（透明度高め）に描画
                );
            }
        });

        // 枝の描画
        this.branches.forEach(branch => {
            const startNode = this.nodes[branch.startIndex];
            const endNode = this.nodes[branch.endIndex];
            
            if (branch.progress < 1) {
                branch.progress += dt * 0.02;
                if (branch.progress > 1) branch.progress = 1;
            }
            
            const midX = (startNode.x + endNode.x) / 2 + branch.controlPointOffset;
            const midY = (startNode.y + endNode.y) / 2;
            
            const wStart = startNode.radius;
            const wEnd = endNode.radius;
            
            this.drawTaperedBranch(
                this.graphics,
                startNode.x, startNode.y,
                midX, midY,
                endNode.x, endNode.y,
                wStart, wEnd,
                branch.progress,
                0.6 * branch.progress
            );
        });

        // 葉っぱの描画
        this.nodes.forEach(node => {
            if (node.status === 'dead') return; // 死んだ枝の葉は散る
            
            if (node.leafOpacity < 1) {
                node.leafOpacity = Math.min(1, node.leafOpacity + dt * 0.02);
            }
            if (node.leafOpacity > 0) {
                node.leaves.forEach(leaf => {
                    const lx = node.x + leaf.offsetX;
                    const ly = node.y + leaf.offsetY;
                    // 風に揺れるように角度をアニメーション
                    const rot = leaf.angle + Math.sin(this.time + leaf.phase) * 0.3;
                    const color = (node as any).currentColor || 0xe0ffff;
                    this.drawLeaf(this.graphics, lx, ly, leaf.size, rot, node.leafOpacity * 0.7, color);
                });
            }

            // 庭モードかつ称号4個以上の場合、稀に花を咲かせる
            if (this.isGardenMode && this.unlockedTitlesCount >= 4 && node.leaves.length > 0) {
                // 決定論的なシード値（ノードの座標など）を用いて花の位置を決める
                const seed = node.x * 1.5 + node.y * 2.5;
                if (Math.abs(Math.sin(seed)) > 0.75) { // 25%の確率で花が咲く
                    const fx = node.x + Math.cos(seed) * 20;
                    const fy = node.y + Math.sin(seed) * 20;
                    this.drawFlower(this.graphics, fx, fy, 4, this.time + seed);
                }
            }
        });

        // ホタル（精霊）の更新と描画
        this.spirits.forEach(spirit => {
            // ターゲット（光っている言葉）に一定確率で興味を移す
            if (activeTargets.length > 0 && (spirit.targetNodeIndex === -1 || Math.random() < 0.01)) {
                spirit.targetNodeIndex = this.nodes.indexOf(activeTargets[Math.floor(Math.random() * activeTargets.length)]);
            }
            
            let tx = spirit.x;
            let ty = spirit.y - 100; // ターゲットがない場合は緩やかに上へ昇る
            if (spirit.targetNodeIndex !== -1 && this.nodes[spirit.targetNodeIndex]) {
                const targetNode = this.nodes[spirit.targetNodeIndex];
                tx = targetNode.textX; // テキストの実際の位置へ向かう
                ty = targetNode.textY;
            }
            
            const dx = tx - spirit.x;
            const dy = ty - spirit.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            // ターゲットに向かって「非常に弱く」引かれる（オービットを防ぐ）
            spirit.vx += (dx / dist) * 0.003 * dt;
            spirit.vy += (dy / dist) * 0.003 * dt;
            
            // 空気抵抗を強めにして最高速度を抑える
            spirit.vx *= 0.92;
            spirit.vy *= 0.92;
            
            // 大きく、ゆっくりとした「ふわふわ」な揺らぎ
            spirit.vx += Math.sin(this.time * 0.2 + spirit.phase) * 0.04;
            spirit.vy += Math.cos(this.time * 0.15 + spirit.phase) * 0.04;
            
            spirit.x += spirit.vx * dt;
            spirit.y += spirit.vy * dt;
            
            // ゆっくりと明滅し、ふわっと現れては完全に消えるパターン
            const alpha = Math.max(0, 0.25 * Math.sin(this.time * 0.8 + spirit.phase));
            
            if (alpha > 0) {
                // ぼんやりとした外側の光
                this.graphics.circle(spirit.x, spirit.y, spirit.size * 3).fill({ color: 0xe0ffff, alpha: alpha * 0.4 });
                // 中間の柔らかい光
                this.graphics.circle(spirit.x, spirit.y, spirit.size * 1.5).fill({ color: 0xe0ffff, alpha: alpha });
            }
        });

        // 動物の描画
        this.animals.forEach(animal => {
            if (animal.opacity > 0.01) {
                this.drawAnimal(this.graphics, animal);
            }
        });

        // 散った葉の更新と描画
        for (let i = this.fallingLeaves.length - 1; i >= 0; i--) {
            const leaf = this.fallingLeaves[i];
            leaf.x += leaf.vx * dt;
            leaf.y += leaf.vy * dt;
            leaf.vy += 0.05 * dt; // 重力
            leaf.rot += leaf.vrot * dt;
            leaf.opacity -= 0.01 * dt;
            
            if (leaf.opacity <= 0) {
                this.fallingLeaves.splice(i, 1);
            } else {
                this.drawLeaf(this.graphics, leaf.x, leaf.y, leaf.size, leaf.rot, leaf.opacity, leaf.color);
            }
        }

        // パーティクルの更新と描画
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life += deltaSec;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= 0.95;
            p.vy *= 0.95;
            
            const pAlpha = 1.0 - (p.life / p.maxLife);
            if (pAlpha <= 0) {
                this.particles.splice(i, 1);
            } else {
                this.graphics.circle(p.x, p.y, p.size).fill({ color: p.color, alpha: pAlpha });
            }
        }

        // 昇天エフェクトの実行中
        if (this.isAscending) {
            // 木全体を徐々に白く、そして上に昇らせる
            const glow = this.ascensionProgress;
            this.graphics.rect(-2000, -2000, 4000, 4000).fill({ color: 0xffffff, alpha: glow * 0.3 }); // 全体的なフラッシュ
            
            // 昇天パーティクルをランダムに発生
            if (Math.random() < 0.3) {
                const nx = (Math.random() - 0.5) * 1000;
                const ny = (Math.random() - 0.5) * 800 - 200;
                this.particles.push({
                    x: nx, y: ny,
                    vx: (Math.random() - 0.5) * 1,
                    vy: -2 - Math.random() * 5, // 上へ
                    size: 2 + Math.random() * 5,
                    life: 0,
                    maxLife: 2 + Math.random() * 2,
                    color: 0xffffff
                });
            }
            
            // カメラを少しずつ上に
            this.camera.y -= 2 * dt * glow;
        }

        // カメラのLerp
        this.camera.x += (this.targetCamera.x - this.camera.x) * 0.05 * dt;
        this.camera.y += (this.targetCamera.y - this.camera.y) * 0.05 * dt;
        this.camera.zoom += (this.targetCamera.zoom - this.camera.zoom) * 0.05 * dt;

        this.container.scale.set(this.camera.zoom);
        // 状態に応じて基準位置を調整
        // プレイ中(isGardenMode=false)は下部UIを避けるため高め(46%)に、庭モードはバランス重視で(54%)に配置
        const yAnchor = this.isGardenMode ? 0.54 : 0.46;
        this.container.x = (this.screenWidth / 2) - (this.camera.x * this.camera.zoom);
        this.container.y = (this.screenHeight * yAnchor) - (this.camera.y * this.camera.zoom);
    }

    /**
     * ベジェ曲線に沿って根元が太く、先端が細くなるテーパー状の枝を描画する
     */
    private drawTaperedBranch(
        graphics: Graphics,
        p0x: number, p0y: number,
        p1x: number, p1y: number,
        p2x: number, p2y: number,
        widthStart: number, widthEnd: number,
        progress: number,
        alpha: number
    ) {
        const steps = 15; 
        const leftPoints: {x: number, y: number}[] = [];
        const rightPoints: {x: number, y: number}[] = [];
        
        for (let i = 0; i <= steps; i++) {
            const s = (i / steps) * progress;
            const px = Math.pow(1 - s, 2) * p0x + 2 * (1 - s) * s * p1x + Math.pow(s, 2) * p2x;
            const py = Math.pow(1 - s, 2) * p0y + 2 * (1 - s) * s * p1y + Math.pow(s, 2) * p2y;
            
            const dx = 2 * (1 - s) * (p1x - p0x) + 2 * s * (p2x - p1x);
            const dy = 2 * (1 - s) * (p1y - p0y) + 2 * s * (p2y - p1y);
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const nx = -dy / len;
            const ny = dx / len;
            
            const currentWidth = widthStart * (1 - s) + widthEnd * s;
            const r = currentWidth / 2;
            
            leftPoints.push({ x: px + nx * r, y: py + ny * r });
            rightPoints.push({ x: px - nx * r, y: py - ny * r });
        }
        
        graphics.moveTo(leftPoints[0].x, leftPoints[0].y);
        for (let i = 1; i <= steps; i++) {
            graphics.lineTo(leftPoints[i].x, leftPoints[i].y);
        }
        for (let i = steps; i >= 0; i--) {
            graphics.lineTo(rightPoints[i].x, rightPoints[i].y);
        }
        
        graphics.fill({ color: 0xe0ffff, alpha: alpha });
    }

    /**
     * 小さな花を十字状に描画する
     */
    private drawFlower(graphics: Graphics, x: number, y: number, size: number, phase: number) {
        const alpha = 0.6 + Math.sin(phase) * 0.4; // 優しく明滅
        const s = size * (0.8 + Math.sin(phase * 0.5) * 0.2); // 少し揺らぐ
        
        graphics.moveTo(x - s, y).lineTo(x + s, y);
        graphics.moveTo(x, y - s).lineTo(x, y + s);
        
        // 斜め方向も追加して八角形っぽく
        const ds = s * 0.7;
        graphics.moveTo(x - ds, y - ds).lineTo(x + ds, y + ds);
        graphics.moveTo(x + ds, y - ds).lineTo(x - ds, y + ds);
        
        graphics.stroke({ width: 2, color: 0xffffff, alpha: alpha });
        // 中心に光の点
        graphics.circle(x, y, 1.5).fill({ color: 0xffffff, alpha: alpha });
    }

    /**
     * 指定した位置・角度で菱形の葉を描画する
     */
    private drawLeaf(graphics: Graphics, x: number, y: number, size: number, angle: number, alpha: number, color: number = 0xe0ffff) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        
        // 菱形(葉っぱ)の形状比率
        const w = size; // 長さ
        const h = size * 0.4; // 幅
        
        const p1x = x + cos * w;
        const p1y = y + sin * w;
        const p2x = x - sin * h;
        const p2y = y + cos * h;
        const p3x = x - cos * w;
        const p3y = y - sin * w;
        const p4x = x + sin * h;
        const p4y = y - cos * h;
        
        graphics.moveTo(p1x, p1y);
        graphics.lineTo(p2x, p2y);
        graphics.lineTo(p3x, p3y);
        graphics.lineTo(p4x, p4y);
        
        graphics.fill({ color: color, alpha: alpha });
    }

    private drawAnimal(graphics: Graphics, animal: GardenAnimal) {
        const { x, y, type, opacity, scale, side } = animal;
        const color = 0xe0ffff; // 共通の幻想的なシアン

        // PixiJS 8 の新しい描画スタイルに統一
        const strokeStyle = { width: 2 * scale, color, alpha: opacity };
        const fillStyle = { color, alpha: opacity * 0.3 };
        
        if (type === 'raven') {
            // 鴉 (フギン＆ムニン): より鳥らしいシルエットに修正
            const s = scale;
            const ox = x;
            const oy = y;
            
            // 胴体、頭、嘴、尾羽のシルエット
            graphics.moveTo(ox - 20 * s * side, oy + 5 * s); // 尾羽の後端
            graphics.lineTo(ox - 10 * s * side, oy + 2 * s); // 尾羽の付け根(上)
            graphics.quadraticCurveTo(ox + 5 * s * side, oy - 10 * s, ox + 15 * s * side, oy - 4 * s); // 背中から頭
            graphics.lineTo(ox + 24 * s * side, oy - 1 * s); // 鋭く太めの嘴(上)
            graphics.lineTo(ox + 15 * s * side, oy + 3 * s); // 嘴(下)
            graphics.quadraticCurveTo(ox + 5 * s * side, oy + 12 * s, ox - 10 * s * side, oy + 6 * s); // 胸から腹
            graphics.lineTo(ox - 18 * s * side, oy + 10 * s); // 尾羽の下部
            graphics.lineTo(ox - 20 * s * side, oy + 5 * s); // 尾羽を閉じる
            
            // 振り上げた翼
            graphics.moveTo(ox - 5 * s * side, oy - 2 * s);
            graphics.quadraticCurveTo(ox - 10 * s * side, oy - 22 * s, ox - 25 * s * side, oy - 25 * s); // 翼の上端
            graphics.quadraticCurveTo(ox - 15 * s * side, oy - 10 * s, ox - 2 * s * side, oy + 5 * s); // 翼の下端
            
            graphics.stroke(strokeStyle);
            graphics.fill(fillStyle);

        } else if (type === 'squirrel') {
            // 栗鼠 (ラタトスク): ふさふさの大きな尻尾と丸みのある体
            const s = scale; const ox = x; const oy = y;
            
            // 尻尾 (大きく、ふっくらと丸まったふさふさの尻尾)
            graphics.moveTo(ox - 2 * s * side, oy + 8 * s);
            graphics.quadraticCurveTo(ox - 35 * s * side, oy + 15 * s, ox - 30 * s * side, oy - 20 * s); // 外側のカーブ
            graphics.quadraticCurveTo(ox - 25 * s * side, oy - 45 * s, ox - 5 * s * side, oy - 35 * s); // 上部のふくらみ
            graphics.quadraticCurveTo(ox + 5 * s * side, oy - 25 * s, ox - 2 * s * side, oy - 5 * s); // 内側のカーブ
            graphics.quadraticCurveTo(ox - 8 * s * side, oy + 10 * s, ox - 2 * s * side, oy + 8 * s); // 付け根へ戻る
            
            // 胴体 (丸みを帯びたお座りポーズ)
            graphics.moveTo(ox - 2 * s * side, oy + 8 * s);
            graphics.quadraticCurveTo(ox - 5 * s * side, oy + 15 * s, ox + 5 * s * side, oy + 18 * s); // 背中からお尻
            graphics.lineTo(ox + 15 * s * side, oy + 18 * s); // 足元
            graphics.quadraticCurveTo(ox + 20 * s * side, oy + 10 * s, ox + 18 * s * side, oy + 5 * s); // お腹
            
            // 頭と耳
            graphics.quadraticCurveTo(ox + 25 * s * side, oy - 5 * s, ox + 20 * s * side, oy - 12 * s); // 顔のライン
            graphics.lineTo(ox + 22 * s * side, oy - 25 * s); // 耳1
            graphics.lineTo(ox + 16 * s * side, oy - 15 * s); // 耳の付け根
            graphics.lineTo(ox + 12 * s * side, oy - 24 * s); // 耳2
            graphics.lineTo(ox + 8 * s * side, oy - 12 * s); // 後頭部
            graphics.quadraticCurveTo(ox + 2 * s * side, oy - 5 * s, ox - 2 * s * side, oy + 8 * s); // 背中へ繋ぐ
            
            graphics.stroke(strokeStyle);
            graphics.fill(fillStyle);
            
            // 小さな手 (何かを持っているような仕草)
            graphics.moveTo(ox + 12 * s * side, oy + 8 * s);
            graphics.lineTo(ox + 16 * s * side, oy + 10 * s);
            graphics.stroke({ width: 1.5 * s, color, alpha: opacity * 0.8 });
        } else if (type === 'stag') {
            // 雄鹿: 立派な角と体
            const s = scale; const ox = x; const oy = y;
            // 胴体、首、頭、足
            graphics.moveTo(ox - 15 * s * side, oy + 10 * s); // 後ろ足下
            graphics.lineTo(ox - 10 * s * side, oy + 20 * s); 
            graphics.lineTo(ox - 5 * s * side, oy + 5 * s); // 後ろ足付け根
            graphics.lineTo(ox + 10 * s * side, oy + 5 * s); // 腹
            graphics.lineTo(ox + 15 * s * side, oy + 20 * s); // 前足下
            graphics.lineTo(ox + 20 * s * side, oy + 10 * s); // 前足
            graphics.lineTo(ox + 15 * s * side, oy - 5 * s); // 胸
            graphics.lineTo(ox + 25 * s * side, oy - 20 * s); // 首〜頭
            graphics.lineTo(ox + 30 * s * side, oy - 22 * s); // 鼻
            graphics.lineTo(ox + 20 * s * side, oy - 25 * s); // 頭頂
            graphics.lineTo(ox + 10 * s * side, oy - 10 * s); // 背中
            graphics.lineTo(ox - 15 * s * side, oy - 5 * s); // お尻
            graphics.lineTo(ox - 15 * s * side, oy + 10 * s); // 閉じる
            graphics.fill(fillStyle);
            
            // 角 (線画)
            graphics.moveTo(ox + 20 * s * side, oy - 25 * s);
            graphics.quadraticCurveTo(ox + 10 * s * side, oy - 40 * s, ox + 25 * s * side, oy - 50 * s);
            graphics.moveTo(ox + 15 * s * side, oy - 35 * s);
            graphics.lineTo(ox + 5 * s * side, oy - 45 * s);
            graphics.moveTo(ox + 18 * s * side, oy - 42 * s);
            graphics.lineTo(ox + 30 * s * side, oy - 45 * s);
            graphics.stroke(strokeStyle);
        } else if (type === 'horse') {
            // 八本足の馬 (スレイプニル)
            const s = scale; const ox = x; const oy = y;
            // 胴体
            graphics.moveTo(ox - 25 * s * side, oy + 10 * s); // お尻
            graphics.lineTo(ox - 20 * s * side, oy - 5 * s); // 背中
            graphics.lineTo(ox + 20 * s * side, oy - 5 * s); // 肩
            graphics.lineTo(ox + 35 * s * side, oy - 25 * s); // 頭頂
            graphics.lineTo(ox + 45 * s * side, oy - 20 * s); // 鼻
            graphics.lineTo(ox + 35 * s * side, oy - 10 * s); // 首下
            graphics.lineTo(ox + 25 * s * side, oy + 5 * s); // 胸
            graphics.lineTo(ox - 20 * s * side, oy + 10 * s); // 腹
            graphics.fill(fillStyle);

            // 足 (8本)
            for (let i = 0; i < 4; i++) {
                const off = i * 6 * s * side;
                graphics.moveTo(ox + 20 * s * side - off, oy + 5 * s);
                graphics.lineTo(ox + 25 * s * side - off, oy + 30 * s);
                graphics.moveTo(ox - 10 * s * side - off, oy + 8 * s);
                graphics.lineTo(ox - 15 * s * side - off, oy + 30 * s);
            }
            // 尻尾
            graphics.moveTo(ox - 25 * s * side, oy);
            graphics.quadraticCurveTo(ox - 35 * s * side, oy + 10 * s, ox - 30 * s * side, oy + 25 * s);
            graphics.stroke(strokeStyle);
        } else if (type === 'cow') {
            // 原初の牝牛 (アウドムラ)
            const s = scale; const ox = x; const oy = y;
            // どっしりとした胴体
            graphics.moveTo(ox - 30 * s * side, oy); // お尻
            graphics.quadraticCurveTo(ox - 10 * s * side, oy - 15 * s, ox + 20 * s * side, oy - 10 * s); // 背中
            graphics.lineTo(ox + 35 * s * side, oy - 20 * s); // 頭
            graphics.lineTo(ox + 45 * s * side, oy - 15 * s); // 鼻
            graphics.lineTo(ox + 30 * s * side, oy + 5 * s); // 首下
            graphics.lineTo(ox + 20 * s * side, oy + 20 * s); // 胸
            graphics.lineTo(ox - 20 * s * side, oy + 25 * s); // 腹 (たわむ)
            graphics.lineTo(ox - 30 * s * side, oy + 10 * s); // 閉じる
            graphics.fill(fillStyle);
            
            // 角
            graphics.moveTo(ox + 35 * s * side, oy - 20 * s);
            graphics.quadraticCurveTo(ox + 30 * s * side, oy - 35 * s, ox + 45 * s * side, oy - 35 * s);
            graphics.moveTo(ox + 33 * s * side, oy - 18 * s);
            graphics.quadraticCurveTo(ox + 28 * s * side, oy - 30 * s, ox + 40 * s * side, oy - 30 * s);

            // 足
            graphics.moveTo(ox - 20 * s * side, oy + 20 * s).lineTo(ox - 25 * s * side, oy + 45 * s);
            graphics.moveTo(ox - 10 * s * side, oy + 22 * s).lineTo(ox - 15 * s * side, oy + 45 * s);
            graphics.moveTo(ox + 10 * s * side, oy + 20 * s).lineTo(ox + 15 * s * side, oy + 45 * s);
            graphics.moveTo(ox + 20 * s * side, oy + 15 * s).lineTo(ox + 25 * s * side, oy + 45 * s);
            
            // 尻尾
            graphics.moveTo(ox - 30 * s * side, oy + 5 * s).lineTo(ox - 35 * s * side, oy + 30 * s);
            graphics.stroke(strokeStyle);
        } else if (type === 'snake') {
            // 蛇 (ニーズヘッグ)
            const s = scale; const ox = x; const oy = y;
            // 蛇の体 (サイン波で太さを持たせる)
            const pointsTop: {x: number, y: number}[] = [];
            const pointsBottom: {x: number, y: number}[] = [];
            for (let i = -50; i <= 50; i += 5) {
                const px = ox + i * s * side;
                const waveY = oy + Math.sin(i * 0.1 + this.time * 0.5) * 15 * s;
                const thickness = (50 - Math.abs(i)) / 50 * 8 * s + 2 * s; 
                pointsTop.push({x: px, y: waveY - thickness});
                pointsBottom.unshift({x: px, y: waveY + thickness});
            }
            
            graphics.moveTo(pointsTop[0].x, pointsTop[0].y);
            pointsTop.forEach(p => graphics.lineTo(p.x, p.y));
            // 頭 (先端)
            const headX = pointsTop[pointsTop.length - 1].x;
            const headY = pointsTop[pointsTop.length - 1].y;
            graphics.lineTo(headX + 10 * s * side, headY + 5 * s); // 鼻先
            graphics.lineTo(headX + 5 * s * side, headY + 10 * s); // 顎
            pointsBottom.forEach(p => graphics.lineTo(p.x, p.y));
            graphics.lineTo(pointsTop[0].x, pointsTop[0].y); // 尻尾を閉じる
            graphics.fill(fillStyle);
            
            // 舌
            graphics.moveTo(headX + 10 * s * side, headY + 5 * s);
            graphics.lineTo(headX + 20 * s * side, headY + 7 * s);
            graphics.lineTo(headX + 25 * s * side, headY + 5 * s);
            graphics.moveTo(headX + 20 * s * side, headY + 7 * s);
            graphics.lineTo(headX + 25 * s * side, headY + 10 * s);
            graphics.stroke(strokeStyle);
        } else if (type === 'eagle') {
            // 鷲 (フレズベルグ)
            const s = scale; const ox = x; const oy = y;
            // 胴体
            graphics.moveTo(ox, oy - 15 * s); // 頭頂
            graphics.lineTo(ox + 10 * s, oy - 5 * s); // 右肩
            graphics.lineTo(ox + 5 * s, oy + 20 * s); // 右腰
            graphics.lineTo(ox, oy + 30 * s); // 尾羽
            graphics.lineTo(ox - 5 * s, oy + 20 * s); // 左腰
            graphics.lineTo(ox - 10 * s, oy - 5 * s); // 左肩
            graphics.lineTo(ox, oy - 15 * s); // 閉じる
            
            // 左翼
            graphics.moveTo(ox - 10 * s, oy - 5 * s);
            graphics.quadraticCurveTo(ox - 50 * s, oy - 40 * s, ox - 90 * s, oy - 10 * s);
            graphics.quadraticCurveTo(ox - 50 * s, oy - 5 * s, ox - 5 * s, oy + 15 * s);
            
            // 右翼
            graphics.moveTo(ox + 10 * s, oy - 5 * s);
            graphics.quadraticCurveTo(ox + 50 * s, oy - 40 * s, ox + 90 * s, oy - 10 * s);
            graphics.quadraticCurveTo(ox + 50 * s, oy - 5 * s, ox + 5 * s, oy + 15 * s);
            
            graphics.fill(fillStyle);
            graphics.stroke(strokeStyle);
            
            // 嘴
            graphics.moveTo(ox - 3 * s, oy - 10 * s);
            graphics.lineTo(ox, oy - 5 * s);
            graphics.lineTo(ox + 3 * s, oy - 10 * s);
            graphics.stroke(strokeStyle);
        } else if (type === 'goat') {
            // 山羊 (ヘイズルーン)
            const s = scale; const ox = x; const oy = y;
            // 胴体
            graphics.moveTo(ox - 20 * s * side, oy + 5 * s); // お尻
            graphics.quadraticCurveTo(ox, oy - 10 * s, ox + 20 * s * side, oy - 5 * s); // 背中
            graphics.lineTo(ox + 25 * s * side, oy - 20 * s); // 頭
            graphics.lineTo(ox + 35 * s * side, oy - 15 * s); // 鼻
            graphics.lineTo(ox + 25 * s * side, oy + 5 * s); // 首下
            graphics.lineTo(ox - 15 * s * side, oy + 10 * s); // 腹
            graphics.fill(fillStyle);

            // 足
            graphics.moveTo(ox - 15 * s * side, oy + 10 * s).lineTo(ox - 18 * s * side, oy + 30 * s);
            graphics.moveTo(ox - 5 * s * side, oy + 10 * s).lineTo(ox - 8 * s * side, oy + 30 * s);
            graphics.moveTo(ox + 10 * s * side, oy + 5 * s).lineTo(ox + 12 * s * side, oy + 30 * s);
            graphics.moveTo(ox + 20 * s * side, oy + 5 * s).lineTo(ox + 22 * s * side, oy + 30 * s);

            // 角
            graphics.moveTo(ox + 25 * s * side, oy - 20 * s);
            graphics.quadraticCurveTo(ox + 20 * s * side, oy - 35 * s, ox + 15 * s * side, oy - 30 * s);

            // 顎髭
            graphics.moveTo(ox + 28 * s * side, oy - 10 * s).lineTo(ox + 28 * s * side, oy);

            graphics.stroke(strokeStyle);
        }
    }

    /**
     * 2つの色を比率に応じて滑らかに補間する
     */
    private interpolateColor(color1: number, color2: number, ratio: number): number {
        const r1 = (color1 >> 16) & 0xFF;
        const g1 = (color1 >> 8) & 0xFF;
        const b1 = color1 & 0xFF;
        
        const r2 = (color2 >> 16) & 0xFF;
        const g2 = (color2 >> 8) & 0xFF;
        const b2 = color2 & 0xFF;
        
        const r = Math.round(r1 + (r2 - r1) * Math.min(1, Math.max(0, ratio)));
        const g = Math.round(g1 + (g2 - g1) * Math.min(1, Math.max(0, ratio)));
        const b = Math.round(b1 + (b2 - b1) * Math.min(1, Math.max(0, ratio)));
        
        return (r << 16) | (g << 8) | b;
    }
}
