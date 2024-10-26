import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Button, Grid, Card, CardContent } from '@mui/material';

const QuizPage = ({ subject }) => {
  const [quizData, setQuizData] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);  // Store the index of the selected option
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showSolution, setShowSolution] = useState(false);  // Track if solution is being shown
  const [isCorrect, setIsCorrect] = useState(null);  // Track if the selected option was correct
  const [submitted, setSubmitted] = useState(false);  // Track if the answer has been submitted

  // Fetch quiz data on component mount
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await axios.get(`https://peninhand-quizz.onrender.com/quiz/${subject}`);
        setQuizData(response.data);
      } catch (error) {
        console.error('Error fetching quiz data:', error);
      }
    };

    fetchQuizData();
  }, [subject]);

  // Handle option selection by index
  const handleOptionSelect = (index) => {
    setSelectedOptionIndex(index);
    setIsCorrect(null);  // Reset correctness feedback when selecting a new option
    setShowSolution(false);  // Hide solution when selecting a new option
    setSubmitted(false);  // Reset submitted status
  };

  // Handle submitting the selected answer
  const handleSubmitAnswer = () => {
    if (selectedOptionIndex !== null) {
      const correctOption = quizData[currentQuestionIndex].correctOption;  // This is 1-based
      const correctOptionIndex = correctOption - 1;  // Convert to 0-based index

      // Check if the selected option matches the correct option
      const isCorrectAnswer = correctOptionIndex === selectedOptionIndex;
      setIsCorrect(isCorrectAnswer);

      if (isCorrectAnswer) {
        setScore(score + 1);  // Increment score if correct
      }
      
      setSubmitted(true);  // Mark as submitted, but allow changes
    } else {
      alert('Please select an option');
    }
  };

  // Handle displaying the solution image
  const handleShowSolution = () => {
    setShowSolution(true);  // Display the solution image
  };

  // Handle moving to the next question
  const handleNextQuestion = () => {
    setShowSolution(false);  // Hide solution before moving to next question
    setIsCorrect(null);  // Reset correctness feedback
    setSelectedOptionIndex(null);  // Reset selected option
    setSubmitted(false);  // Reset submitted status
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);  // End of quiz
    }
  };

  // Handle displaying options (text or images)
  const renderOptions = (options) => {
    return options.map((option, index) => (
      <Grid item xs={12} sm={6} key={index}>
        <Button
          variant={selectedOptionIndex === index ? 'contained' : 'outlined'}  // Highlight selected option
          fullWidth
          onClick={() => handleOptionSelect(index)}  // Pass the index of the option
          disabled={submitted}  // Disable changing options only after submission
        >
          {/* Display text or image based on the option type */}
          {option.text ? option.text : <img src={option.image} alt={`Option ${index + 1}`} width="100%" />}
        </Button>
      </Grid>
    ));
  };

  if (quizData.length === 0) {
    return <Typography variant="h6" align="center">Loading quiz...</Typography>;
  }

  if (showResults) {
    return (
      <Box textAlign="center">
        <Typography variant="h4">Quiz Completed!</Typography>
        <Typography variant="h6">Your score: {score} / {quizData.length}</Typography>
        <Button variant="contained" color="primary" onClick={() => window.location.reload()}>
          Restart Quiz
        </Button>
      </Box>
    );
  }

  const { questionContent, options, solutionContent } = quizData[currentQuestionIndex];

  return (
    <Box sx={{ padding: '2rem' }}>
      <Card sx={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom align="center">
            Question {currentQuestionIndex + 1} / {quizData.length}
          </Typography>

          {/* Display question content */}
          {questionContent && (
            typeof questionContent === 'string' && questionContent.startsWith('data:image') ? (
              <img src={questionContent} alt="Question" width="100%" />
            ) : (
              <Typography variant="h6">{questionContent}</Typography>
            )
          )}

          <Grid container spacing={2} sx={{ marginTop: '1rem' }}>
            {renderOptions(options)}
          </Grid>

          {/* Submit button for submitting the selected answer */}
          {selectedOptionIndex !== null && !submitted && (
            <Box textAlign="center" sx={{ marginTop: '2rem' }}>
              <Button variant="contained" color="primary" onClick={handleSubmitAnswer}>
                Submit Answer
              </Button>
            </Box>
          )}

          {/* Feedback on whether the selected option was correct */}
          {submitted && isCorrect !== null && (
            <Typography variant="h6" align="center" sx={{ marginTop: '1rem', color: isCorrect ? 'green' : 'red' }}>
              {isCorrect ? 'Correct!' : 'Incorrect!'}
            </Typography>
          )}

          {/* Show both "Show Solution" and "Next Question" after submission */}
          {submitted && (
            <Box textAlign="center" sx={{ marginTop: '1.5rem' }}>
              <Button variant="contained" color="secondary" onClick={handleShowSolution} sx={{ marginRight: '1rem' }}>
                Show Solution
              </Button>
              <Button variant="contained" color="primary" onClick={handleNextQuestion}>
                Next Question
              </Button>
            </Box>
          )}

          {/* Display solution content if available */}
          {showSolution && solutionContent && (
            typeof solutionContent === 'string' && solutionContent.startsWith('data:image') ? (
              <Box sx={{ marginTop: '1.5rem' }}>
                <Typography variant="h6" align="center">Solution:</Typography>
                <img src={solutionContent} alt="Solution" width="100%" />
              </Box>
            ) : (
              <Typography variant="h6" align="center" sx={{ marginTop: '1.5rem' }}>{solutionContent}</Typography>
            )
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default QuizPage;
