import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {
  Box,
  Button, DataTable,
  Grid,
  Heading,
  Legend,
  Meter,
  Nav,
  Page,
  PageContent,
  PageHeader,
  Paragraph,
  Text,
} from "grommet-exp";
import {
    Anchor,
    FileInput,
    Notification
} from "grommet";
import { FileInputProps } from 'grommet/components/FileInput';
import { ReactComponent as Domain } from "grommet-icons/img/domain.svg";
import { ReactComponent as CloudDownload } from "grommet-icons/img/cloud-download.svg";
import { ReactComponent as Database } from "grommet-icons/img/database.svg";
import { ContentContainer } from "../components";
import {Copy} from "grommet-icons";
import {
  lowerGrid,
  container,
  mainGrid,
  rightGridContainer,
  upperGrid,
} from "../styles.css";

import {getRESTApi, postBinFile, postRESTApi} from '../restutils/restapihelper';
import {nameToSlug} from "../utils";
import data from "../data.json";


const actions = [
  "Images",
  "Artifacts",
];

const Index = () => {
  const navigate = useNavigate();

  const [files, setFiles] = useState([])

  useEffect(() => {
    const changeRoute = () => {
      navigate(window.location.pathname);
    };

    window.addEventListener("routeChange", changeRoute);
    changeRoute();
    return () => window.removeEventListener("routeChange", changeRoute);
  }, []);

  useEffect(() => {
      getRESTApi("/rest/files/ISO")
          .then((response) => {
              console.log(response);
              setFiles(response["result"]["data"]);
          })
          .catch((err) => {
              console.log(err);
          })
  }, []);

  return (
    <Page kind="wide">
      <PageContent className={container} gap="medium">
        <PageHeader
          title="File Server"

        />
        <Grid gap="medium" pad={{ bottom: "large" }} className={mainGrid}>
          <Box gap="medium">
            <ContentContainer>
              <Heading level={2}>Folders</Heading>
              <Nav gap="small">
              {actions.map((action, index) => (
                  <Button key={index} label={action} onClick={() => {window.location.href = "/" + action.toLowerCase()}}/>
                ))}
              </Nav>
            </ContentContainer>
          </Box>
          <MainContent files_list={files} />
        </Grid>
      </PageContent>
    </Page>
  );
};

interface FileObject {
    // Define properties of each file object, for example:
    filename: string;
    type: string;
    url: string;
}

interface MainContentProps {
    files_list: FileObject[];
}

const MainContent: React.FC<MainContentProps> = ({ files_list }) => {

  const [progress, setProgress] = useState(0);
  const [currentSize, setCurrentSize] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [filename, setFilename] = useState("");
  const [toast, setToast] = useState(false);

  return (
    <Box direction={"column"} gap="medium" className={rightGridContainer}>
        <ContentContainer align="start" justify="between">
          <Box gap="small">
            <Heading level={2}>File Upload</Heading>
            <FileInput
                name="file"
                multiple={false}
                onChange={(event, { files }: { files?: File[] } = {}) => {
                  const fileList = files as File[];
                  for (let i = 0; i < fileList.length; i += 1) {
                    const file = fileList[i];
                    console.log(file.name);
                    setFilename(file.name);
                    postBinFile({"file": file.name}, file,
                        (event) => {
                          // progress handler
                          //console.log("action/image addImage: ", event);
                          const data = event.result.data
                          //console.log("action/image addImage data: ", data);
                          setCurrentSize(data['end'])
                          setTotalSize(data['size'])
                          setProgress(Math.floor(data['end'] * 100 / data['size']));
                          // dispatch(addImageProgress(file.name, data['end'], data['size']));
                        },
                        (err, res) => {
                          // if (err || !res.ok) {
                          console.log("Error ", err, " result: ", res);
                          // if (err) {
                          //   dispatch(addImageFailure(file.name, String(err ? err : res.body.error)));
                          // } else {
                          //   dispatch(addImageUploaded(file.name));
                          }
                    );
                  }
                }}
            />
            <Meter
                values={[{
                  value: progress,
                  label: 'sixty',
                  onClick: () => {}
                }]}
                aria-label="meter"
            />
            <Box>
              <Text>{"Uploaded " + currentSize + " of " + totalSize + " of " + filename}</Text>
            </Box>
          </Box>
        </ContentContainer>
        <ContentContainer align="start" justify="between">
            {files_list.length > 0 && <DataTable
                columns={[
                    {
                        property: "filename",
                        header: "File Name",
                        render: (datum) => (
                            <Anchor
                                label={datum.filename}
                                href={datum.url}
                            >
                                <Text>{datum.filename}</Text>
                            </Anchor>
                        ),
                    },
                    {
                        property: "type",
                        header: "Type",
                    },
                    {
                        property: "url",
                        header: "Action",
                        render: (datum) => (
                            <Button icon={<Copy/>} label="Copy URL" kind="secondary" onClick={(event) => {navigator.clipboard.writeText(datum.url); setToast(true)}}/>
                        ),
                    },
                ]}
                data={files_list}
            />}
            {toast && (
                <Notification
                    toast
                    title="Clipboard"
                    message="The file URL is copied to the clipboard"
                    onClose={() => setToast(false)}
                    time={4000}
                />
            )}
        </ContentContainer>


    </Box>
  );
};

export default Index;
