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
import './second.css';

type ItemType = 'yellow' | 'black';

interface DraggableItem {
  id: string;
  type: ItemType;
  img: string;
}

const initialItems: DraggableItem[] = [
  { id: '1', type: 'black', img: 'src/assets/lib/items/hat.png' },
  { id: '2', type: 'black', img: 'src/assets/lib/items/flag.png' },
  { id: '3', type: 'yellow', img: 'src/assets/lib/items/gold.png' },
  { id: '4', type: 'black', img: 'src/assets/lib/items/hook.png' },
  { id: '5', type: 'yellow', img: 'src/assets/lib/items/bananas.png' },
  { id: '6', type: 'yellow', img: 'src/assets/lib/items/money.png' },
];

export const SecondLevel: FC = () => {
  const [time, setTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [items, setItems] = useState(initialItems);
  const [yellowBasket, setYellowBasket] = useState<DraggableItem[]>([]);
  const [blackBasket, setBlackBasket] = useState<DraggableItem[]>([]);

  // Таймер
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) setTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    const item = items.find((i) => i.id === active.id);
    
    if (!item || !over) return;

    if (over.id === 'yellow-basket' && item.type === 'yellow') {
      setYellowBasket((prev) => [...prev, item]);
    } else if (over.id === 'black-basket' && item.type === 'black') {
      setBlackBasket((prev) => [...prev, item]);
    }

    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setActiveId(null);
  }, [items]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="game-container">
      {/* Шапка с управлением */}
      <div className="game-header">
        <button 
          className="pause-button"
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? '▶' : '⏸'}
        </button>
        <div className="timer">{formatTime(time)}</div>
        <button className="hint-button">?</button>
      </div>

      {/* Игровое поле */}
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="game-field">
          {/* Корзинки */}
          <Basket type="yellow" items={yellowBasket} />
          <Basket type="black" items={blackBasket} />

          {/* Доступные предметы */}
          <div className="items-container">
            {items.map((item) => (
              <DraggableItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeId ? (
            <img
              src={items.find((i) => i.id === activeId)?.img}
              className="dragged-item"
              alt="item"
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

const DraggableItem: FC<{ item: DraggableItem }> = ({ item }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
  });

  return (
    <div
      ref={setNodeRef}
      className="item"
      style={{ transform: CSS.Translate.toString(transform) }}
      {...listeners}
      {...attributes}
    >
      <img src={item.img} alt="item" className="item-image" />
    </div>
  );
};

const Basket: FC<{ type: ItemType; items: DraggableItem[] }> = ({ type, items }) => {
  const { setNodeRef } = useDroppable({ id: `${type}-basket` });
  const basketImg = type === 'yellow' 
    ? 'src/assets/baskets/yellow-basket.png' 
    : 'src/assets/baskets/black-basket.png';

  return (
    <div ref={setNodeRef} className={`basket ${type}-basket`}>
      <img src={basketImg} alt={`${type} basket`} className="basket-image" />
      <div className="items-in-basket">
        {items.map((item) => (
          <img key={item.id} src={item.img} alt="item" className="item-in-basket" />
        ))}
      </div>
    </div>
  );
};