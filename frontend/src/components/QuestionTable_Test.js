import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import {
  CardContent,
  Button,
  Modal,
  Box,
  TextField,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const QuestionTable = () => {
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [newSolutionImage, setNewSolutionImage] = useState(null);
  const [openImageModal, setOpenImageModal] = useState(false); // Track image modal open state
  const [imageToEnlarge, setImageToEnlarge] = useState(""); // Store the image to be enlarged
  const [openBothImagesModal, setOpenBothImagesModal] = useState(false); // Modal for both question and solution images
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [totalRows, setTotalRows] = useState(0); // To store the total rows count
  const [pageSize, setPageSize] = useState(50);

  const themeMode = "light"; // You can toggle this based on your app state

  const theme = createTheme({
    palette: {
      mode: themeMode,
    },
  });

  // Fetch questions based on current page
  const totalPages = Math.ceil(totalRows / pageSize); // calculate total pages

  const fetchQuestions = async (page, limit) => {
    try {
      const response = await fetch(`http://193.203.163.4:5000/questions?page=${page + 1}&limit=${limit}`);
      const data = await response.json();
      setQuestions(data.questions);  // Update the questions with the new data
      setTotalRows(data.total);  // Update the total row count for pagination calculation
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };
  

  useEffect(() => {
    fetchQuestions(currentPage, pageSize);
  }, [currentPage, pageSize]); // Effect runs when currentPage or pageSize changes

  // Handle page change in DataGrid
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage); // Set the current page state
    fetchQuestions(newPage, pageSize); // Fetch new data for the new page
  };
  

  // Handle page size change in DataGrid
  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(0); // Reset to the first page when page size changes
    fetchQuestions(0, newPageSize); // Fetch new data for the first page with the new page size
  };
  

  // Handle next page button click
  const handleNextPage = () => {
    setCurrentPage((prevPage) => {
      const nextPage = prevPage + 1;
      fetchQuestions(nextPage, pageSize); // Fetch data for the next page
      return nextPage; // Update the current page
    });
  };
  

  // Handle editing a question
  const handleEdit = (questionId) => {
    const question = questions.find((q) => q.quesID === questionId);
    setSelectedQuestion(question);
    setOpenEditModal(true);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Update questionContent directly in the selectedQuestion state
        setSelectedQuestion((prev) => ({
          ...prev,
          questionContent: reader.result, // Set the new image here
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSolutionImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Update solutionContent directly in the selectedQuestion state
        setSelectedQuestion((prev) => ({
          ...prev,
          solutionContent: reader.result, // Set the new image here
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedQuestion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    try {
      // Send the updated selectedQuestion to the backend (including new images if any)
      await axios.put(
        `http://193.203.163.4:5000/questions/${selectedQuestion.quesID}`,
        selectedQuestion
      );
      setOpenEditModal(false);
      fetchQuestions(currentPage, pageSize); // Refresh the question list after updating
    } catch (error) {
      console.error("Error updating question:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://193.203.163.4:5000/questions/${selectedQuestion.quesID}`
      );
      setOpenEditModal(false);
      fetchQuestions(currentPage, pageSize); // Refresh the question list after deleting
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  // Define columns for DataGrid
  const columns = useMemo(
    () => [
      { field: "quesID", headerName: "QID", width: 150 },
      { field: "course", headerName: "Course", width: 150 },
      { field: "subject", headerName: "Subject", width: 150 },
      { field: "chapter", headerName: "Chapter", width: 150 },
      { field: "topic", headerName: "Topic", width: 150 },
      {
        field: "questionContent",
        headerName: "Question",
        width: 300,
        renderCell: (params) => (
          <Button onClick={() => handleImageEnlarge(params.value)}>
            Enlarge Image
          </Button>
        ),
      },
      {
        field: "solutionContent",
        headerName: "Solution",
        width: 300,
        renderCell: (params) => (
          <Button onClick={() => handleImageEnlarge(params.value)}>
            Enlarge Image
          </Button>
        ),
      },
      {
        field: "questionType",
        headerName: "Question Type",
        width: 150,
      },
      {
        field: "startingRange",
        headerName: "Starting Range",
        width: 150,
      },
      {
        field: "endingRange",
        headerName: "Ending Range",
        width: 150,
      },

      {
        field: "actions",
        headerName: "Actions",
        width: 150,
        renderCell: (params) => (
          <Button onClick={() => handleEdit(params.id)}>Edit</Button>
        ),
      },
    ],
    [questions]
  );

  const handleImageEnlarge = (imageSrc) => {
    setImageToEnlarge(imageSrc);
    setOpenImageModal(true);
  };

  const handleTypeChange = (e) => {
    const { name, value } = e.target;

    if (name === "questionType" && value === "MCQ") {
      // Reset the range fields when MCQ is selected
      setSelectedQuestion((prev) => ({
        ...prev,
        questionType: value,
        startingRange: "", // Reset starting range
        endingRange: "", // Reset ending range
      }));
    } else {
      setSelectedQuestion((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div style={{ height: 600, width: "100%" }}>
        <h1>Questions</h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <DataGrid
  rows={questions}  // Update rows based on fetched data
  columns={columns}
  pageSize={pageSize}
  rowCount={totalRows}  // This should represent the total rows for pagination calculation
  paginationMode="server"
  pagination
  page={currentPage}  // currentPage should be 0-indexed for DataGrid
  onPageChange={handlePageChange}  // Trigger data fetch when page changes
  onPageSizeChange={handlePageSizeChange}  // Trigger page size change
  rowsPerPageOptions={[50, 100, 200]}  // Options for page size
  getRowId={(row) => row.quesID}  // Ensure the rows have a unique identifier
/>

        )}

        {/* Edit Modal */}
        <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              padding: 2,
            }}
          >
            <Card
              sx={{
                position: "relative",
                maxWidth: "500px",
                maxHeight: "90vh", // Limit the modal height to 90% of the viewport height
                overflowY: "auto", // Enable vertical scrolling
                backgroundColor: "white",
                padding: 4,
              }}
            >
              <IconButton
                sx={{ position: "absolute", top: 0, right: 0, color: "black" }}
                onClick={() => setOpenEditModal(false)}
              >
                <CloseIcon />
              </IconButton>
              <CardContent>
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
                <FormControl fullWidth margin="normal">
                  <InputLabel>Question Type</InputLabel>
                  <Select
                    name="questionType"
                    value={selectedQuestion?.questionType || ""}
                    onChange={handleTypeChange}
                    label="Question Type"
                  >
                    <MenuItem value="MCQ">MCQ</MenuItem>
                    <MenuItem value="Numerical">Numerical</MenuItem>
                  </Select>
                </FormControl>

                {/* Conditionally render the Starting and Ending Range fields based on Question Type */}
                {selectedQuestion?.questionType === "Numerical" && (
                  <>
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Starting Range"
                      name="startingRange"
                      value={selectedQuestion?.startingRange}
                      onChange={handleInputChange}
                    />
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Ending Range"
                      name="endingRange"
                      value={selectedQuestion?.endingRange}
                      onChange={handleInputChange}
                    />
                  </>
                )}

                {/* Question Image Upload */}
                {selectedQuestion?.questionContent &&
                selectedQuestion.questionContent.startsWith("data:image") ? (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1">
                      Current Question Image:
                    </Typography>
                    <img
                      src={selectedQuestion.questionContent}
                      alt="Question Preview"
                      width="100%"
                      style={{
                        maxHeight: "300px",
                        objectFit: "contain",
                        marginTop: "10px",
                      }}
                    />
                    {/* Upload button below the image */}
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        component="label"
                        sx={{ mt: 2 }}
                      >
                        Upload New Image for Question
                        <input
                          type="file"
                          hidden
                          onChange={handleImageUpload}
                        />
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      component="label"
                      sx={{ mt: 2 }}
                    >
                      Upload New Image for Question
                      <input type="file" hidden onChange={handleImageUpload} />
                    </Button>
                  </Box>
                )}

                {/* Solution Image Upload */}
                {selectedQuestion?.solutionContent &&
                selectedQuestion.solutionContent.startsWith("data:image") ? (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1">
                      Current Solution Image:
                    </Typography>
                    <img
                      src={selectedQuestion.solutionContent}
                      alt="Solution Preview"
                      width="100%"
                      style={{
                        maxHeight: "300px",
                        objectFit: "contain",
                        marginTop: "10px",
                      }}
                    />
                    {/* Upload button below the image */}
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        component="label"
                        sx={{ mt: 2 }}
                      >
                        Upload New Image for Solution
                        <input
                          type="file"
                          hidden
                          onChange={handleSolutionImageUpload}
                        />
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      component="label"
                      sx={{ mt: 2 }}
                    >
                      Upload New Image for Solution
                      <input
                        type="file"
                        hidden
                        onChange={handleSolutionImageUpload}
                      />
                    </Button>
                  </Box>
                )}

                {/* Button to Save Changes */}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdate}
                  sx={{ marginTop: 2 }}
                >
                  Save Changes
                </Button>

                {/* Button to Delete Question */}
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDelete}
                  sx={{ marginTop: 2, marginLeft: 2 }}
                >
                  Delete Question
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Modal>

        {/* Image Enlarge Modal */}
        <Modal open={openImageModal} onClose={() => setOpenImageModal(false)}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
            }}
          >
            <Card sx={{ position: "relative", maxWidth: 600 }}>
              <IconButton
                sx={{ position: "absolute", top: 0, right: 0, color: "black" }}
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

        {/* Next Page Button */}
        <Button
  variant="contained"
  color="primary"
  onClick={handleNextPage}
  sx={{ marginTop: 2 }}
  disabled={(currentPage + 1) * pageSize >= totalRows} // Disable button when on the last page
>
  Next Page
</Button>

      </div>
    </ThemeProvider>
  );
};

export default QuestionTable;
