const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json({ limit: '500mb' }));

// MongoDB connection and schema setup
mongoose.connect('mongodb://localhost:27017/quizApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

const questionSchema = new mongoose.Schema({
  quesID: { type: String, unique: true },  // Unique identifier for each question
  course: String,
  subject: String,
  topic: String,
  chapter: String,
  tags: String,
  questionContent: {
    type: String,
    required: true
  },
  solutionContent: {
    type: String,
    required: true
  },
  correctOption: String,  // Store correct option here
});

const Question = mongoose.model('Question', questionSchema);

// Route to upload a new quiz question
app.post('/upload', async (req, res) => {
  const { course, subject, topic, chapter, tags, questionContent, solutionContent, correctOption } = req.body;

  const newQuestion = new Question({
    quesID: uuidv4(),  // Generate a unique quesID for each question
    course,
    subject,
    topic,
    chapter,  
    tags,
    questionContent,  
    solutionContent,
    correctOption,  // Save the correct option field
  });

  try {
    const savedQuestion = await newQuestion.save();
    res.send({ message: 'Question uploaded successfully', data: savedQuestion });
  } catch (error) {
    console.error('Error saving question:', error);
    res.status(500).send({ message: 'Error uploading question' });
  }
});

// Route to fetch all questions for the data table
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

// Start the server
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
