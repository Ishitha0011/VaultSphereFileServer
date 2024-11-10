import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Page, PageContent, PageHeader } from "grommet-exp";

import { container } from "../styles.css";

const Devices = () => {
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
        <PageHeader
          title="Devices"
          subtitle="This is a placeholder page at the moment."
        />
      </PageContent>
    </Page>
  );
};

export default Devices;
