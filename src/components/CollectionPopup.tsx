import { TITLE_COLLECTION, TitleInfo } from '../game/TitleData';
import './CollectionPopup.css';

interface CollectionPopupProps {
    unlockedTitles: string[];
    onClose: () => void;
}

export function CollectionPopup({ unlockedTitles, onClose }: CollectionPopupProps) {
    const categories = [
        { id: 'skill', name: '技能の記憶', icon: '⚔️' },
        { id: 'style', name: '流儀の記憶', icon: '🌿' },
        { id: 'score', name: '神話の記憶', icon: '✨' },
        { id: 'record', name: '刻銘の記憶', icon: '📜' },
    ];

    const isUnlocked = (titleId: string) => unlockedTitles.includes(titleId);

    return (
        <div className="collection-overlay" onClick={onClose}>
            <div className="collection-content" onClick={e => e.stopPropagation()}>
                <header className="collection-header">
                    <h2>Hall of Memories</h2>
                    <p className="subtitle">— 紡がれた言葉の記録 —</p>
                    <button className="close-button" onClick={onClose}>×</button>
                </header>

                <div className="collection-stats">
                    <span className="stats-label">TOTAL RECOVERY</span>
                    <span className="stats-value">{unlockedTitles.length} / {TITLE_COLLECTION.length}</span>
                </div>

                <div className="collection-scroll-area">
                    {categories.map(category => (
                        <section key={category.id} className="collection-category">
                            <h3 className="category-title">
                                <span className="category-icon">{category.icon}</span>
                                {category.name}
                            </h3>
                            <div className="title-grid">
                                {TITLE_COLLECTION.filter(t => t.category === category.id).map(title => {
                                    const unlocked = isUnlocked(title.id);
                                    return (
                                        <div 
                                            key={title.id} 
                                            className={`title-card ${unlocked ? 'unlocked' : 'locked'}`}
                                        >
                                            <div className="card-header">
                                                <span className="title-name">
                                                    {unlocked ? title.name : '？？？'}
                                                </span>
                                                {unlocked && <span className="unlocked-icon">✦</span>}
                                            </div>
                                            <div className="card-body">
                                                <p className="title-description">
                                                    {unlocked ? title.description : title.hint}
                                                </p>
                                            </div>
                                            {!unlocked && (
                                                <div className="lock-overlay">
                                                    <span className="lock-icon">🔒</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>
                
                <footer className="collection-footer">
                    <button className="back-btn" onClick={onClose}>戻る</button>
                </footer>
            </div>
        </div>
    );
}
