import React, { useState } from 'react';
import './HowToPlayPopup.css';

interface HowToPlayPopupProps {
  onClose: () => void;
}

const pages = [
  {
    title: '言葉の力で芽吹く',
    description: '世界に漂う「言葉の葉」をタイピングしてください。正しく入力された言葉はエネルギーとなり、新たな枝を芽吹かせ、あなただけの世界樹を形作ります。',
    image: `${import.meta.env.BASE_URL}assets/tutorial/typing.png`,
  },
  {
    title: '生命と腐朽',
    description: '言葉の葉は時間とともに緑から黄色へと腐朽します。完全に枯れて「落葉」してしまうと、あなたの生命力（VITALITY）が 5秒 減少します。手遅れになる前に浄化しましょう。',
    image: `${import.meta.env.BASE_URL}assets/tutorial/decay.png`,
  },
  {
    title: '戦略的な選択',
    description: '長い単語を打ち切ることで、生命力を大幅に回復できます。最初の文字を入力するとその単語に「フォーカス」します。Spaceキーでフォーカスを解除し、別の枝を選ぶことも可能です。',
    image: `${import.meta.env.BASE_URL}assets/tutorial/result.png`, // リザルト画像を戦略の説明として流用
  }
];

export const HowToPlayPopup: React.FC<HowToPlayPopupProps> = ({ onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      onClose();
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="how-to-play-overlay" onClick={onClose}>
      <div className="how-to-play-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-button-top" onClick={onClose}>×</button>
        
        <div className="tutorial-content">
          <div className="tutorial-image-container">
            <img 
              src={pages[currentPage].image} 
              alt={pages[currentPage].title} 
              className="tutorial-image"
            />
            <div className="image-overlay-glow"></div>
          </div>
          
          <div className="tutorial-text">
            <h2 className="tutorial-title">
              <span className="page-number">{currentPage + 1} / {pages.length}</span>
              {pages[currentPage].title}
            </h2>
            <p className="tutorial-description">
              {pages[currentPage].description}
            </p>
          </div>
        </div>

        <div className="tutorial-footer">
          <div className="page-indicators">
            {pages.map((_, i) => (
              <div 
                key={i} 
                className={`indicator ${i === currentPage ? 'active' : ''}`}
                onClick={() => setCurrentPage(i)}
              />
            ))}
          </div>
          
          <div className="button-group">
            {currentPage > 0 && (
              <button className="nav-button prev" onClick={prevPage}>
                PREV
              </button>
            )}
            <button className="nav-button next" onClick={nextPage}>
              {currentPage === pages.length - 1 ? 'START' : 'NEXT'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
