import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Dialog, DialogActions, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const QuestionTable = () => {
  const [questions, setQuestions] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imageModalSrc, setImageModalSrc] = useState('');
  const [openImageModal, setOpenImageModal] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`http://193.203.163.4:5000/questions?page=${currentPage}&limit=50`);
      const total = data.total || 0;
      setQuestions(data.questions || []);
      setTotalPages(Math.ceil(total / 50));
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchQuestions();
  }, [currentPage, fetchQuestions]);

  const handleViewImage = (src) => {
    setImageModalSrc(src);
    setOpenImageModal(true); // Open the modal
  };

  const handleImageModalClose = () => {
    setOpenImageModal(false); // Close the modal
  };

  const handleEdit = (questionId) => {
    console.log('Edit question with ID:', questionId);
  };

  const handleDelete = async (questionId) => {
    try {
      await axios.delete(`http://193.203.163.4/:5000/questions/${questionId}`);
      fetchQuestions(); // Refresh the table after deletion
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const columns = useMemo(() => [
    { field: 'quesID', headerName: 'QID', width: 150 },
    { field: 'course', headerName: 'Course', width: 150 },
    { field: 'subject', headerName: 'Subject', width: 150 },
    { field: 'chapter', headerName: 'Chapter', width: 150 },
    { field: 'topic', headerName: 'Topic', width: 150 },
    {
      field: 'questionContent',
      headerName: 'Question',
      width: 300,
      renderCell: (params) => (
        <div>
          {params.value && params.value.startsWith('data:image') ? (
            <>
              <Button onClick={() => handleViewImage(params.value)}>
                View Image
              </Button>
            </>
          ) : (
            <p>{params.value}</p>
          )}
        </div>
      )
    },
    {
      field: 'solutionContent',
      headerName: 'Solution',
      width: 300,
      renderCell: (params) => (
        <div>
          {params.value && params.value.startsWith('data:image') ? (
            <>
              <Button onClick={() => handleViewImage(params.value)}>
                View Image
              </Button>
            </>
          ) : (
            <p>{params.value}</p>
          )}
        </div>
      )
    },
    { field: 'correctOption', headerName: 'Correct Option', width: 150 },
    { field: 'startingRange', headerName: 'Starting Range', width: 150 },
    { field: 'endingRange', headerName: 'Ending Range', width: 150 },
    {
      field: 'actions',
      headerName: 'Edit',
      width: 150,
      renderCell: (params) => (
        <div>
          <Button onClick={() => handleEdit(params.id)}>Edit</Button>
          <Button onClick={() => handleDelete(params.id)}>Delete</Button>
        </div>
      )
    }
  ], []);

  return (
    <div style={{ height: 600, width: '100%' }}>
      <h1>Questions</h1>
      {loading ? <p>Loading...</p> : (
        <>
          <DataGrid
            rows={questions}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            pagination
            paginationMode="server"
            rowCount={totalPages * 50} // Total rows count, used for pagination
            getRowId={(row) => row.quesID || row._id}
            onPageChange={(newPage) => setCurrentPage(newPage + 1)}
          />
          <div>
            <Button disabled={currentPage <= 1} onClick={() => setCurrentPage(currentPage - 1)}>Previous</Button>
            <span> Page {currentPage} of {totalPages} </span>
            <Button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</Button>
          </div>
        </>
      )}

      {/* Modal for viewing the enlarged image */}
      <Dialog open={openImageModal} onClose={handleImageModalClose} maxWidth="md" fullWidth>
        <DialogContent>
          <div style={{ position: 'relative' }}>
            <IconButton
              style={{ position: 'absolute', top: 10, right: 10 }}
              onClick={handleImageModalClose}
            >
              <CloseIcon />
            </IconButton>
            <img src={imageModalSrc} alt="Enlarged" style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }} />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleImageModalClose} color="primary">Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default React.memo(QuestionTable);
