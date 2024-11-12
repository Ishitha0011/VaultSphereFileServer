import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Container,
  CssBaseline,
  Drawer,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
  LinearProgress,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CloudUpload, Folder, Image, Description, Menu as MenuIcon, Brightness4, Brightness7 } from '@mui/icons-material';
import { getRESTApi, postBinFile } from '../restutils/restapihelper';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import logo from '../../public/vs-logo.png'; // Import logo image
import { useDropzone } from 'react-dropzone'; // Import for drag-and-drop functionality

const actions = [
  { name: "Images", icon: <Image /> },
  { name: "Artifacts", icon: <Folder /> },
];

const Index = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#90caf9' : '#A7C7E7',
      },
      secondary: {
        main: darkMode ? '#A64D79' : '#F5E1DA',
      },
      background: {
        default: darkMode ? '#121212' : '#FBF8F1',
        paper: darkMode ? '#1e1e1e' : '#FFFFFF',
      },
      text: {
        primary: darkMode ? '#ffffff' : '#4A4A4A',
        secondary: darkMode ? '#b0b0b0' : '#757575',
      },
    },
    shape: {
      borderRadius: 12,
    },
  });

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = () => {
    getRESTApi("/rest/files/ISO")
      .then((response) => {
        setFiles(response["result"]["data"]);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="fixed" color="primary" elevation={0}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img src={logo} alt="VaultSphere Logo" style={{ width: 40, marginRight: 8 }} />
            <Typography variant="h6" noWrap>
              VaultSphere File Server
            </Typography>
          </Box>

          {/* Right-aligned Menu, Theme Toggle and Login */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={handleThemeToggle} color="inherit">
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
            <Button color="inherit" onClick={() => navigate("/login")}>Login</Button>
            <IconButton edge="end" color="inherit" onClick={() => setDrawerOpen(!drawerOpen)}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right" // Move sidebar to the right
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 240,
            bgcolor: 'secondary.main',
            overflowY: 'auto', // Allow scrolling if content exceeds viewport
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', // Softer shadow for the drawer
          },
        }}
      >
        <Box sx={{ padding: 2, minHeight: '100vh' }}>
          <Typography variant="h6" color="textPrimary" gutterBottom>
            Folders
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            {actions.map((action, index) => (
              <Button
                key={index}
                variant="outlined"
                startIcon={action.icon}
                onClick={() => {
                  setDrawerOpen(false);
                  window.location.href = "/" + action.name.toLowerCase();
                }}
              >
                {action.name}
              </Button>
            ))}
          </Box>
        </Box>
      </Drawer>

      <Box sx={{ paddingTop: 8, bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
        <Container maxWidth="lg" sx={{ paddingY: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ borderRadius: 1.2, boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
                <CardContent>
                  <Typography variant="h6">Upload a File</Typography>
                  <MainContent files_list={files} setFiles={setFiles} fetchFiles={fetchFiles} theme={theme} />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={8}>
              <Card variant="outlined" sx={{ boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Uploaded Files
                  </Typography>
                  <FileTable files_list={files} theme={theme} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};
const MainContent = ({ files_list, setFiles, fetchFiles, theme }) => {
  const [progress, setProgress] = useState(0);
  const [currentSize, setCurrentSize] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [filename, setFilename] = useState("");

  const handleResetProgress = () => {
    setProgress(0);
    setCurrentSize(0);
    setTotalSize(0);
    setFilename("");
  };

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFilename(file.name);

      postBinFile(
        { file: file.name, type: file.type },
        file,
        (event) => {
          const data = event.result.data;
          setCurrentSize(data["end"]);
          setTotalSize(data["size"]);
          setProgress(Math.floor((data["end"] * 100) / data["size"]));
        },
        (err) => {
          if (err) {
            console.error("Error uploading file: ", err);
            return;
          }
          fetchFiles();
          handleResetProgress();
        }
      );
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: theme.palette.primary.main,
          borderRadius: 1.2,
          padding: 4,
          textAlign: 'center',
          backgroundColor: theme.palette.background.paper,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', // Softer shadow for the drop area
          transition: 'background-color 0.3s ease',
          '&:hover': {
            backgroundColor: theme.palette.grey[100],
          },
        }}
      >
        <input {...getInputProps()} />
        <Typography variant="body1" color="textSecondary">
          Drag & drop files here, or click to select files
        </Typography>
      </Box>
      <LinearProgress variant="determinate" value={progress} sx={{ marginTop: 2 }} />
      <Button
        onClick={handleResetProgress}
        variant="contained"
        color="primary"
        sx={{ marginTop: 2, borderRadius: 12, boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', '&:hover': { boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' } }}
      >
        Reset
      </Button>
      <Typography variant="body1" sx={{ marginTop: 2 }}>
        {filename ? `Uploaded ${currentSize} of ${totalSize} bytes of ${filename}` : ""}
      </Typography>
    </>
  );
};

const FileTable = ({ files_list, theme }) => {
  const getChipColor = (type) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return "primary"; // blue
      case "txt":
        return "success"; // green
      case "csv":
        return "warning"; // orange
      case "xls":
      case "xlsx":
        return "info"; // light blue
      case "iso":
      case "zip":
        return "secondary"; // pink
      default:
        return "default"; // gray for unknown types
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>File Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {files_list.map((datum) => (
            <TableRow key={datum.filename}>
              <TableCell>
                <a
                  href={datum.url}
                  style={{
                    color: theme.palette.text.primary,
                    textDecoration: 'none'
                  }}
                >
                  {datum.filename}
                </a>
              </TableCell>
              <TableCell>
                <Chip
                  label={datum.type.toUpperCase()}
                  color={getChipColor(datum.type)}
                  sx={{ fontWeight: 'bold' }}
                />
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => { navigator.clipboard.writeText(datum.url); }}
                  variant="contained"
                  color="secondary"
                  startIcon={<ContentCopyIcon />}
                  sx={{
                    borderRadius: 12,
                    boxShadow: '0 1px 5px rgba(0, 0, 0, 0.1)', // Softer shadow for the Copy URL button
                    '&:hover': {
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)', // Slightly stronger shadow on hover
                    },
                  }}
                >
                  Copy URL
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Index;
