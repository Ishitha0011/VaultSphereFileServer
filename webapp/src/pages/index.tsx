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
  "Login"
];

const Index = () => {
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);

  // Listener for route change
  useEffect(() => {
    const changeRoute = () => {
      navigate(window.location.pathname);
    };

    window.addEventListener("routeChange", changeRoute);
    changeRoute();
    return () => window.removeEventListener("routeChange", changeRoute);
  }, []);

  // Fetch files from the backend
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = () => {
    getRESTApi("/rest/files/ISO")
      .then((response) => {
          console.log(response);
          setFiles(response["result"]["data"]);
      })
      .catch((err) => {
          console.log(err);
      });
  };

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
          <MainContent files_list={files} setFiles={setFiles} fetchFiles={fetchFiles} />
        </Grid>
      </PageContent>
    </Page>
  );
};

interface FileObject {
    filename: string;
    type: string;
    url: string;
}

interface MainContentProps {
    files_list: FileObject[];
    setFiles: React.Dispatch<React.SetStateAction<FileObject[]>>;
    fetchFiles: () => void;
}

const MainContent: React.FC<MainContentProps> = ({ files_list, setFiles, fetchFiles }) => {

  const [progress, setProgress] = useState(0);
  const [currentSize, setCurrentSize] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [filename, setFilename] = useState("");
  const [toast, setToast] = useState(false);
  const [uploadSuccessToast, setUploadSuccessToast] = useState(false);

  // Manual reset function for progress bar
  const handleResetProgress = () => {
    setProgress(0);
    setCurrentSize(0);
    setTotalSize(0);
    setFilename("");
    setUploadSuccessToast(false);
  };

  // Function to handle file upload
  const handleFileUpload = (event, { files }: { files?: File[] } = {}) => {
    const fileList = files as File[];
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];
    setFilename(file.name);

    // File upload with progress handling
    postBinFile(
      { file: file.name, type: file.type },
      file,
      (event) => {
        const data = event.result.data;
        setCurrentSize(data["end"]);
        setTotalSize(data["size"]);
        setProgress(Math.floor((data["end"] * 100) / data["size"]));
      },
      (err, res) => {
        if (err) {
          console.error("Error uploading file: ", err);
          return;
        }
        // On success
        setUploadSuccessToast(true);
        fetchFiles(); // Refresh the file list after successful upload
        handleResetProgress(); // Reset the progress after upload
      }
    );
  };

  return (
    <Box direction={"column"} gap="medium" className={rightGridContainer}>
        <ContentContainer align="start" justify="between">
          <Box gap="small">
            <Heading level={2}>File Upload</Heading>
            <FileInput
                name="file"
                multiple={false}
                onChange={handleFileUpload}
            />
            <Box direction="row" align="center" gap="small">
              <Meter
                  values={[{
                    value: progress,
                    label: 'Upload Progress',
                  }]}
                  aria-label="meter"
                  size="small"
                  thickness="medium"
              />
              <Button
                label="Reset"
                onClick={handleResetProgress}
                kind="secondary"
              />
            </Box>
            <Box>
              <Text>{filename ? `Uploaded ${currentSize} of ${totalSize} bytes of ${filename}` : "No file uploading"}</Text>
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
                         render: (datum) => (
                                <Text>{datum.type}</Text>
                        ),
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
            {uploadSuccessToast && (
                <Notification
                    toast
                    title="Upload Successful"
                    message="The file has been successfully uploaded."
                    onClose={() => setUploadSuccessToast(false)}
                    time={4000}
                />
            )}
        </ContentContainer>


    </Box>
  );
};

export default Index;
