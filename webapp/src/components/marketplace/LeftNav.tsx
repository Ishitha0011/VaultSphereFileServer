import { Box, Button, Nav, Text } from "grommet-exp";
import { ContentContainer } from "../ContentContainer";

export const LeftNav = () => {
  return (
    <ContentContainer>
      <Nav>
        <Box gap="small">
          <Button label="My services" />
          <Button label="Subscriptions" />
          <Button label="Marketplace" active />
        </Box>
      </Nav>
    </ContentContainer>
  );
};
