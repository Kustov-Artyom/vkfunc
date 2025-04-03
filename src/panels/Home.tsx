import { FC, useState } from 'react';
import {
  Panel,
  PanelHeader,
  NavIdProps,
  View,
} from '@vkontakte/vkui';
import { UserInfo } from '@vkontakte/vk-bridge';
import { useRouteNavigator } from '@vkontakte/vk-mini-apps-router';
import { FirstLevel } from '../main_panels/levels/first_lvl/first';
import { Main } from '../main_panels/main';
import { SecondLevel } from '../main_panels/levels/second_lvl/second';


export interface HomeProps extends NavIdProps {
  fetchedUser?: UserInfo;
}

export const Home: FC<HomeProps> = ({ id, fetchedUser}) => {
  const { photo_200, city, first_name, last_name } = { ...fetchedUser };
  const routeNavigator = useRouteNavigator();
  const [activePanel, setActivePanel] = useState('first_lvl')

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
