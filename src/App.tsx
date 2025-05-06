//src\App.tsx
import { useState, useEffect, useRef, ReactNode, useCallback  } from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
  View, Panel, SplitLayout, SplitCol, ScreenSpinner,
} from '@vkontakte/vkui';
import { useActiveVkuiLocation } from '@vkontakte/vk-mini-apps-router';
import './App.css';
import { DEFAULT_VIEW_PANELS } from './routes';

import MainMenu     from './panels/MainMenu';
import Loading      from './panels/Loading';
import Levels       from './panels/Levels';
import Game         from './panels/Game';
import Plot         from './panels/Plot';
import Achievements from './panels/Achievements';
import Shop         from './panels/Shop';

import coinVictory  from '/src/assets/coin.svg';
import againVictory from '/src/assets/again.svg';
import startVictory from '/src/assets/start.svg';
import shareVictory from '/src/assets/share.svg';

const COINS_STORAGE_KEY    = 'coins';
const PROGRESS_STORAGE_KEY = 'progress';
const COMPLETED_LEVELS_KEY    = 'completed_levels';

export type ModalId =
  | 'story' | 'pause' | 'settings'
  | 'confirmRestart' | 'confirmMenu' | 'confirmReset'
  | 'victoryModal' | 'confirmRestartGame'
  | null;

export const App = () => {
  /* текущее положение в роутере */
  const { panel: activePanel = DEFAULT_VIEW_PANELS.MAIN } = useActiveVkuiLocation();

  /* ── состояния ─────────────────────────────── */
  const [popout, setPopout] = useState<ReactNode>(<ScreenSpinner size="large" />);
  const [coins, setCoins] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [bestTimes, setBestTimes] = useState<Record<number, number>>({});
  const [activeModal, setActiveModal] = useState<ModalId>(null);
  const [restartKey, setRestartKey] = useState(0);
  const [lastAwarded, setLastAwarded] = useState<boolean>(false);

  const returnToPause = useRef(false);

  /* ── инициализация ─────────────────────────── */
  useEffect(() => {
    (async () => {
      bridge.send('VKWebAppInit');
      const { keys } = await bridge.send('VKWebAppStorageGet', {
        keys: [COINS_STORAGE_KEY, PROGRESS_STORAGE_KEY, COMPLETED_LEVELS_KEY],
      });
      keys.forEach(({ key, value }) => {
        if (key === COINS_STORAGE_KEY)    setCoins(Number(value || 0));
        if (key === PROGRESS_STORAGE_KEY) setUnlockedLevel(Math.max(1, Number(value || 1)));
      });
      await new Promise(r => setTimeout(r, 300));
      setPopout(null);
      const completedRaw = keys.find(k => k.key === COMPLETED_LEVELS_KEY)?.value;
      if (completedRaw) setCompletedLevels(JSON.parse(completedRaw));
    })();
  }, []);

  /* ── показываем сюжет при первом входе ─────── */
  useEffect(() => {
    if (!localStorage.getItem('firstVisit')) {
      setActiveModal('story');
      localStorage.setItem('firstVisit', 'true');
    }
  }, []);

  /* ── helpers ───────────────────────────────── */
  const openModal  = (m: ModalId) => setActiveModal(m);
  const closeModal = () => setActiveModal(null);

  const resetAll = async () => {
    /* монеты и прогресс */
    setCoins(0);
    setUnlockedLevel(1);
    setCurrentLevel(1);
  
    /* обнуляем «пройденные» и лучшие времена */
    setCompletedLevels([]);
    setBestTimes({});
  
    await Promise.all([
      bridge.send('VKWebAppStorageSet', { key: COINS_STORAGE_KEY,        value: '0'   }),
      bridge.send('VKWebAppStorageSet', { key: PROGRESS_STORAGE_KEY,     value: '1'   }),
      bridge.send('VKWebAppStorageSet', { key: COMPLETED_LEVELS_KEY,     value: '[]'  }),
    ]);
  
    window.location.hash = '/';
  };

  /* если вернулись из настроек -> пауза */
  useEffect(() => {
    const h = () => {
      if (window.location.hash === '#game' && returnToPause.current) {
        openModal('pause'); returnToPause.current = false;
      }
    };
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);

  const finishLevel = useCallback(
    (level: number, timeSec: number) => {
  
      /* === 0. определяем, первое ли это прохождение === */
      const firstTime = !completedLevels.includes(level);
      /* 1. монеты – только при первом прохождении */
      if (firstTime) {
        const newCoins = coins + 20;
        setCoins(newCoins);
        bridge.send('VKWebAppStorageSet', {
          key: COINS_STORAGE_KEY, value: String(newCoins),
        });
  
        /* сохраняем уровень в список пройденных */
        const newCompleted = [...completedLevels, level];
        setCompletedLevels(newCompleted);
        bridge.send('VKWebAppStorageSet', {
          key: COMPLETED_LEVELS_KEY, value: JSON.stringify(newCompleted),
        });
      }
  
      /* 2. лучшее время  … (оставляем без изменений) */
      const oldBest = bestTimes[level] ?? Infinity;
      if (timeSec < oldBest) {
        const newBestTimes = { ...bestTimes, [level]: timeSec };
        setBestTimes(newBestTimes);
        bridge.send('VKWebAppStorageSet', {
          key: `best_time_${level}`, value: String(timeSec),
        });
      }
  
      /* 3. открываем следующий уровень  … (как было) */
      if (level === unlockedLevel && unlockedLevel < 3) {
        const next = unlockedLevel + 1;
        setUnlockedLevel(next);
        bridge.send('VKWebAppStorageSet', {
          key: PROGRESS_STORAGE_KEY, value: String(next),
        });
      }
  
      /* 4. запоминаем, была ли награда и открываем Victory */
      setLastAwarded(firstTime);
      openModal('victoryModal');
    },
    [coins, completedLevels, bestTimes, unlockedLevel]
  );
  
  

  /* ── UI ─────────────────────────────────────── */
  return (
    <SplitLayout popout={popout}>
      <SplitCol>
        <View activePanel={activePanel}>
          {/* LOADING (остался на случай переходов) */}
          <Panel id={DEFAULT_VIEW_PANELS.LOADING}><Loading/></Panel>

          {/* MENU */}
          <Panel id={DEFAULT_VIEW_PANELS.MAIN}>
            <MainMenu coins={coins} openModal={openModal}/>
          </Panel>

          {/* LEVELS */}
          <Panel id={DEFAULT_VIEW_PANELS.LEVELS}>
            <Levels
              coins={coins}
              unlockedLevel={unlockedLevel}
              setCurrentLevel={setCurrentLevel}
              openModal={openModal}
            />
          </Panel>

          {/* GAME */}
          <Panel id={DEFAULT_VIEW_PANELS.GAME}>
            <Game
              key={restartKey}
              currentLevel={currentLevel}
              openModal={openModal}
              onLevelComplete={finishLevel}
              completedLevels={completedLevels}
              activeModal={activeModal} 
            />
          </Panel>

          {/* PLOT */}
          <Panel id={DEFAULT_VIEW_PANELS.PLOT}>
            <Plot currentLevel={currentLevel} setCurrentLevel={setCurrentLevel}/>
          </Panel>

          <Panel id={DEFAULT_VIEW_PANELS.ACHIEVEMENTS}><Achievements/></Panel>
          <Panel id={DEFAULT_VIEW_PANELS.SHOP}><Shop/></Panel>
        </View>
      </SplitCol>

      {/* ───────────────────── модалки ───────────────────── */}
      {(() => {
        switch (activeModal) {
          case 'story':
            return (
              <div className="custom-modal">
                <div className="custom-modal-content">
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
                <span className='parrot'></span>
              </div>
              
            );

          case 'pause':
            return (
              <div className="custom-modal">
                <div className="custom-modal-content">
                  <button className="modal-close-btn" onClick={closeModal}/>
                  <button className="menu-button" onClick={closeModal}>Продолжить</button>
                  <button className="menu-button" onClick={()=>openModal('confirmRestart')}>Начать с начала</button>
                  <button className="menu-button" onClick={()=>openModal('confirmMenu')}>На главную</button>
                  <button className="menu-button" onClick={()=>{
                    closeModal(); returnToPause.current = true; openModal('settings');
                  }}>Настройки</button>
                </div>
              </div>
            );

          case 'settings':
            return (
              <div className="custom-modal">
                <div className="custom-modal-content">
                  <button className="modal-close-btn" onClick={() => {
                    closeModal();
                  }} />
                  <div className='container-menu-button-circle'>
                    <button className="menu-button-circle-music">
                      <p style={{ color: '#954B25', textAlign: 'center', fontSize: 12, fontWeight: 'bold', marginTop: 70}}>Звук и музыка</p>
                    </button>
                    <button className="menu-button-circle-notifications">
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

          case 'confirmRestart':
            return (
              <div className="custom-modal">
                <div className="custom-modal-content-small" style={{width:295,height:290}}>
                  <button className="modal-close-btn" onClick={()=>openModal('pause')}/>
                  <p style={{ color: '#954B25', textAlign: 'center', fontSize: 24, fontWeight: 'bold', margin: 20 }}>Начать сначала?</p>
                  <p style={{ marginBottom: 20, textAlign: 'center', color: '#954B25', margin: '0 30px 20px' }}>Прогресс текущего уровня будет утерян.</p>
                  <div className="container-menu-button">
                    <button className="menu-button-yes-no" onClick={()=>{closeModal(); setRestartKey(k => k + 1); window.location.hash='/game';}}>Да</button>
                    <button className="menu-button-yes-no" onClick={()=>openModal('pause')}>Нет</button>
                  </div>
                </div>
              </div>
            );

          case 'confirmMenu':
            return (
              <div className="custom-modal">
                <div className="custom-modal-content-small" style={{width:295,height:290}}>
                  <button className="modal-close-btn" onClick={()=>openModal('pause')}/>
                  <p style={{color:'#954B25',fontSize:24,fontWeight:'bold',textAlign:'center',margin:20}}>
                    Вы точно хотите выйти из игры?
                  </p>
                  <p style={{textAlign:'center',color:'#954B25',margin:'0 40px 20px'}}>
                    Прогресс уровня будет утерян!
                  </p>
                  <div className="container-menu-button">
                    <button className="menu-button-yes-no" onClick={()=>{closeModal(); window.location.hash='/';}}>Да</button>
                    <button className="menu-button-yes-no" onClick={()=>openModal('pause')}>Нет</button>
                  </div>
                </div>
              </div>
            );

          case 'confirmRestartGame':
            return (
              <div className="custom-modal">
                <div className="custom-modal-content-small" style={{width:295,height:290}}>
                  <button className="modal-close-btn" onClick={()=>openModal('pause')}/>
                  <p style={{ color: '#954B25', textAlign: 'center', fontSize: 24, fontWeight: 'bold', margin: 20 }}>Начать заново?</p>
                  <p style={{ marginBottom: 20, textAlign: 'center', color: '#954B25', margin: '0 30px 20px' }}>Прогресс текущего уровня будет утерян.</p>
                  <div className="container-menu-button">
                    <button className="menu-button-yes-no" onClick={()=>{closeModal(); setRestartKey(k => k + 1); window.location.hash='/game';}}>Да</button>
                    <button className="menu-button-yes-no" onClick={()=>openModal('victoryModal')}>Нет</button>
                  </div>
                </div>
              </div>
            );

          case 'confirmReset':
            return (
              <div className="custom-modal">
                <div className="custom-modal-content-small" style={{width:295,height:290}}>
                  <button className="modal-close-btn" onClick={()=>openModal('settings')}/>
                  <p style={{color:'#954B25',fontSize:24,fontWeight:'bold',textAlign:'center',margin:20}}>
                    Сбросить все уровни?
                  </p>
                  <p style={{textAlign:'center',color:'#954B25',margin:'0 40px 20px'}}>
                    Вы точно хотите сбросить весь прогресс?
                  </p>
                  <div className="container-menu-button">
                    <button
                      className="menu-button-yes-no"
                      onClick={async ()=> {
                        await  
                        closeModal();        /* полный сброс */
                        resetAll();
                        openModal('story');       /* показываем сюжет снова */
                      }}
                    >Да</button>
                    <button className="menu-button-yes-no" onClick={()=>openModal('settings')}>Нет</button>
                  </div>
                </div>
              </div>
            );

          case 'victoryModal':
            return (
              <div className="custom-modal">
                <div
                  className="custom-modal-content-small"
                  style={{ width: 295, height: 290 }}>
                  <p
                    style={{
                      color: '#954B25',
                      fontSize: 20,
                      fontWeight: 700,
                      textAlign: 'center',
                      marginBottom: 12,
                    }}>
                    Уровень пройден!</p>
                    
                      <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
                        <span style={{ color:'#954B25', fontSize:24, fontWeight:'bold'}}>+20</span>
                        <img src={coinVictory} style={{ width:35, height:35 }} />
                      </div>
                    
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
                    {/* AGAIN */}
                    <img
                      src={againVictory}
                      style={{ width: 50, height: 50, cursor: 'pointer'}}
                      onClick={() => openModal('confirmRestartGame')}
                    />
          
                    {/* START — закрываем Victory и уходим на Plot */}
                    <img
                      src={startVictory}
                      style={{ width: 50, height: 50, cursor: 'pointer' }}
                      onClick={() => {
                        setActiveModal(null);     
                        setTimeout(() => { window.location.hash = '/plot'; }, 0);
                      }}
                    />
          
                    {/* SHARE */}
                    <img
                      src={shareVictory}
                      style={{ width: 50, height: 50, cursor: 'pointer' }}
                      onClick={() => bridge.send('VKWebAppShare', {}).catch(console.error)}
                    />
                  </div>
                </div>
              </div>
            );

          default: return null;
        }
      })()}
    </SplitLayout>
  );
};
