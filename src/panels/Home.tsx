import { FC } from 'react';
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

  const { setNodeRef: setDropNodeRef } = useDroppable({
    id: 'droppable',
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event;
    if (over && over.id === 'droppable') {
      alert(`Элемент брошен в область!`);
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
              <DraggableItem id="draggable1" />
              <DraggableItem id="draggable2" />
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
              }}
            >
              <h3>Область для броска</h3>
            </div>
          </div>
        </DndContext>
      </Group>
    </Panel>
  );
};