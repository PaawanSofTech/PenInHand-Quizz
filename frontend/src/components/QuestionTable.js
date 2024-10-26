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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const QuestionTable = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openImageModal, setOpenImageModal] = useState(false); // To handle image modal
  const [imageToEnlarge, setImageToEnlarge] = useState(null); // To hold the clicked image
  const [newImage, setNewImage] = useState(null); // To hold the uploaded image
  const [newSolutionImage, setNewSolutionImage] = useState(null); // To hold the uploaded solution image

  // Fetch all questions from the backend
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get("https://peninhand-quizz.onrender.com/questions");
        setQuestions(response.data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    fetchQuestions();
  }, []);

  // Open modal for editing
  const handleEdit = (row) => {
    setSelectedQuestion(row);
    setOpenEditModal(true);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedQuestion({ ...selectedQuestion, [name]: value });
  };

  // Handle image upload for question content
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewImage(reader.result); // Set the uploaded image in base64 format
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  // Handle image upload for solution content
  const handleSolutionImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewSolutionImage(reader.result); // Set the uploaded solution image in base64 format
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  // Handle image click to enlarge it
  const handleImageClick = (image) => {
    setImageToEnlarge(image);
    setOpenImageModal(true); // Open the modal to display the image
  };

  // Handle updating the question on the backend
  const handleUpdate = async () => {
    const updatedData = {
      ...selectedQuestion,
      questionContent: newImage || selectedQuestion.questionContent,
      solutionContent: newSolutionImage || selectedQuestion.solutionContent, // Update the solution image if new one is uploaded
    };

    try {
      const response = await axios.put(
        `https://peninhand-quizz.onrender.com/questions/${selectedQuestion._id}`,
        updatedData
      );

      const updatedQuestion = response.data;

      // Update the questions state by replacing the old question with the updated one
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q._id === updatedQuestion._id ? updatedQuestion : q
        )
      );

      alert("Question updated successfully!");
      setOpenEditModal(false); // Close the modal
      setNewImage(null); // Reset the new image state
      setNewSolutionImage(null); // Reset the new solution image state
    } catch (error) {
      console.error("Error updating question:", error);
    }
  };

  // Handle deleting a question
  const handleDelete = async () => {
    try {
      await axios.delete(
        `https://peninhand-quizz.onrender.com/questions/${selectedQuestion._id}`
      );
      setQuestions((prevQuestions) =>
        prevQuestions.filter((q) => q._id !== selectedQuestion._id)
      );
      setOpenEditModal(false); // Close the modal after deletion
      alert("Question deleted successfully!");
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Error deleting question.");
    }
  };

  // Function to render question content (detect if it's an image or text)
  const renderContent = (content) => {
    if (typeof content === "string" && content.startsWith("data:image")) {
      return (
        <img
          src={content}
          alt="Question Image"
          width="100%"
          style={{ cursor: "pointer" }}
          onClick={() => handleImageClick(content)}
        />
      );
    }

    return <span>{content}</span>; // If not an image, render as text
  };

  // Columns for the DataGrid
  const columns = [
    { field: "course", headerName: "Course", width: 150 },
    { field: "subject", headerName: "Subject", width: 150 },
    { field: "topic", headerName: "Topic", width: 150 },
    { field: "chapter", headerName: "Chapter", width: 150 }, // New Chapter Column
    {
      field: "questionContent",
      headerName: "Question",
      width: 250,
      renderCell: (params) => renderContent(params.row.questionContent), // Render as image or text
    },
    {
      field: "solutionContent",
      headerName: "Solution",
      width: 250,
      renderCell: (params) => renderContent(params.row.solutionContent), // Render as image or text
    },
    {
      field: "correctOption",
      headerName: "Correct Option",
      width: 150, // Correct Option Column
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

  return (
    <Box sx={{ height: 400, width: "100%" }}>
      <Typography variant="h4" gutterBottom>
        Manage Questions
      </Typography>
      <DataGrid
        rows={questions}
        columns={columns}
        pageSize={5}
        getRowId={(row) => row._id} // Set the row ID to the MongoDB _id
      />

      {/* Edit Modal */}
      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <Box
          sx={{
            padding: 4,
            backgroundColor: "white",
            margin: "auto",
            width: 500,
            maxHeight: "90vh", // Limit the height of the modal
            overflowY: "auto", // Enable vertical scrolling
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
            label="Topic"
            name="topic"
            value={selectedQuestion?.topic}
            onChange={handleInputChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Chapter" // Added chapter field in modal
            name="chapter"
            value={selectedQuestion?.chapter}
            onChange={handleInputChange}
          />

          {/* Question Content */}
          {selectedQuestion?.questionContent &&
          selectedQuestion.questionContent.startsWith("data:image") ? (
            <div>
              <Typography variant="body1">Current Image:</Typography>
              <img
                src={newImage || selectedQuestion.questionContent}
                alt="Current Question"
                width="100%"
              />
              <Button
                variant="contained"
                component="label"
                sx={{ marginTop: 2 }}
              >
                Upload New Image
                <input type="file" hidden onChange={handleImageUpload} />
              </Button>
            </div>
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

          {/* Solution Content */}
          {selectedQuestion?.solutionContent &&
          selectedQuestion.solutionContent.startsWith("data:image") ? (
            <div>
              <Typography variant="body1">Current Solution Image:</Typography>
              <img
                src={newSolutionImage || selectedQuestion.solutionContent}
                alt="Current Solution"
                width="100%"
              />
              <Button
                variant="contained"
                component="label"
                sx={{ marginTop: 2 }}
              >
                Upload New Solution Image
                <input
                  type="file"
                  hidden
                  onChange={handleSolutionImageUpload}
                />
              </Button>
            </div>
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

          {/* Correct Option */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="correct-option-label">Correct Option</InputLabel>
            <Select
              labelId="correct-option-label"
              id="correct-option"
              value={selectedQuestion?.correctOption || ""} // Use selectedQuestion.correctOption
              onChange={(e) =>
                setSelectedQuestion({
                  ...selectedQuestion,
                  correctOption: e.target.value,
                })
              }
              label="Correct Option"
            >
              {/* Assuming the correct options are "Option 1", "Option 2", etc. */}
              <MenuItem value="A">A</MenuItem>
              <MenuItem value="B">B</MenuItem>
              <MenuItem value="C">C</MenuItem>
              <MenuItem value="D">D</MenuItem>
            </Select>
          </FormControl>

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

          {/* Delete Question Button */}
          {/* <Button
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
          </Button> */}
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
          <Card sx={{ position: "relative", maxWidth: 600, maxHeight: 600 }}>
            <IconButton
              sx={{ position: "absolute", top: 0, right: 0, color: "white" }}
              onClick={() => setOpenImageModal(false)} // Close the image modal
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
    </Box>
  );
};

export default QuestionTable;
