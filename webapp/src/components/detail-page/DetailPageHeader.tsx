import { Box, Button, PageHeader } from "grommet-exp";

type PageType = {
  author?: string;
  title?: string;
  description?: string;
  src?: string;
};

export const DetailPageHeader = ({ page }: { page: PageType }) => {
    console.log(page)
  return (
    <Box background="front" round="xlarge" pad="medium">
      <PageHeader
        icon={
          <Box width="xsmall">
            <img src={page.src} alt={`${page.title} logo`} />
          </Box>
        }
        title={page.title}
        subtitle={page.author}
        actions={
          <Box direction="row-responsive" gap="small" align="start">
            <Button
              label="Test drive"
              // TO DO allow button to pass label color to icon
              // icon={<Share />}
              kind="primary"
              reverse
            />
            <Button label="Contact sales" kind="secondary" />
          </Box>
        }
      />
    </Box>
  );
};
