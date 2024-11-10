const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();  // Load environment variables from .env

const app = express();
app.use(cors());
app.use(express.json({ limit: '500mb' }));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,  // 30 seconds
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Update questionSchema to include questionType with default "MCQ"
const questionSchema = new mongoose.Schema({
  quesID: { type: String, unique: true },
  course: {
    type: String,
    required: [true, 'Course is required'], // Make course required
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'], // Make subject required
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'], // Make topic required
  },
  chapter: {
    type: String,
    required: [true, 'Chapter is required'], // Make chapter required
  },
  tags: String,
  questionContent: {
    type: String,
    required: [true, 'Question content is required'], // Make questionContent required
  },
  solutionContent: {
    type: String,
    required: [true, 'Solution content is required'], // Make solutionContent required
  },
  correctOption: {
    type: String,
    required: [true, 'Correct option is required'], // Make correctOption required
  },
  questionType: {
    type: String,
    enum: ["MCQ", "Numerical"],
    default: "MCQ",
    required: [true, 'Question type is required'], // Make questionType required
  },
  startingRange: {
    type: String,
    required: function() { return this.questionType === 'Numerical'; } // Make startingRange required if questionType is Numerical
  },
  endingRange: {
    type: String,
    required: function() { return this.questionType === 'Numerical'; } // Make endingRange required if questionType is Numerical
  }
});


const Question = mongoose.model('Question', questionSchema);

app.get('/', (req, res) => {
  res.send("Server running & Reachable");
});

// Update the upload route to include questionType
app.post('/upload', async (req, res) => {
  const { course, subject, topic, chapter, tags, questionContent, solutionContent, correctOption, questionType, startingRange, endingRange } = req.body;

  const newQuestion = new Question({
    quesID: uuidv4(),
    course,
    subject,
    topic,
    chapter,
    tags,
    questionContent,
    solutionContent,
    correctOption,
    questionType,  // Include questionType in the new question data
    startingRange,
    endingRange
  });

  try {
    const savedQuestion = await newQuestion.save();
    res.send({ message: 'Question uploaded successfully', data: savedQuestion });
  } catch (error) {
    console.error('Error saving question:', error);
    res.status(500).send({ message: 'Error uploading question' });
  }
});

// Route to fetch all questions for the data table, including questionType
app.get('/questions', async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Error fetching questions' });
  }
});

// Route to update a question based on its ID
app.put('/questions/:id', async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const updatedQuestion = await Question.findByIdAndUpdate(id, updatedData, { new: true });
    if (!updatedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ message: 'Error updating question' });
  }
});

// Route to delete a question
app.delete('/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedQuestion = await Question.findByIdAndDelete(id);
    if (!deletedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ message: 'Error deleting question' });
  }
});

// server.js
app.get("/suggestions/subjects", async (req, res) => {
  try {
    const subjects = ["Physics", "Chemistry", "Mathematics", "Biology"]; // Static for PCMB
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching subjects" });
  }
});

app.get("/suggestions/chapters/:subject", async (req, res) => {
  const { subject } = req.params;
  try {
    const chapters = await Question.distinct("chapter", { subject });
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chapters" });
  }
});

app.get("/suggestions/topics/:chapter", async (req, res) => {
  const { chapter } = req.params;
  try {
    const topics = await Question.distinct("topic", { chapter });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: "Error fetching topics" });
  }
});

// Start the server
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
