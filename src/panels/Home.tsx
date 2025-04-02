import { FC, useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Panel, PanelHeader, View } from '@vkontakte/vkui';
import { Main } from '../main_panels/main';
import { SecondLevel } from '../main_panels/levels/second_lvl/second';
import { FirstLevel } from '../main_panels/levels/first_lvl/first';

export const Home: FC = () => {
  const [activePanel, setActivePanel] = useState('first_lvl');


  return (
    <View activePanel={activePanel}>
      <Panel id='mainPanel'>
        <PanelHeader>Лагуна приключений</PanelHeader>
        <Main />
      </Panel>

      <Panel id='first_lvl'>
        <PanelHeader>Уровень 1</PanelHeader>
        <FirstLevel />
      </Panel>

      <Panel id='second_lvl'>
        <PanelHeader>Уровень 2</PanelHeader>
        <SecondLevel />
      </Panel>
    </View>
  );
};