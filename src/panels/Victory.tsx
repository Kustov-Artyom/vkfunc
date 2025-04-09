// src/panels/Victory.tsx

import React, { useEffect, useRef } from 'react';
import { Panel, PanelHeader, Div, Button } from '@vkontakte/vkui';
import bridge from '@vkontakte/vk-bridge';
import './Victory.css';

interface VictoryProps {
  coins: number;
  setCoins: (val: number) => void;
  currentLevel: number;
}

const Victory: React.FC<VictoryProps> = ({ coins, setCoins, currentLevel }) => {
  const rewardGiven = useRef(false); // чтобы предотвратить повторное начисление

  useEffect(() => {
    if (!rewardGiven.current) {
      rewardGiven.current = true;
      const reward = 20;
      const newCoins = coins + reward;
      setCoins(newCoins);
      bridge.send('VKWebAppStorageSet', { key: 'coins', value: newCoins.toString() });
    }
  }, [coins, setCoins]);

  const handleRepeat = () => (window.location.hash = '/game');
  const handleNext = () => (window.location.hash = '/plot');
  const handleShare = () => {
    bridge.send('VKWebAppShare', {}).catch(console.error);
  };

  return (
    <Panel>
      <PanelHeader>Уровень пройден</PanelHeader>
      <Div className="Victory">
        <h2>Уровень пройден!</h2>
        <p>+20 монет</p>
        <div className="victory-buttons">
          <Button size="m" onClick={handleRepeat}>Заново</Button>
          <Button size="m" onClick={handleNext}>Далее</Button>
          <Button size="m" onClick={handleShare}>Поделиться</Button>
        </div>
      </Div>
    </Panel>
  );
};

export default Victory;
