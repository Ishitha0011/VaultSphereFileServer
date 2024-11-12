import {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  Grid,
  Grommet,
  Heading,
  Nav,
  Page,
  PageContent,
  PageHeader,
  Paragraph,
  Text,
  ThemeContext,
  Meter,
  Notification,
  Tabs,
  Tab,
} from "grommet";
import { theme } from "./theme";// Import the dark theme
import { Anchor, FileInput } from "grommet";
import {Copy} from "grommet-icons";
import { getRESTApi, postBinFile } from '../restutils/restapihelper';
import data from "../data.json";

const Index = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = () => {
    getRESTApi("/rest/files/ISO")
      .then((response) => setFiles(response["result"]["data"]))
      .catch((err) => console.error(err));
  };

  return (
    <Grommet theme={theme}>
      <Page kind="wide">
        <PageContent gap="medium">
          <PageHeader title="VaultSphere - Secure File Server" />
          <Tabs>
            <Tab title="Folders">
              <Box pad="medium">
                <Nav direction="row" gap="small">
                  {["Images", "Artifacts", "Login"].map((action, index) => (
                    <Button key={index} label={action} onClick={() => navigate(`/${action.toLowerCase()}`)} />
                  ))}
                </Nav>
              </Box>
            </Tab>
            <Tab title="File Upload & Data">
              <MainContent files_list={files} setFiles={setFiles} fetchFiles={fetchFiles} />
            </Tab>
          </Tabs>
        </PageContent>
      </Page>
    </Grommet>
  );
};

const MainContent = ({ files_list, setFiles, fetchFiles }) => {
  const [progress, setProgress] = useState(0);
  const [currentSize, setCurrentSize] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [filename, setFilename] = useState("");
  const [toast, setToast] = useState(false);
  const [uploadSuccessToast, setUploadSuccessToast] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFilename(file.name);
    postBinFile(
      { file: file.name, type: file.type },
      file,
      (event) => {
        const data = event.result.data;
        setCurrentSize(data["end"]);
        setTotalSize(data["size"]);
        setProgress((data["end"] / data["size"]) * 100);
      },
      (err) => {
        if (err) {
          console.error("Error uploading file:", err);
          return;
        }
        setUploadSuccessToast(true);
        fetchFiles();
      }
    );
  };

  return (
    <Box gap="medium">
      <Card background="dark-1">
        <CardHeader pad="medium">File Upload</CardHeader>
        <CardBody pad="medium">
          <FileInput onChange={handleFileUpload} />
          <Meter values={[{ value: progress }]} size="small" thickness="small" />
          <Text>{filename && `Uploaded ${currentSize} of ${totalSize} bytes for ${filename}`}</Text>
        </CardBody>
      </Card>
      <DataTable
        columns={[
          { property: "filename", header: <Text>File Name</Text>, primary: true },
          { property: "type", header: <Text>Type</Text> },
          { property: "url", header: <Text>Action</Text>, render: datum => (
            <Button icon={<Copy />} onClick={() => { navigator.clipboard.writeText(datum.url); setToast(true); }} />
          )},
        ]}
        data={files_list}
      />
      {toast && (
        <Notification
          toast
          title="URL Copied"
          onClose={() => setToast(false)}
          message="File URL copied to clipboard."
        />
      )}
      {uploadSuccessToast && (
        <Notification
          toast
          title="Upload Successful"
          onClose={() => setUploadSuccessToast(false)}
          message="File uploaded successfully."
        />
      )}
    </Box>
  );
};

export default Index;
