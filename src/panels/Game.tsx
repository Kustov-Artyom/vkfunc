import React, { FC, useState, useEffect, useCallback } from 'react';
import { useDroppable, useDraggable, DndContext, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { Panel, PanelHeader, Div } from '@vkontakte/vkui';
import { Icon24ChevronLeft } from '@vkontakte/icons';
import { CSS } from '@dnd-kit/utilities';
import './Game.css';

import pauseIcon from '../assets/pause.svg';
import hintIcon from '../assets/hint.svg';

type ItemType = 'yellow' | 'black';

interface DraggableItem {
  id: string;
  type: ItemType;
  img: string;
}

interface GameProps {
  currentLevel: number;
  openModal: (id: string) => void;
  onLevelComplete: () => void;
}

const initialItems: DraggableItem[] = [
  { id: '1', type: 'black', img: 'src/assets/items/pirate-hat.svg' },
  { id: '2', type: 'yellow', img: 'src/assets/items/banana.svg' },
  { id: '3', type: 'black', img: 'src/assets/items/flag.svg' },
  { id: '4', type: 'yellow', img: 'src/assets/items/money.svg' },
  { id: '5', type: 'black', img: 'src/assets/items/telescope.svg' },
  { id: '6', type: 'yellow', img: 'src/assets/items/crystal.svg' },
];

const Game: FC<GameProps> = ({ currentLevel, openModal, onLevelComplete }) => {
  const [items, setItems] = useState<DraggableItem[]>(initialItems);
  const [yellowBasket, setYellowBasket] = useState<DraggableItem[]>([]);
  const [blackBasket, setBlackBasket] = useState<DraggableItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const onBack = () => {
    window.location.hash = '/levels'; // Или /main, как тебе удобнее
  };

  // Таймер
  const [time, setTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) {
        setTime((t) => t + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused]);

  // Проверяем, всё ли собрали
  useEffect(() => {
    if (items.length === 0) {
      onLevelComplete();
    }
  }, [items, onLevelComplete]);

  // DnD
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;
      const item = items.find((i) => i.id === active.id);
      if (!item) return;

      const correctBasketId = item.type === 'yellow' ? 'yellow-basket' : 'black-basket';
      if (over.id === correctBasketId) {
        if (item.type === 'yellow') setYellowBasket((prev) => [...prev, item]);
        else setBlackBasket((prev) => [...prev, item]);
        setItems((prev) => prev.filter((i) => i.id !== item.id));
      }
      setActiveId(null);
    },
    [items]
  );

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const pauseGame = () => {
    setIsPaused(!isPaused);
    openModal('pause');
  };

  const hint = () => {
    alert('Подсказка: сортируй предметы по цвету корзины!');
  };

  return (
    <Panel>
      <PanelHeader
        before={<Icon24ChevronLeft onClick={onBack} style={{ color: '#954B25', cursor: 'pointer' }} />}
      >
        Уровень 2
      </PanelHeader>
      <div className="game-container">
        <div className="top-bar">
          <button className="icon-btn" onClick={pauseGame} style={{ background: `url(${pauseIcon})` }} />
          <div className="timer">{formatTime(time)}</div>
          <button className="icon-btn" onClick={hint} style={{ background: `url(${hintIcon})` }} />
        </div>

        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="baskets-row">
            <div className='yellow-basket'><Basket type="yellow" items={yellowBasket}/></div>
            <div className='black-basket'><Basket type="black" items={blackBasket} /></div>
          </div>

          <div className="items-container">
            {items.map((item) => (
              <DraggableItem key={item.id} item={item} />
            ))}
          </div>

          <DragOverlay>
            {activeId && (
              <img
                src={items.find((i) => i.id === activeId)?.img}
                className="dragged-item"
                alt="drag"
              />
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </Panel>
  );
};

const DraggableItem: FC<{ item: DraggableItem }> = ({ item }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
  });
  const style: React.CSSProperties = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
  };

  return (
    <div ref={setNodeRef} className="dnd-item" style={style} {...listeners} {...attributes}>
      <img src={item.img} alt="item" className="item-image" />
    </div>
  );
};

const Basket: FC<{ type: ItemType; items: DraggableItem[] }> = ({ type, items }) => {
  const { setNodeRef } = useDroppable({ id: type === 'yellow' ? 'yellow-basket' : 'black-basket' });

  const basketImg =
    type === 'yellow'
      ? 'src/assets/baskets/yellow-basket.svg'
      : 'src/assets/baskets/black-basket.svg';

  return (
    <div ref={setNodeRef} className="basket">
      <img src={basketImg} alt="basket" className="basket-img" />
      <div className="items-in-basket">
        {items.map((itm) => (
          <img key={itm.id} src={itm.img} alt="in-basket" className="mini-item" />
        ))}
      </div>
    </div>
  );
};

export default Game;
