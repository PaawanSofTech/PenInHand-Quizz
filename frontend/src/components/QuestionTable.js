import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  IconButton,
  Card,
  CardContent,
  Container,
  AppBar,
  Toolbar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material"; // Corrected import
import Brightness4Icon from "@mui/icons-material/Brightness4"; // For Dark mode
import Brightness7Icon from "@mui/icons-material/Brightness7"; // For Light mode
import MenuIcon from "@mui/icons-material/Menu"; // For menu icon
import AddIcon from "@mui/icons-material/Add"; // For Admin Panel
import { Link } from "react-router-dom"; // Ensure Link is imported

const QuestionTable = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [imageToEnlarge, setImageToEnlarge] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [newSolutionImage, setNewSolutionImage] = useState(null);
  const [themeMode, setThemeMode] = useState("light");
  const [loading, setLoading] = useState(true); // Added loading state

  // Define the theme with dynamic mode based on themeMode state
  const createAppTheme = (mode) =>
    createTheme({
      typography: {
        fontFamily: "'Inter', sans-serif", // Primary font for all text
        h4: {
          fontWeight: 700,
          fontSize: "1.75rem",
          letterSpacing: "0.5px", // Slightly increased spacing for header
        },
        h6: {
          fontWeight: 600,
          fontSize: "1.25rem",
          letterSpacing: "0.2px",
        },
        body1: {
          fontWeight: 400,
          fontSize: "1rem",
          letterSpacing: "0.1px",
        },
        button: {
          textTransform: "none", // Remove uppercase for a modern look
          fontWeight: 600,
          letterSpacing: "0.1px",
        },
      },
      palette: {
        mode, // Use dynamic mode based on themeMode state
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

  // Fetch all questions from the backend
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true); // Start loading
        const response = await axios.get("http://193.203.163.4:5000/questions");
        setQuestions(response.data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false); // Stop loading after data is fetched
      }
    };

    fetchQuestions();
  }, []);

  const handleEdit = (row) => {
    setSelectedQuestion(row);
    setOpenEditModal(true);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Set startingRange and endingRange to null if MCQ is selected
    if (name === "questionType") {
      setSelectedQuestion({
        ...selectedQuestion,
        questionType: value,
        startingRange: value === "MCQ" ? null : selectedQuestion.startingRange,
        endingRange: value === "MCQ" ? null : selectedQuestion.endingRange,
      });
    } else {
      setSelectedQuestion({ ...selectedQuestion, [name]: value });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewImage(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSolutionImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewSolutionImage(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    const updatedData = {
      ...selectedQuestion,
      questionContent: newImage || selectedQuestion.questionContent,
      solutionContent: newSolutionImage || selectedQuestion.solutionContent,
    };

    try {
      const response = await axios.put(
        `http://193.203.163.4:5000/questions/${selectedQuestion._id}`,
        updatedData
      );

      const updatedQuestion = response.data;
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q._id === updatedQuestion._id ? updatedQuestion : q
        )
      );

      alert("Question updated successfully!");
      setOpenEditModal(false);
      setNewImage(null);
      setNewSolutionImage(null);
    } catch (error) {
      console.error("Error updating question:", error);
    }
  };

  const handleImageClick = (image) => {
    setImageToEnlarge(image); // Set the image to be displayed in the modal
    setOpenImageModal(true); // Open the modal
  };

  const handleDelete = async () => {
    if (!selectedQuestion?._id) {
      alert("No question selected for deletion.");
      return;
    }
    try {
      await axios.delete(
        `http://193.203.163.4:5000/questions/${selectedQuestion._id}`
      );
      setQuestions((prevQuestions) =>
        prevQuestions.filter((q) => q._id !== selectedQuestion._id)
      );
      setOpenEditModal(false);
      alert("Question deleted successfully!");
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Error deleting question.");
    }
  };

  // Custom styles for AppBar and its contents
  const appBarStyles = (themeMode) => ({
    backgroundColor: themeMode === "light" ? "#1976d2" : "#333", // Blue for light, dark for dark mode
    boxShadow:
      themeMode === "light"
        ? "0 2px 5px rgba(0, 0, 0, 0.1)"
        : "0 2px 10px rgba(0, 0, 0, 0.5)",
  });

  const toolbarLeftStyles = {
    display: "flex",
    alignItems: "center",
  };

  const toolbarRightStyles = {
    display: "flex",
    alignItems: "center",
  };

  const iconStyles = {
    color: "#fff",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
  };

  const typographyStyles = {
    flexGrow: 1,
    fontWeight: 700,
    fontSize: "1.5rem",
    color: "#fff",
  };

  const buttonStyles = {
    color: "#fff",
  };

  const renderContent = (content) => {
    if (typeof content === "string" && content.startsWith("data:image")) {
      // Render a link instead of the image itself
      return <Button onClick={() => handleImageClick(content)}>Image</Button>;
    }
    return <span>{content}</span>;
  };

  const columns = [
    { field: "quesID", headerName: "QID", width: 100 },
    { field: "course", headerName: "Course", width: 140 },
    { field: "subject", headerName: "Subject", width: 140 },
    { field: "chapter", headerName: "Chapter", width: 140 },
    { field: "topic", headerName: "Topic", width: 140 },
    
    {
      field: "questionContent",
      headerName: "Question",
      width: 150,
      renderCell: (params) => renderContent(params.row.questionContent),
    },
    {
      field: "solutionContent",
      headerName: "Solution",
      width: 150,
      renderCell: (params) => renderContent(params.row.solutionContent),
    },
    {
      field: "correctOption",
      headerName: "Correct Option",
      width: 125,
    },
    {
      field: "startingRange",
      headerName: "Starting Range",
      width: 125,
    },
    {
      field: "endingRange",
      headerName: "Ending Range",
      width: 125,
    },
    {
      field: "edit",
      headerName: "Edit",
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleEdit(params.row)}
        >
          Edit
        </Button>
      ),
      width: 100,
    },
  ];

  // Toggle theme
  const toggleTheme = () => {
    setThemeMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  return (
    <ThemeProvider theme={createAppTheme(themeMode)}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh" }}>
        {/* Navbar */}
        <AppBar position="static" sx={appBarStyles(themeMode)}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            {/* Left Section: Menu Icon and Title */}
            <Box sx={toolbarLeftStyles}>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={iconStyles}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" sx={typographyStyles}>
                Admin Panel
              </Typography>
            </Box>

            {/* Right Section: Manage Questions Button and Theme Toggle */}
            <Box sx={toolbarRightStyles}>
              <Link to="/" color="inherit" underline="none">
                <Button sx={buttonStyles} startIcon={<AddIcon />}>
                  Add Question
                </Button>
              </Link>

              {/* Theme Toggle Button */}
              <IconButton
                color="inherit"
                onClick={toggleTheme}
                aria-label="Toggle light/dark theme"
                sx={iconStyles}
              >
                {themeMode === "light" ? (
                  <Brightness4Icon />
                ) : (
                  <Brightness7Icon />
                )}
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center", // Horizontally center the Card
            alignItems: "center", // Vertically center the Card (optional)
            height: "100vh", // Make sure it takes up the full viewport height
          }}
        >
          <Card
            elevation={6}
            sx={{
              p: 2,
              borderRadius: 3,
              boxShadow: "0px 8px 16px rgba(0,0,0,0.2)",
              width: "100%",
              maxWidth: "1620px",
              height: "500px",
              overflowY: "auto",
            }}
          >
            <Typography
              variant="h4"
              sx={{ padding: "16px", marginBottom: "16px", fontWeight: 700 }}
            >
              Manage Questions
            </Typography>
            <DataGrid
              rows={questions}
              columns={columns}
              pageSize={10} // Set the initial number of questions to display
              getRowId={(row) => row._id}
              loading={loading} // Set the loading state to true while fetching data
              components={{
                NoRowsOverlay: () => (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    {loading ? "Loading Rows..." : "No rows"}
                  </div>
                ),
              }}
              sx={{
                width: "100%", // Set the width of the DataGrid to 100% of its container
                height: "400px", // Set a fixed height for DataGrid
              }}
            />

            {/* Edit Modal */}
            <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
              <Box
                sx={{
                  padding: 4,
                  backgroundColor: "white",
                  margin: "auto",
                  width: 500,
                  maxHeight: "90vh",
                  overflowY: "auto",
                }}
              >
                <Typography variant="h6">Edit Question</Typography>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Course"
                  name="course"
                  value={selectedQuestion?.course}
                  onChange={handleInputChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Subject"
                  name="subject"
                  value={selectedQuestion?.subject}
                  onChange={handleInputChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Chapter"
                  name="chapter"
                  value={selectedQuestion?.chapter}
                  onChange={handleInputChange}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Topic"
                  name="topic"
                  value={selectedQuestion?.topic}
                  onChange={handleInputChange}
                />
                

                {/* Question Image Upload */}
                {selectedQuestion?.questionContent &&
                selectedQuestion.questionContent.startsWith("data:image") ? (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1">
                      Current Question Image:
                    </Typography>
                    <img
                      src={newImage || selectedQuestion.questionContent}
                      alt="Current Question"
                      width="100%"
                    />
                    <Button
                      variant="contained"
                      component="label"
                      sx={{ mt: 2 }}
                    >
                      Upload New Image
                      <input type="file" hidden onChange={handleImageUpload} />
                    </Button>
                  </Box>
                ) : (
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Question Content"
                    name="questionContent"
                    value={selectedQuestion?.questionContent}
                    onChange={handleInputChange}
                  />
                )}

                {/* Solution Image Upload */}
                {selectedQuestion?.solutionContent &&
                selectedQuestion.solutionContent.startsWith("data:image") ? (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1">
                      Current Solution Image:
                    </Typography>
                    <img
                      src={newSolutionImage || selectedQuestion.solutionContent}
                      alt="Current Solution"
                      width="100%"
                    />
                    <Button
                      variant="contained"
                      component="label"
                      sx={{ mt: 2 }}
                    >
                      Upload New Solution Image
                      <input
                        type="file"
                        hidden
                        onChange={handleSolutionImageUpload}
                      />
                    </Button>
                  </Box>
                ) : (
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Solution Content"
                    name="solutionContent"
                    value={selectedQuestion?.solutionContent}
                    onChange={handleInputChange}
                  />
                )}

                {/* Question Type Selector */}
                <FormControl fullWidth margin="normal">
                  <InputLabel>Question Type</InputLabel>
                  <Select
                    label="Question Type"
                    name="questionType"
                    value={selectedQuestion?.questionType || ""}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="MCQ">MCQ</MenuItem>
                    <MenuItem value="Numerical">Numerical</MenuItem>
                  </Select>
                </FormControl>

                {/* Conditional Correct Option Fields */}
                {selectedQuestion?.questionType && (
                  <>
                    {selectedQuestion.questionType === "Numerical" ? (
                      <>
                        <TextField
                          fullWidth
                          margin="normal"
                          label="Starting Range"
                          name="startingRange"
                          value={selectedQuestion?.startingRange || ""}
                          onChange={handleInputChange}
                        />
                        <TextField
                          fullWidth
                          margin="normal"
                          label="Ending Range"
                          name="endingRange"
                          value={selectedQuestion?.endingRange || ""}
                          onChange={handleInputChange}
                        />
                        <TextField
                          fullWidth
                          margin="normal"
                          label="Correct Option"
                          name="correctOption"
                          value={selectedQuestion?.correctOption}
                          onChange={handleInputChange}
                        />
                      </>
                    ) : (
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Correct Option</InputLabel>
                        <Select
                          label="Correct Option"
                          name="correctOption"
                          value={selectedQuestion?.correctOption || ""}
                          onChange={handleInputChange}
                        >
                          <MenuItem value="A">A</MenuItem>
                          <MenuItem value="B">B</MenuItem>
                          <MenuItem value="C">C</MenuItem>
                          <MenuItem value="D">D</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  </>
                )}

                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdate}
                  sx={{
                    marginTop: 2,
                    padding: "8px 16px",
                  }}
                >
                  Save Changes
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDelete}
                  sx={{
                    marginTop: 2,
                    padding: "8px 16px",
                    marginLeft: 2,
                  }}
                >
                  Delete Question
                </Button>
              </Box>
            </Modal>

            {/* Image Enlarge Modal */}
            <Modal
              open={openImageModal}
              onClose={() => setOpenImageModal(false)}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100vh",
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                }}
              >
                <Card
                  sx={{ position: "relative", maxWidth: 600, maxHeight: 600 }}
                >
                  <IconButton
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      color: "black",
                    }}
                    onClick={() => setOpenImageModal(false)}
                  >
                    <CloseIcon />
                  </IconButton>
                  <CardContent>
                    <img
                      src={imageToEnlarge}
                      alt="Enlarged"
                      width="100%"
                      style={{ maxHeight: "500px" }}
                    />
                  </CardContent>
                </Card>
              </Box>
            </Modal>
          </Card>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default QuestionTable;
