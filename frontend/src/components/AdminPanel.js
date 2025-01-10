import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Box,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Autocomplete,
  AppBar,
  Toolbar,
  IconButton,
  Container,
  Card,
  Link,
  CssBaseline,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { useDropzone } from "react-dropzone";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { SnackbarProvider, useSnackbar } from "notistack";

const createAppTheme = (mode) =>
  createTheme({
    typography: {
      fontFamily: "'Inter', sans-serif",
      h4: { fontWeight: 700, fontSize: "1.75rem", letterSpacing: "0.5px" },
      h6: { fontWeight: 600, fontSize: "1.25rem", letterSpacing: "0.2px" },
      body1: { fontWeight: 400, fontSize: "1rem", letterSpacing: "0.1px" },
      button: {
        textTransform: "none",
        fontWeight: 600,
        letterSpacing: "0.1px",
      },
    },
    palette: {
      mode,
      primary: { main: "#1976d2" },
      secondary: { main: "#ff4081" },
      background: {
        default: mode === "light" ? "#f5f7fa" : "#121212",
        paper: mode === "light" ? "#ffffff" : "#1c1c1e",
      },
      text: {
        primary: mode === "light" ? "#212529" : "#e4e4e4",
        secondary: mode === "light" ? "#495057" : "#b0b3b8",
      },
    },
  });

const AdminPanel = () => {
  const [themeMode, setThemeMode] = useState(
    localStorage.getItem("themeMode") || "light"
  );
  const theme = createAppTheme(themeMode);
  const { enqueueSnackbar } = useSnackbar();

  const toggleTheme = () => {
    const newTheme = themeMode === "light" ? "dark" : "light";
    setThemeMode(newTheme);
    localStorage.setItem("themeMode", newTheme);
    enqueueSnackbar(`Switched to ${newTheme} mode`, { variant: "info" });
  };

  const [formData, setFormData] = useState({
    course: "",
    subject: "",
    topic: "",
    chapter: "",
    tags: "",
    questionContent: "",
    solutionContent: "",
    questionType: "MCQ",
    correctOption: "",
    startingRange: "",
    endingRange: "",
  });
  const [subjectSuggestions, setSubjectSuggestions] = useState([]);
  const [chapterSuggestions, setChapterSuggestions] = useState([]);
  const [topicSuggestions, setTopicSuggestions] = useState([]);
  const [inputSubject, setInputSubject] = useState("");
  const [inputChapter, setInputChapter] = useState("");

  useEffect(() => {
    const fetchSubjectSuggestions = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/suggestions/subjects"
        );
        setSubjectSuggestions(response.data);
      } catch (error) {
        console.error("Error fetching subject suggestions:", error);
      }
    };
    fetchSubjectSuggestions();
  }, []);

  const fetchChapterSuggestions = async (subject) => {
    if (!subject) return;
    try {
      const response = await axios.get(
        `http://localhost:5000/suggestions/chapters/${subject}`
      );
      setChapterSuggestions(response.data);
    } catch (error) {
      console.error("Error fetching chapter suggestions:", error);
    }
  };

  const fetchTopicSuggestions = async (chapter) => {
    if (!chapter) return;
    try {
      const response = await axios.get(
        `http://localhost:5000/suggestions/topics/${chapter}`
      );
      setTopicSuggestions(response.data);
    } catch (error) {
      console.error("Error fetching topic suggestions:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = (file, targetField) => {
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prevData) => ({
        ...prevData,
        [targetField]: reader.result,
      }));
      enqueueSnackbar(
        `${
          targetField === "questionContent" ? "Question" : "Solution"
        } image uploaded successfully`,
        {
          variant: "success",
        }
      );
    };
    reader.readAsDataURL(file);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents default form submission behavior
  
    // Disable the button and show "Please wait" notification
    setIsSubmitting(true);
    enqueueSnackbar("Please wait, uploading your question...", { variant: "info" });
  
    try {
      // Send a POST request with formData
      const response = await axios.post("http://localhost:5000/upload", formData);
  
      if (response.status === 200) {  // Check for a successful response
        // Show a success notification
        enqueueSnackbar("Question uploaded successfully!", { variant: "success" });
  
        // Reset form fields
        setFormData({
          course: "",
          subject: "",
          topic: "",
          chapter: "",
          tags: "",
          questionContent: "",
          solutionContent: "",
          questionType: "MCQ",
          correctOption: "",
          startingRange: "",
          endingRange: "",
        });
        
        // Reset Autocomplete input values
        setInputSubject("");
        setInputChapter("");
  
        // Scroll back to the top of the page
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error) {
      // Log error and show failure notification
      console.error("Error uploading question:", error);
      enqueueSnackbar("Failed to upload question.", { variant: "error" });
    } finally {
      // Re-enable the button after request is completed
      setIsSubmitting(false);
    }
  };
  

  const FileDropzone = ({ targetField }) => {
    const { getRootProps, getInputProps } = useDropzone({
      onDrop: (acceptedFiles) =>
        handleFileUpload(acceptedFiles[0], targetField),
      accept: "image/*",
    });

    return (
      <Box
        {...getRootProps()}
        sx={{
          border: "2px dashed #ccc",
          padding: 4,
          textAlign: "center",
          cursor: "pointer",
          borderRadius: 2,
          mt: 2,
        }}
      >
        <input {...getInputProps()} />
        <Typography>Drag & drop an image here, or click to select</Typography>
        {formData[targetField] && (
          <Box sx={{ mt: 2 }}>
            <img
              src={formData[targetField]}
              alt="Preview"
              style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: 8 }}
            />
          </Box>
        )}
      </Box>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh" }}>
        <AppBar position="static" color="primary">
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Admin Panel
            </Typography>
            <Link
              href="/questions"
              color="inherit"
              underline="none"
              sx={{ mr: 2 }}
            >
              <Button color="inherit" startIcon={<AssignmentIcon />}>
                Manage Questions
              </Button>
            </Link>
            <IconButton
              color="inherit"
              onClick={toggleTheme}
              aria-label="Toggle light/dark theme"
            >
              {themeMode === "light" ? (
                <Brightness4Icon />
              ) : (
                <Brightness7Icon />
              )}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
          <Card
            elevation={6}
            sx={{
              p: 4,
              borderRadius: 3,
              boxShadow: "0px 8px 16px rgba(0,0,0,0.2)",
            }}
          >
            <Typography variant="h4" gutterBottom>
              Upload New Question
            </Typography>
            <form onSubmit={handleSubmit}>
              {/* Course Selection */}
              <FormControl fullWidth margin="normal">
                <InputLabel>Course</InputLabel>
                <Select
                  label="Course"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                >
                  <MenuItem value="11th - JEE Mains">11th - JEE Mains</MenuItem>
                  <MenuItem value="11th - NEET">11th - NEET</MenuItem>
                  <MenuItem value="12th - JEE Mains">12th - JEE Mains</MenuItem>
                  <MenuItem value="12th - NEET">12th - NEET</MenuItem>
                </Select>
              </FormControl>

              {/* Autocomplete components for subjects, chapters, topics */}
              <Autocomplete
                options={subjectSuggestions}
                freeSolo // Allows custom input
                inputValue={inputSubject}
                onInputChange={(event, newValue) => {
                  setInputSubject(newValue);
                  setFormData({ ...formData, subject: newValue });
                  fetchChapterSuggestions(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Subject"
                    margin="normal"
                    fullWidth
                  />
                )}
              />

              <Autocomplete
                options={chapterSuggestions}
                freeSolo // Allows custom input
                inputValue={inputChapter}
                onInputChange={(event, newValue) => {
                  setInputChapter(newValue);
                  setFormData({ ...formData, chapter: newValue });
                  fetchTopicSuggestions(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Chapter"
                    margin="normal"
                    fullWidth
                  />
                )}
              />

              <Autocomplete
                options={topicSuggestions}
                freeSolo // Allows custom input
                inputValue={formData.topic}
                onInputChange={(event, newValue) =>
                  setFormData({ ...formData, topic: newValue })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Topic"
                    margin="normal"
                    fullWidth
                  />
                )}
              />

              {/* File upload sections with drag-and-drop */}
              <Typography variant="h6" sx={{ mt: 3 }}>
                Upload Question Image
              </Typography>
              <FileDropzone targetField="questionContent" />

              <Typography variant="h6" sx={{ mt: 3 }}>
                Upload Solution Image
              </Typography>
              <FileDropzone targetField="solutionContent" />

              {/* Question Type Selection and Conditional Fields */}
              <FormControl fullWidth margin="normal">
                <InputLabel>Question Type</InputLabel>
                <Select
                  label="Question Type"
                  name="questionType"
                  value={formData.questionType}
                  onChange={handleInputChange}
                >
                  <MenuItem value="MCQ">MCQ</MenuItem>
                  <MenuItem value="Numerical">Numerical</MenuItem>
                </Select>
              </FormControl>

              {formData.questionType === "MCQ" ? (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Correct Option</InputLabel>
                  <Select
                    label="Correct Option"
                    name="correctOption"
                    value={formData.correctOption}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="A">Option A</MenuItem>
                    <MenuItem value="B">Option B</MenuItem>
                    <MenuItem value="C">Option C</MenuItem>
                    <MenuItem value="D">Option D</MenuItem>
                  </Select>
                </FormControl>
              ) : (
                <>
                  <TextField
                    label="Correct Option"
                    name="correctOption"
                    value={formData.correctOption}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Starting Range"
                    name="startingRange"
                    value={formData.startingRange}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Ending Range"
                    name="endingRange"
                    value={formData.endingRange}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                </>
              )}

              <Button
                variant="contained"
                color="primary"
                type="submit"
                sx={{
                  mt: 3,
                  borderRadius: 8,
                  padding: "12px 24px",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                    backgroundColor: theme.palette.primary.dark,
                  },
                  ...(isSubmitting && {
                    backgroundColor: theme.palette.grey[500],
                    cursor: "not-allowed",
                  }),
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Please wait..." : "Submit Question"}
              </Button>
            </form>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

const App = () => (
  <SnackbarProvider
    maxSnack={3}
    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
  >
    <AdminPanel />
  </SnackbarProvider>
);

export default App;
