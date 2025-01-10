const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config(); // Load environment variables from .env
const compression = require('compression'); // Import compression module

const app = express();

// Use compression to compress all API responses
app.use(compression()); // Compress responses with gzip/deflate

app.use(cors());
app.use(express.json({ limit: '500mb' }));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // 30 seconds
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Schema definition
const questionSchema = new mongoose.Schema({
  quesID: { type: String, unique: true },
  course: { type: String, required: [true, 'Course is required'] },
  subject: { type: String, required: [true, 'Subject is required'] },
  topic: { type: String, required: [true, 'Topic is required'] },
  chapter: { type: String, required: [true, 'Chapter is required'] },
  tags: String,
  questionContent: { type: String, required: [true, 'Question content is required'] },
  solutionContent: { type: String, required: [true, 'Solution content is required'] },
  correctOption: { type: String, required: [true, 'Correct option is required'] },
  questionType: { type: String, enum: ["MCQ", "Numerical"], default: "MCQ" },
  startingRange: {
    type: String,
    required: function () { return this.questionType === 'Numerical'; }
  },
  endingRange: {
    type: String,
    required: function () { return this.questionType === 'Numerical'; }
  }
});

const Question = mongoose.model('Question', questionSchema);

app.get('/', (req, res) => {
  res.send("Server running & reachable");
});

// Upload route
app.post('/upload', async (req, res) => {
  const { course, subject, topic, chapter, tags, questionContent, solutionContent, correctOption, questionType, startingRange, endingRange } = req.body;

  if (!course || !subject || !topic || !questionContent || !solutionContent || !correctOption) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

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
    questionType,
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

// Fetch all questions with pagination
app.get('/questions', async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  try {
    console.log('Fetching questions for page:', page, 'limit:', limit);

    const query = {}; // Add any filters if necessary

    const questions = await Question.find(query)
      .select('quesID course subject topic chapter questionContent solutionContent correctOption questionType startingRange endingRange') // Adjusted for your new fields
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))  // Skip for the page number
      .sort({ quesID: 1 }); // Sort by quesID

    const total = await Question.countDocuments(query); // Get total number of documents

    res.json({
      questions,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Error fetching questions' });
  }
});



// Update a question
app.put('/questions/:id', async (req, res) => {
  const { id } = req.params;  // This is the quesID
  const updatedData = req.body;

  // Assuming updatedData contains the updated content for the question and solution
  try {
    const updatedQuestion = await Question.findOneAndUpdate(
      { quesID: id },
      updatedData,  // This will update the questionContent, solutionContent, etc.
      { new: true }  // This ensures the response is the updated document
    );

    if (!updatedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ message: 'Error updating question' });
  }
});



// Delete a question
app.delete('/questions/:id', async (req, res) => {
  try {
    const { id } = req.params;  // This will be the UUID (quesID)
    
    // Use quesID to find and delete the question
    const deletedQuestion = await Question.findOneAndDelete({ quesID: id });

    if (!deletedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ message: 'Error deleting question' });
  }
});


// Suggestion endpoints
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

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start the server
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
