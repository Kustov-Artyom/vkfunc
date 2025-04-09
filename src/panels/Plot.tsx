// src/panels/Plot.tsx
import React from 'react';
import { Panel, PanelHeader, Div, Button } from '@vkontakte/vkui';
import './Plot.css';

interface PlotProps {
  currentLevel: number;
  setCurrentLevel: (lvl: number) => void;
}

const Plot: React.FC<PlotProps> = ({ currentLevel, setCurrentLevel }) => {
  const handleContinue = () => {
    // Допустим, если уровней 9, после 9-го возвращаем на главное меню
    if (currentLevel >= 9) {
      window.location.hash = '/';
    } else {
      // идём на следующий уровень
      setCurrentLevel(currentLevel + 1);
      window.location.hash = '/levels';
    }
  };

  return (
    <Panel>
      <PanelHeader>Сюжет</PanelHeader>
      <Div className="Plot">
        <div className="plot-text">
          <p>Отличная работа!
            <br /> Спасибо за помощь, благодаря тебе мы все ближе к сокровищам!
          </p>
          <button className='continue-btn' onClick={handleContinue}></button>
        </div>        
      </Div>
    </Panel>
  );
};

export default Plot;
