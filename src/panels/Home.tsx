import { FC, useState } from 'react';
import {
  Panel,
  PanelHeader,
  Group,
} from '@vkontakte/vkui';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { useDroppable, useDraggable, DndContext, DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export interface HomeProps {
  id: string;
}

export const Home: FC<HomeProps> = ({ id }) => {
  const routeNavigator = useRouteNavigator();
  const [droppedItems, setDroppedItems] = useState<string[]>([]);

  const { setNodeRef: setDropNodeRef } = useDroppable({
    id: 'droppable',
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && over.id === 'droppable') {
      // Добавляем элемент в область droppable, если его там еще нет
      if (!droppedItems.includes(active.id as string)) {
        setDroppedItems((prevItems) => [...prevItems, active.id as string]);
      }
    }
  };

  const DraggableItem: FC<{ id: string }> = ({ id }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id,
    });

    const style = {
      transform: CSS.Translate.toString(transform),
      padding: '10px',
      margin: '10px',
      border: '1px solid #ccc',
      backgroundColor: '#f0f0f0',
      cursor: 'grab',
      color: 'black'
    };

    return (
      <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
        Перетаскиваемый элемент {id}
      </div>
    );
  };

  return (
    <Panel id={id}>
      <PanelHeader>Главная</PanelHeader>
      <Group>
        <DndContext onDragEnd={handleDragEnd}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px' }}>
            <div>
              <h3>Перетаскиваемые элементы</h3>
              {/* Отображаем draggable элементы только если они не в области droppable */}
              {!droppedItems.includes('draggable1') && <DraggableItem id="draggable1" />}
              {!droppedItems.includes('draggable2') && <DraggableItem id="draggable2" />}
            </div>
            <div
              ref={setDropNodeRef}
              style={{
                width: '300px',
                height: '300px',
                border: '2px dashed #ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <h3>Область для броска</h3>
              {/* Отображаем элементы, которые были перемещены в droppable */}
              {droppedItems.map((itemId) => (
                <div
                  key={itemId}
                  style={{
                    padding: '10px',
                    margin: '10px',
                    border: '1px solid #ccc',
                    backgroundColor: '#f0f0f0',
                  }}
                >
                  Перетаскиваемый элемент {itemId}
                </div>
              ))}
            </div>
          </div>
        </DndContext>
      </Group>
    </Panel>
  );
};