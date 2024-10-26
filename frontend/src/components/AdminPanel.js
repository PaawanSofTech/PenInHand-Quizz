import React, { useState } from "react";
import axios from "axios";
import { Button, TextField, Box, Typography, MenuItem, Select, InputLabel, FormControl } from "@mui/material";

const AdminPanel = () => {
  const [formData, setFormData] = useState({
    course: "",
    subject: "",
    topic: "",
    chapter: "",  
    tags: "",
    questionContent: "",
    solutionContent: "",
    correctOption: "", // New field for correct option
  });

  // Handle input changes for text fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle image upload for question content
  const handleQuestionImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, questionContent: reader.result });
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
      setFormData({ ...formData, solutionContent: reader.result });
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('${process.env.REACT_APP_API_URL}/upload', formData);
      if (response.status === 200) {
        alert("Question uploaded successfully!");
        window.location.reload(); // Refresh the page after successful upload
      }
     } catch (error) {
      console.error("Error uploading question:", error);
      alert("Failed to upload question.");
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4">Admin Panel - Upload Question</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Course"
          name="course"
          value={formData.course}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Subject"
          name="subject"
          value={formData.subject}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Topic"
          name="topic"
          value={formData.topic}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Chapter"
          name="chapter"
          value={formData.chapter}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Tags"
          name="tags"
          value={formData.tags}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />

        {/* Question Image Upload */}
        <Button variant="contained" component="label" sx={{ marginTop: 2 }}>
          Upload Question Image
          <input type="file" hidden onChange={handleQuestionImageUpload} />
        </Button>
        {/* Display uploaded question image */}
        {formData.questionContent && (
          <Box sx={{ marginTop: 2 }}>
            <Typography variant="body1">Question Image Preview:</Typography>
            <img
              src={formData.questionContent}
              alt="Question Preview"
              style={{ width: "100%", maxHeight: "300px", objectFit: "contain" }}
            />
          </Box>
        )}

        {/* Solution Image Upload */}
        <Button variant="contained" component="label" sx={{ marginTop: 2, marginLeft: 2 }}>
          Upload Solution Image
          <input type="file" hidden onChange={handleSolutionImageUpload} />
        </Button>
        {/* Display uploaded solution image */}
        {formData.solutionContent && (
          <Box sx={{ marginTop: 2 }}>
            <Typography variant="body1">Solution Image Preview:</Typography>
            <img
              src={formData.solutionContent}
              alt="Solution Preview"
              style={{ width: "100%", maxHeight: "300px", objectFit: "contain" }}
            />
          </Box>
        )}

        {/* Correct Option Dropdown */}
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

        <Button variant="contained" color="primary" type="submit" sx={{ marginTop: 2 }}>
          Submit Question
        </Button>
      </form>
    </Box>
  );
};

export default AdminPanel;
