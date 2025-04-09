// src/panels/Levels.tsx
import React from 'react';
import { Panel, PanelHeader, Div } from '@vkontakte/vkui';
import { Icon24ChevronLeft } from '@vkontakte/icons';
import './Levels.css';

import level1 from '../assets/level1.svg';
import level2 from '../assets/level2.svg';
import level3 from '../assets/level3.svg';
import level4 from '../assets/level4.svg';
import level5 from '../assets/level5.svg';
import level6 from '../assets/level6.svg';
import level7 from '../assets/level7.svg';
import level8 from '../assets/level8.svg';
import level9 from '../assets/level9.svg';

interface LevelsProps {
  coins: number;
  setCurrentLevel: (lvl: number) => void;
  openModal: (id: string) => void;
}

const Levels: React.FC<LevelsProps> = ({ coins, setCurrentLevel, openModal }) => {
  const onBack = () => (window.location.hash = '/');
  const openSettings = () => openModal('settings');

  // Массив иконок, уровни от 9 к 1 (сверху вниз)
  const icons = [level9, level8, level7, level6, level5, level4, level3, level2, level1];

  const handleLevelClick = (idx: number) => {
    // idx=0 => level9, idx=8 => level1
    const realLevel = 9 - idx;
    setCurrentLevel(realLevel);
    window.location.hash = '/game';
  };

  return (
    <Panel>
      <PanelHeader
        before={<Icon24ChevronLeft onClick={onBack} style={{ color: '#954B25', cursor: 'pointer' }} />}
      >
        Уровни
      </PanelHeader>
      <Div className="LevelsContainer">
        <button className="settings-btn-levels" onClick={openSettings} aria-label="Настройки" />
        <div className="coin-counter-levels">
          <span className="coin-count-levels">{coins}</span>
        </div>
        <div className="levels-path">
          {icons.map((icon, idx) => (
            <div
              key={idx}
              className={`level-btn-loc level-${idx}`}
              onClick={() => handleLevelClick(idx)}
            >
              <img src={icon} alt={`Уровень ${9 - idx}`} />
            </div>
          ))}
        </div>
      </Div>
    </Panel>
  );
};

export default Levels;
