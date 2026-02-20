import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Box,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { BudgetAPI } from '../services/api';

const CATEGORIES = [
  'All',
  'Food',
  'Transport',
  'Entertainment',
  'Shopping',
  'Bills',
  'Healthcare',
  'Education',
  'Other',
];

const BudgetSettings = () => {
  const [budgets, setBudgets] = useState([]);
  const [newCategory, setNewCategory] = useState('All');
  const [newLimit, setNewLimit] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    loadBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth]);

  const loadBudgets = async () => {
    try {
      const { data } = await BudgetAPI.getBudgets(currentMonth);
      setBudgets(data);
    } catch (err) {
      setError('Failed to load budgets');
    }
  };

  const handleAddBudget = async () => {
    if (!newCategory || !newLimit) {
      setError('Please select category and enter limit');
      return;
    }

    try {
      await BudgetAPI.setBudget(newCategory, parseFloat(newLimit), currentMonth);
      setMessage(`Budget saved successfully for ${newCategory}: ${newLimit}`);
      setSnackbarOpen(true);
      // reset inputs
      setNewCategory('All');
      setNewLimit('');
      loadBudgets();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to set budget');
    }
  };

  const handleDeleteBudget = async (id) => {
    try {
      await BudgetAPI.deleteBudget(id);
      setMessage('Budget deleted');
      loadBudgets();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to delete budget');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          gutterBottom 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Monthly Budget Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Set spending limits and track your budget goals
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Paper 
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          💰 Set Budget for {currentMonth}
        </Typography>
        
        <TextField
          type="month"
          value={currentMonth}
          onChange={(e) => setCurrentMonth(e.target.value)}
          sx={{ 
            mb: 3, 
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'white'
            }
          }}
          size="small"
        />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={5}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={newCategory}
                label="Category"
                onChange={(e) => setNewCategory(e.target.value)}
                sx={{
                  borderRadius: 2,
                  backgroundColor: 'white',
                  '&:hover fieldset': { borderColor: '#667eea' },
                  '&.Mui-focused fieldset': { borderColor: '#667eea' },
                }}
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat === 'All' && '🎯 '}
                    {cat === 'Food' && '🍔 '}
                    {cat === 'Transport' && '🚗 '}
                    {cat === 'Entertainment' && '🎬 '}
                    {cat === 'Shopping' && '🛍️ '}
                    {cat === 'Bills' && '📄 '}
                    {cat === 'Healthcare' && '🏥 '}
                    {cat === 'Education' && '📚 '}
                    {cat === 'Other' && '📦 '}
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              type="number"
              label="Monthly Limit (Rs.)"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              placeholder="e.g., 5000"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                  '&:hover fieldset': { borderColor: '#667eea' },
                  '&.Mui-focused fieldset': { borderColor: '#667eea' },
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddBudget}
              sx={{ 
                height: '56px',
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                }
              }}
            >
              Add
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        📊 Current Budgets
      </Typography>

      {budgets.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          No budgets set for this month. Add one above!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {budgets.map((budget) => (
            <Grid item xs={12} sm={6} md={4} key={budget.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                    >
                      {budget.category === 'All' && '🎯 '}
                      {budget.category === 'Food' && '🍔 '}
                      {budget.category === 'Transport' && '🚗 '}
                      {budget.category === 'Entertainment' && '🎬 '}
                      {budget.category === 'Shopping' && '🛍️ '}
                      {budget.category === 'Bills' && '📄 '}
                      {budget.category === 'Healthcare' && '🏥 '}
                      {budget.category === 'Education' && '📚 '}
                      {budget.category === 'Other' && '📦 '}
                      {budget.category}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteBudget(budget.id)}
                      sx={{
                        color: '#f5576c',
                        '&:hover': {
                          backgroundColor: 'rgba(245, 87, 108, 0.1)',
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#424242', mb: 1 }}>
                    Rs. {budget.monthly_limit.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    📅 Month: {budget.month}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2500}
        onClose={() => setSnackbarOpen(false)}
        message={message || 'Budget saved successfully'}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
};

export default BudgetSettings;
