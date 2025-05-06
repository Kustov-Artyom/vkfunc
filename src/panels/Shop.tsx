// src\panels\Shop.tsx
import React from 'react';
import { Panel, PanelHeader, Button, Div } from '@vkontakte/vkui';
import { Icon24ChevronLeft } from '@vkontakte/icons';
import './Shop.css';

const Shop: React.FC = () => {
  const onBack = () => {
    window.location.hash = '/'; // Или /main, как тебе удобнее
  };

  const items = [
    { id: 1, name: 'Доп. жизнь', price: 100 },
    { id: 2, name: 'Магнит для монет', price: 200 },
  ];

  return (
    <Panel>
      <PanelHeader
        before={<Icon24ChevronLeft onClick={onBack} style={{ color: '#954B25', cursor: 'pointer' }} />}
      >
        Магазин
      </PanelHeader>
      <Div className="Shop">
        <ul className="shop-list">
          {items.map((item) => (
            <li key={item.id}>
              <span>{item.name}</span>
              <span>{item.price} монет</span>
              <Button size="m" style={{ marginLeft: 10 }}>
                Купить
              </Button>
            </li>
          ))}
        </ul>
      </Div>
    </Panel>
  );
};

export default Shop;
