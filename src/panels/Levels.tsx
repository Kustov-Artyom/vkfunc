//src\panels\Levels.tsx
import React from 'react';
import { Panel, PanelHeader, Div, Snackbar } from '@vkontakte/vkui';
import { Icon24ChevronLeft, Icon16Cancel } from '@vkontakte/icons';
import './Levels.css';
import type { ModalId } from '../App';  

/* иконки */
import l1  from '../assets/levels/level1.svg';
import l1a from '../assets/levels/level1--active.svg';
import l2  from '../assets/levels/level2.svg';
import l2a from '../assets/levels/level2--active.svg';
import l3  from '../assets/levels/level3.svg';
import l3a from '../assets/levels/level3--active.svg';
import l4 from '../assets/levels/level4.svg';
import l5 from '../assets/levels/level5.svg';
import l6 from '../assets/levels/level6.svg';
import l7 from '../assets/levels/level7.svg';
import l8 from '../assets/levels/level8.svg';
import l9 from '../assets/levels/level9.svg';
import l10 from '../assets/levels/level10.svg';
import l11 from '../assets/levels/level11.svg';
import l12 from '../assets/levels/level12.svg';

interface LevelsProps {
  coins: number;
  unlockedLevel: number;
  setCurrentLevel: (lvl: number) => void;
  openModal: (id: ModalId) => void;
}

const iconsAll = [
  { lock: l12, open: l12 },
  { lock: l11, open: l11 },
  { lock: l10, open: l10 },
  { lock: l9,  open: l9  },
  { lock: l8,  open: l8  },
  { lock: l7,  open: l7  },
  { lock: l6,  open: l6  },
  { lock: l5,  open: l5  },
  { lock: l4,  open: l4  },
  { lock: l3,  open: l3a },
  { lock: l2,  open: l2a },
  { lock: l1,  open: l1a },
];

const Levels: React.FC<LevelsProps> = ({
  coins,
  unlockedLevel,
  setCurrentLevel,
  openModal,
}) => {
  const [snack, setSnack] = React.useState<React.ReactNode>(null);

  const onBack       = () => (window.location.hash = '/');
  const openSettings = () => openModal('settings');

  const handleLevelClick = (visualIdx: number) => {
    const realLevel = 12 - visualIdx;
    if (realLevel > unlockedLevel || realLevel > 3) {
      setSnack(
        <Snackbar before={<Icon16Cancel />} onClose={() => setSnack(null)}>
          Уровень пока закрыт
        </Snackbar>
      );
      return;
    }
    setCurrentLevel(realLevel);
    window.location.hash = '/game';
  };

  return (
    <Panel>
      <PanelHeader before={<Icon24ChevronLeft onClick={onBack} style={{ color: '#954B25', cursor: 'pointer' }} />}>Уровни</PanelHeader>

      <Div className="LevelsContainer">
        {/* верхние иконки */}
        <Div className="settings-coin-fixed">
          <button
            className="settings-btn-levels"
            style={{ zIndex: 2 }}       /* ← добавлено */
            onClick={openSettings}
          />
          <div className="coin-counter-levels">
            <span className="coin-count-levels">{coins}</span>
          </div>
        </Div>

        {/* сетка уровней */}
        <Div className="levels-path-container">
          <div className="levels-path">
            {iconsAll.map((icon, idx) => {
              const realLevel = 12 - idx;
              const isOpen = realLevel <= unlockedLevel && realLevel <= 3;
              return (
                <div
                  key={idx}
                  className={`level-btn-loc level-${idx} ${isOpen ? 'open':'locked'}`}
                  onClick={() => handleLevelClick(idx)}
                >
                  <img src={isOpen ? icon.open : icon.lock} alt={`Уровень ${realLevel}`}/>
                </div>
              );
            })}
          </div>
        </Div>
      </Div>

      {snack}
    </Panel>
  );
};

export default Levels;
