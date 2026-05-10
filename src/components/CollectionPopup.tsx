import { useState } from 'react';
import { TITLE_COLLECTION } from '../game/TitleData';
import { GARDEN_ANIMALS } from '../game/AnimalData';
import './CollectionPopup.css';

interface CollectionPopupProps {
    unlockedTitles: string[];
    onClose: () => void;
}

export function CollectionPopup({ unlockedTitles, onClose }: CollectionPopupProps) {
    const [activeTab, setActiveTab] = useState<'titles' | 'animals'>('titles');

    const categories = [
        { id: 'skill', name: '技能の記憶', icon: '⚔️' },
        { id: 'style', name: '流儀の記憶', icon: '🌿' },
        { id: 'score', name: '神話の記憶', icon: '✨' },
        { id: 'record', name: '刻銘の記憶', icon: '📜' },
        { id: 'hidden', name: '語られぬ記憶', icon: '🌑' },
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

                <div className="collection-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'titles' ? 'active' : ''}`}
                        onClick={() => setActiveTab('titles')}
                    >
                        称号の記憶
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'animals' ? 'active' : ''}`}
                        onClick={() => setActiveTab('animals')}
                    >
                        生命の記憶
                    </button>
                </div>

                <div className="collection-scroll-area">
                    {activeTab === 'titles' ? (
                        categories.map(category => (
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
                                                        {unlocked ? title.description : (title.secret ? 'その条件は、まだ誰にも知られていない。' : title.hint)}
                                                    </p>
                                                    {unlocked && (
                                                        <p className="title-condition-faint">
                                                            [{title.hint}]
                                                        </p>
                                                    )}
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
                        ))
                    ) : (
                        <div className="animal-grid">
                            {GARDEN_ANIMALS.map(animal => {
                                const unlocked = unlockedTitles.length >= animal.unlockThreshold;
                                return (
                                    <div key={animal.id} className={`animal-card ${unlocked ? 'unlocked' : 'locked'}`}>
                                        <div className="animal-icon-container">
                                            <span className="animal-icon-large">
                                                {unlocked ? (
                                                    animal.id === 'raven' ? '🐦‍⬛' :
                                                    animal.id === 'stag' ? '🦌' :
                                                    animal.id === 'snake' ? '🐍' :
                                                    animal.id === 'cow' ? '🐄' :
                                                    animal.id === 'squirrel' ? '🐿️' :
                                                    animal.id === 'goat' ? '🐐' :
                                                    animal.id === 'horse' ? '🐎' :
                                                    animal.id === 'wolf' ? '🐺' :
                                                    animal.id === 'eagle' ? '🦅' : '✨'
                                                ) : '❓'}
                                            </span>
                                        </div>
                                        <div className="animal-info">
                                            <h4 className="animal-name">
                                                {unlocked ? animal.name : '？？？'}
                                                {unlocked && <span className="myth-name"> — {animal.mythName}</span>}
                                            </h4>
                                            <p className="animal-description">
                                                {unlocked ? animal.description : `${animal.unlockThreshold}個の称号を獲得すると姿を現す。`}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                
                <footer className="collection-footer">
                    <button className="back-btn" onClick={onClose}>戻る</button>
                </footer>
            </div>
        </div>
    );
}
