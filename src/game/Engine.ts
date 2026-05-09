import { Application, Container } from 'pixi.js';
import { WorldTree } from './WorldTree';

export class Engine {
    public app: Application;
    public stage: Container;
    public worldTree: WorldTree;
    public isInitialized: boolean = false;

    constructor() {
        this.app = new Application();
        this.stage = this.app.stage;
        this.worldTree = new WorldTree();
    }

    /**
     * エンジンの初期化
     * @param container キャンバスを配置する親要素
     */
    async init(container: HTMLElement) {
        await this.app.init({
            resizeTo: container,
            backgroundAlpha: 0, // CSSの背景（オーロラ）を透かせるために透明化
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        this.isInitialized = true;
        container.appendChild(this.app.canvas);

        // 世界樹の芽をステージに追加
        this.stage.addChild(this.worldTree.container);

        // 毎フレームの更新処理を登録
        this.app.ticker.add((ticker) => {
            // 常に最新のキャンバスサイズを取得してカメラに適用する（最大化時のズレを完全に防ぐ）
            if (this.app.screen) {
                this.worldTree.resize(this.app.screen.width, this.app.screen.height);
            }
            this.worldTree.update(ticker);
        });
    }

    public startPlay() {
        this.worldTree.startPlay();
    }

    /**
     * タイトル画面用の「世界樹の庭」を表示する
     */
    public showGarden(titlesCount: number) {
        this.worldTree.showGarden(titlesCount);
    }

    /**
     * 表示をリセットする
     */
    public reset() {
        this.worldTree.clear();
    }

    /**
     * 木を天に還すエフェクトを実行する
     */
    public triggerAscension(callback: () => void) {
        this.worldTree.triggerAscension(callback);
    }

    /**
     * エンジンの破棄（クリーンアップ用）
     */
    destroy() {
        if (this.app) {
            // まだ初期化されていない場合は破棄処理をスキップ（init()完了後に再度呼ばれるため）
            if (!this.isInitialized) {
                return;
            }

            // 初期化完了時のみキャンバス要素にアクセスする
            if (this.app.canvas && this.app.canvas.parentNode) {
                this.app.canvas.parentNode.removeChild(this.app.canvas);
            }
            
            try {
                this.app.destroy(true, {
                    children: true,
                    texture: true,
                });
            } catch (e) {
                console.warn('PixiJS already destroyed', e);
            }
        }
    }
}
