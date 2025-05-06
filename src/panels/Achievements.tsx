//\src\panels\Achievements.tsx
import React from 'react';
import { Panel, PanelHeader, Div } from '@vkontakte/vkui';
import { Icon24ChevronLeft } from '@vkontakte/icons';
import './Achievements.css';

const Achievements: React.FC = () => {
  const onBack = () => {
    window.location.hash = '/';
  };

  const achievements = [
    { id: 1, title: 'Первое приключение', description: 'Пройди первый уровень' },
    // ...
  ];

  return (
    <Panel>
      <PanelHeader
        before={<Icon24ChevronLeft onClick={onBack} style={{ color: '#954B25', cursor: 'pointer' }} />}
      >
        Достижения
      </PanelHeader>
      <Div className="Achievements">
        <h2>Мои достижения</h2>
        <ul>
          {achievements.map((ach) => (
            <li key={ach.id}>
              <b>{ach.title}</b> — {ach.description}
            </li>
          ))}
        </ul>
      </Div>
    </Panel>
  );
};

export default Achievements;
