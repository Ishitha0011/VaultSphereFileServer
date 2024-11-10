import {
  Anchor,
  Box,
  Heading,
  NameValueList,
  NameValuePair,
} from "grommet-exp";

const details = {
  availableRegions: "Available regions",
  languages: "Languages",
  supportedWorkspaceTypes: "Supported workspace types",
  documentation: "Documentation",
  termsOfService: "Terms of service",
  published: "Published",
};

type PageType = {
  author?: string;
  title?: string;
  description?: string;
  details: object;
  src?: string;
};

export const Details = ({ page }: { page: PageType }) => {
  return (
    <Box gap="small" background="front" pad="medium" round="xlarge">
      <Heading level={2}>Details</Heading>
      <NameValueList
        pairProps={{ direction: "column" }}
        valueProps={{ align: "start" }}
      >
        {Object.entries(page.details).map(([key, value], index) => {
          let renderValue;
          if (Array.isArray(value))
            renderValue = value.map(
              (d, index) => `${d}${index < value.length - 1 ? ", " : ""}`
            );
          else if (key === "documentation" || key === "termsOfService")
            renderValue = <Anchor href={value}>{value}</Anchor>;
          else if (key === "published")
            renderValue = new Date(value).toLocaleDateString();
          else renderValue = value;

          return (
            // @ts-ignore
            <NameValuePair name={details[key]} key={index}>
              {renderValue}
            </NameValuePair>
          );
        })}
      </NameValueList>
    </Box>
  );
};
