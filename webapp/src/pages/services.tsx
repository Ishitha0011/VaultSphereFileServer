import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  DataTable,
  Grid,
  Heading,
  Icon,
  Page,
  PageContent,
  PageHeader,
  Paragraph,
  Select,
} from "grommet-exp";
import { Card, ContentContainer, LeftNav } from "../components";
import { ReactComponent as Apps } from "grommet-icons/img/apps.svg";
import { ReactComponent as List } from "grommet-icons/img/list.svg";
import data from "../data.json";
import { nameToSlug } from "../utils";
import { cardGrid, container, mainGrid } from "../styles.css";

const categories = ["AI/ML", "Analytics", "Big Data"];

const Services = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const changeRoute = () => {
      navigate(window.location.pathname);
    };

    window.addEventListener("routeChange", changeRoute);
    changeRoute();
    return () => window.removeEventListener("routeChange", changeRoute);
  }, []);

  return (
    <Page kind="wide">
      <PageContent className={container} gap="medium">
        <PageHeader title="Services" />
        <Grid className={mainGrid} align="start" gap="medium">
          <LeftNav />
          <MainContent />
        </Grid>
      </PageContent>
    </Page>
  );
};

const MainContent = () => {
  const [cardView, setCardView] = useState(false);

  return (
    <ContentContainer className={container}>
      <Box direction="row" align="start" gap="small" justify="between">
        <Box gap="xsmall">
          <Heading level={2}>Marketplace</Heading>
          <Paragraph>Discover and manage services.</Paragraph>
        </Box>
        <Box direction="row" gap="small" align="start" justify="between">
          <Box width="small">
            <Select
              value="All regions"
              options={["All regions", "Africa", "Asia Pacific", "Europe"]}
            />
          </Box>
          <Button
            icon={cardView ? <List /> : <Apps />}
            onClick={() => setCardView(!cardView)}
            style={{ lineHeight: 0 }}
          />
        </Box>
      </Box>
      {cardView ? (
        <Grid gap="xlarge" pad={{ top: "medium" }} className={cardGrid}>
          {data.map((datum, index) => (
            <Card key={index} data={datum} level={3} />
          ))}
        </Grid>
      ) : (
        <DataTable
          columns={[
            {
              property: "title",
              header: "Name",
            },
            { property: "author", header: "Publisher" },
            { property: "region", header: "Region" },
            {
              property: "category",
              header: "Type",
              render: (datum) => datum.category || "--",
            },
            {
              header: "Action",
              render: (datum) => (
                <Link
                  to={`/${nameToSlug(datum.title)}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <Button label="View details" kind="secondary" />
                </Link>
              ),
            },
          ]}
          data={data}
        />
      )}
    </ContentContainer>
  );
};

export default Services;
