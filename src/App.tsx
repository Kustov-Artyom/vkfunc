// src/App.tsx

import { useState, useEffect, useRef, ReactNode } from 'react';
import bridge, { UserInfo } from '@vkontakte/vk-bridge';
import {
  View,
  Panel,
  SplitLayout,
  SplitCol,
  ScreenSpinner,
} from '@vkontakte/vkui';
import { useActiveVkuiLocation } from '@vkontakte/vk-mini-apps-router';
import './App.css';  // Глобальные стили
import { DEFAULT_VIEW_PANELS } from './routes';

import MainMenu from './panels/MainMenu';
import Loading from './panels/Loading';
import Levels from './panels/Levels';
import Game from './panels/Game';
import Plot from './panels/Plot';
import Achievements from './panels/Achievements';
import Shop from './panels/Shop';

// Если у нас всё же остался Victory экран, импортируй
import Victory from './panels/Victory';

// Константы
const COINS_STORAGE_KEY = 'coins';

// Тип идентификаторов модалок
type ModalId = 'story' | 'pause' | 'settings' | 'confirmRestart' | 'confirmMenu' | 'confirmReset' | 'victoryModal' | null;

export const App = () => {
  const { panel: activePanel = DEFAULT_VIEW_PANELS.LOADING } = useActiveVkuiLocation();

  const [popout, setPopout] = useState<ReactNode | null>(<ScreenSpinner size="large" />);
  const [fetchedUser, setFetchedUser] = useState<UserInfo | undefined>();
  const [coins, setCoins] = useState<number>(0);
  const [currentLevel, setCurrentLevel] = useState<number>(1);

  // Кастомная система модальных окон
  const [activeModal, setActiveModal] = useState<ModalId>(null);

  // Флаг для возврата к паузе, когда уходим в настройки
  const returnToPause = useRef(false);

  // Состояние загрузки (чтобы показывать <Loading /> или <ScreenSpinner />)
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      bridge.send('VKWebAppInit');
      const userData = await bridge.send('VKWebAppGetUserInfo');
      setFetchedUser(userData);
      setPopout(null);

      // Загрузка монет
      const storageGet = await bridge.send('VKWebAppStorageGet', {
        keys: [COINS_STORAGE_KEY],
      });
      const coinsValue = storageGet?.keys?.[0]?.value;
      if (coinsValue) {
        setCoins(Number(coinsValue));
      } else {
        setCoins(0);
        await bridge.send('VKWebAppStorageSet', { key: COINS_STORAGE_KEY, value: '0' });
      }

      // Имитируем задержку 500 мс, чтобы показать popout хотя бы чуть
      await new Promise(r => setTimeout(r, 500));
      setPopout(null);
    })();
  }, []);

  // При первом входе показать сюжет
  useEffect(() => {
    const visited = localStorage.getItem('firstVisit');
    if (!visited) {
      setActiveModal('story'); // открыть модалку сюжета
      localStorage.setItem('firstVisit', 'true');
    }
  }, []);

  // Функции управления модалками
  const openModal = (m: ModalId) => setActiveModal(m);
  const closeModal = () => setActiveModal(null);

  // Сброс прогресса
  const resetAll = async () => {
    setCoins(0);
    localStorage.removeItem('firstVisit');
    await bridge.send('VKWebAppStorageSet', { key: COINS_STORAGE_KEY, value: '0' });
    // Можно сбросить currentLevel, если нужно
    setCurrentLevel(1);
    // Вернуть на главный экран
    window.location.hash = '/';
  };

  // useEffect на hashchange: если вернулись в #game и returnToPause=true, показываем паузу
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#game' && returnToPause.current) {
        openModal('pause');
        returnToPause.current = false;
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);



  // РЕНДЕРЫ КАСТОМНЫХ МОДАЛОК:

  // Модалка сюжета (story) при первом входе
  const renderStoryModal = () => (
    <div className="custom-modal">
      <div className="custom-modal-content" style={{ backgroundImage: `url('src/assets/wooden-modal-menu.svg')` }}>
        <button className="modal-close-btn" onClick={closeModal} />
        <p style={{ color: '#954B25', textAlign: 'center', fontSize: 16, fontWeight: 700, margin: '10px 30px' }}>
          Привет!
          <br /><br />
          Меня зовут Финн, я юнга на пиратском корабле.
          <br /><br />
          Помоги мне найти сундук с сокровищами на этом острове,
          чтобы получить звание помощника капитана.
          <br /><br />
          Сортируй предметы и продвигайся в глубь острова,
          чтобы найти сокровища!
        </p>
      </div>
    </div>
  );

  // Модалка паузы
  const renderPauseModal = () => (
    <div className="custom-modal">
      <div className="custom-modal-content" style={{ backgroundImage: `url('src/assets/wooden-modal-menu.svg')` }}>
        <button className="modal-close-btn" onClick={closeModal} />
        <button className="menu-button" onClick={closeModal}>
          Продолжить
        </button>
        <button className="menu-button" onClick={() => openModal('confirmRestart')}>
          Начать с начала
        </button>
        <button className="menu-button" onClick={() => openModal('confirmMenu')}>
          На главную
        </button>
        <button className="menu-button" onClick={() => {
          closeModal();
          returnToPause.current = true;
          openModal('settings')
        }}>
          Настройки
        </button>
      </div>
    </div>
  );

  // Подтверждение "Начать с начала?"
  const renderConfirmRestart = () => (
    <div className="custom-modal">
      <div className="custom-modal-content" style={{ backgroundImage: `url('src/assets/wooden-modal-menu-small.svg')`, width: '295px', height: '290px' }}>
        <button className="modal-close-btn" onClick={() => openModal('pause')} />
        <p style={{ color: '#954B25', textAlign: 'center', fontSize: 24, fontWeight: 'bold', margin: 20 }}>Начать сначала?</p>
        <p style={{ marginBottom: 20, textAlign: 'center', color: '#954B25', margin: 20 }}>Прогресс текущего уровня будет утерян.</p>
        <div className="container-menu-button">
          <button className="menu-button-yes-no" onClick={() => {
            closeModal();
            window.location.hash = '/game';
          }}>Да</button>
          <button className="menu-button-yes-no" onClick={() => openModal('pause')}>Нет</button>
        </div>
      </div>
    </div>
  );

  // Подтверждение выхода "Вы точно хотите выйти из игры?"
  const renderConfirmMenu = () => (
    <div className="custom-modal">
      <div className="custom-modal-content" style={{ backgroundImage: `url('src/assets/wooden-modal-menu-small.svg')`, width: '295px', height: '290px' }}>
        <button className="modal-close-btn" onClick={() => openModal('pause')} />
        <p style={{ color: '#954B25', textAlign: 'center', fontSize: 24, fontWeight: 'bold', margin: 20 }}>Вы точно хотите выйти из игры?</p>
        <p style={{ marginBottom: 20, textAlign: 'center', color: '#954B25', margin: 20 }}>Прогресс уровня будет утерян!</p>
        <div className="container-menu-button">
          <button className="menu-button-yes-no" onClick={() => {
            closeModal();
            window.location.hash = '/';
          }}>Да</button>
          <button className="menu-button-yes-no" onClick={() => openModal('pause')}>Нет</button>
        </div>
      </div>
    </div>
  );

  // Подтверждение "Сбросить все уровни?"
  const renderConfirmReset = () => (
    <div className="custom-modal">
      <div className="custom-modal-content" style={{ backgroundImage: `url('src/assets/wooden-modal-menu-small.svg')`, width: '295px', height: '290px' }}>
        <button className="modal-close-btn" onClick={() => openModal('settings')} />
        <p style={{ color: '#954B25', textAlign: 'center', fontSize: 24, fontWeight: 'bold', margin: 20 }}>Сбросить все уровни?</p>
        <p style={{ marginBottom: 20, textAlign: 'center', color: '#954B25', margin: 20 }}>Вы точно хотите сбросить весь прогресс?</p>
        <div className="container-menu-button">
          <button className="menu-button-yes-no" onClick={() => {
            closeModal();
            resetAll();
          }}>Да</button>
          <button className="menu-button-yes-no" onClick={() => openModal('settings')}>Нет</button>
        </div>
      </div>
    </div>
  );

  // Модалка "Настройки" 
  const renderSettings = () => (
    <div className="custom-modal">
      <div className="custom-modal-content" style={{ backgroundImage: `url('src/assets/wooden-modal-menu.svg')` }}>
        <button className="modal-close-btn" onClick={() => {
          closeModal();
          // Вернёмся в паузу, если мы были из паузы
          // openModal('pause');
        }} />
        <div className='container-menu-button-circle'>
          <button className="menu-button-circle" style={{ background: `url('src/assets/soundAndMusic.svg') center center no-repeat` }}>
            <p style={{ color: '#954B25', textAlign: 'center', fontSize: 12, fontWeight: 'bold', marginTop: 70}}>Звук и музыка</p>
          </button>
          <button className="menu-button-circle" style={{ background: `url('src/assets/notifications.svg') center center no-repeat` }}>
            <p style={{ color: '#954B25', textAlign: 'center', fontSize: 12, fontWeight: 'bold', marginTop: 70}}>Уведомления</p>
          </button>
        </div>
        <button className="menu-button" style={{ marginBottom: 8 }}>Сообщить об ошибке</button>
        <button className="menu-button" style={{ marginBottom: 8 }}>Версия без рекламы</button>
        <button className="menu-button" style={{ marginBottom: 8 }} onClick={() => openModal('confirmReset')}>
          Сбросить все уровни
        </button>
      </div>
    </div>
  );

  // Пример модалки победы (можно было отдельным компонентом),
  const renderVictoryModal = () => (
    <div className="custom-modal">
      <div className="custom-modal-content" style={{ backgroundImage: `url('src/assets/wooden-modal-menu-small.svg')`, width: '295px', height: '290px' }}>
        <button className="modal-close-btn" onClick={closeModal} />
        <p style={{ color: '#954B25', textAlign: 'center', fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>
          Уровень пройден!
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
          <img src="src/assets/coin.svg" alt="coin" style={{ width: 32, height: 32, marginRight: 8 }} />
          <span style={{ color: '#ff9800', fontSize: 24, fontWeight: 'bold' }}>+20</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 16 }}>
          <img src="src/assets/again.svg" alt="Повторить" style={{ width: 40, height: 40, cursor: 'pointer' }} onClick={() => {
            closeModal();
            window.location.hash = '/game';
          }} />
          <img src="src/assets/start.svg" alt="Далее" style={{ width: 40, height: 40, cursor: 'pointer' }} onClick={() => {
            closeModal();
            // Открыть сюжет / вернуться на Levels
            window.location.hash = '/plot';
          }} />
          <img src="src/assets/share.svg" alt="Поделиться" style={{ width: 40, height: 40, cursor: 'pointer' }} onClick={() => {
            bridge.send('VKWebAppShare', {}).catch(console.error);
          }} />
        </div>
      </div>
    </div>
  );

  // Рендер активной модалки
  const renderActiveModal = () => {
    switch (activeModal) {
      case 'story':         return renderStoryModal();
      case 'pause':         return renderPauseModal();
      case 'settings':      return renderSettings();
      case 'confirmRestart':return renderConfirmRestart();
      case 'confirmMenu':   return renderConfirmMenu();
      case 'confirmReset':  return renderConfirmReset();
      case 'victoryModal':  return renderVictoryModal();
      default:              return null;
    }
  };

  return (
    <SplitLayout popout={isLoading ? <ScreenSpinner size="large" /> : popout}>
      <SplitCol>
        <View activePanel={activePanel}>
          <Panel id={DEFAULT_VIEW_PANELS.LOADING}>
            <Loading />
          </Panel>

          <Panel id={DEFAULT_VIEW_PANELS.MAIN}>
            <MainMenu coins={coins} openModal={openModal} />
          </Panel>

          <Panel id={DEFAULT_VIEW_PANELS.LEVELS}>
            <Levels
              coins={coins}
              setCurrentLevel={setCurrentLevel}
              openModal={openModal}
            />
          </Panel>

          <Panel id={DEFAULT_VIEW_PANELS.GAME}>
            <Game
              currentLevel={currentLevel}
              openModal={openModal}
              onLevelComplete={() => {
                // Начисляем 20 монет 1 раз
                const newCoins = coins + 20;
                setCoins(newCoins);
                bridge.send('VKWebAppStorageSet', { key: COINS_STORAGE_KEY, value: newCoins.toString() });
                // Показываем victoryModal
                openModal('victoryModal');
              }}
            />
          </Panel>

          <Panel id={DEFAULT_VIEW_PANELS.VICTORY}>
            <Victory coins={coins} setCoins={setCoins} currentLevel={currentLevel} />
          </Panel>

          <Panel id={DEFAULT_VIEW_PANELS.PLOT}>
            <Plot currentLevel={currentLevel} setCurrentLevel={setCurrentLevel} />
          </Panel>

          <Panel id={DEFAULT_VIEW_PANELS.ACHIEVEMENTS}>
            <Achievements />
          </Panel>

          <Panel id={DEFAULT_VIEW_PANELS.SHOP}>
            <Shop />
          </Panel>
        </View>
      </SplitCol>

      {renderActiveModal()}
    </SplitLayout>
  );
};
