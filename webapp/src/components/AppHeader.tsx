import React from 'react';

import { Anchor, Box, Header, Menu, ResponsiveContext } from 'grommet';
import { Grommet as GrommetIcon, Menu as MenuIcon, Hpe as HPEIcon } from 'grommet-icons';

export const AppHeader = ({ children }) => (
  // Uncomment <Grommet> lines when using outside of storybook
  // <Grommet theme={...}>
  <div>
  <Header background="light-3" pad="medium" height="xsmall">
    <Anchor
      href="/"
      icon={<HPEIcon color="brand" />}
      label="HPE File Server"
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
