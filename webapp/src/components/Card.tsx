import { Box, Button, Heading, Paragraph, Text } from "grommet-exp";
import { nameToSlug } from "../utils";
import { Link } from "react-router-dom";

export const Card = ({
  data: { title, author, description, src },
  level,
}: {
  data: {
    title: string;
    author?: string;
    description?: string;
    src?: string;
  };
  level?: 1 | 2 | 3;
}) => (
  <Box align="start" gap="medium">
    <Box align="start" gap="small">
      <Box>
        <Heading level={level}>{title}</Heading>
        <Text size="xsmall" color="weak">
          {author}
        </Text>
      </Box>
      <Paragraph>{description}</Paragraph>
    </Box>
    <Link
      to={`/${nameToSlug(title)}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <Button label="View details" kind="secondary" />
    </Link>
  </Box>
);
