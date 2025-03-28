import { AppShell, Group, Stack, Text } from '@mantine/core';
import { IconHome, IconPlus, IconUser } from '@tabler/icons-react';
import { Link, useLocation } from 'react-router';
import styles from './BottomNavigation.module.css';

function BottomNavigation(): JSX.Element {
  const location = useLocation();

  const tabs = [
    {
      path: '/',
      label: 'Home',
      icon: IconHome
    },
    {
      path: '/sell',
      label: 'Sell',
      icon: IconPlus
    },
    {
      path: '/mypage',
      label: 'MyPage',
      icon: IconUser
    }
  ];

  return (
    <AppShell.Footer>
      <Group grow gap={0} className="tab-bar">
        {tabs.map(({ path, label}) => {
          const isActive = location.pathname === path;
          
          return (
            <Link 
              key={path}
              to={path}
              style={{ textDecoration: 'none' }}
              className={`${styles.tabItem} ${isActive ? "active" : ""}`}
            >
              <Stack
                h={40}
                align='center'
                justify='center'
                gap={0}
              >
                <Text size='md'>
                  {label}
                </Text>
              </Stack>
            </Link>
          );
        })}
      </Group>
    </AppShell.Footer>
  );
}

export default BottomNavigation;
