import React from 'react';

import { Anchor, Box, Header, Menu, ResponsiveContext } from 'grommet';
import { Grommet as GrommetIcon, Menu as MenuIcon} from 'grommet-icons';
import vsLogo from '../../public/vs-logo.png';

export const AppHeader = ({ children }) => (
  // Uncomment <Grommet> lines when using outside of storybook
  // <Grommet theme={...}>
  <div>
  <Header background="light-3" pad="medium" height="xsmall">
    <Anchor
      href="/"
      icon={<img src={vsLogo} alt="VaultSphere Logo" width="55" height="40" />}
      label="VaultSphere File Server"
    />
    <ResponsiveContext.Consumer>
      {(size) =>
        size === 'small' ? (
          <Box justify="end">
            <Menu
              a11yTitle="Navigation Menu"
              dropProps={{ align: { top: 'bottom', right: 'right' } }}
              icon={<MenuIcon color="brand" />}
              items={[

              ]}
            />
          </Box>
        ) : (
          <Box justify="end" direction="row" gap="medium">
          </Box>
        )
      }
    </ResponsiveContext.Consumer>
  </Header>
  {children}
  </div>
  // </Grommet>
);
