import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  IconButton,
  Chip,
  InputAdornment,
  Button,
  Stack,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import FilterListIcon from '@mui/icons-material/FilterList';
import { ExpenseAPI } from '../services/api';

const ExpenseHistory = () => {
  const [expenses, setExpenses] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('date');
  const [order, setOrder] = useState('desc'); // 'desc' = newest first, 'asc' = oldest first
  const [editDialog, setEditDialog] = useState(false);
  const [editExpense, setEditExpense] = useState(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const { data } = await ExpenseAPI.listExpenses();
        setExpenses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      }
    };

    fetchExpenses();
  }, []);

  const categories = useMemo(() => 
    Array.from(new Set(expenses.map((e) => e.category || 'Other'))), 
    [expenses]
  );

  const categoryEmojis = {
    'Food': '🍔',
    'Transport': '🚗',
    'Entertainment': '🎬',
    'Shopping': '🛍️',
    'Bills': '📄',
    'Healthcare': '🏥',
    'Education': '📚',
    'Other': '📦'
  };

  const categoryColors = {
    'Food': '#4caf50',
    'Transport': '#2196f3',
    'Entertainment': '#9c27b0',
    'Shopping': '#ff9800',
    'Bills': '#f44336',
    'Healthcare': '#e91e63',
    'Education': '#00bcd4',
    'Other': '#607d8b'
  };

  // Filter expenses
  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const q = query.toLowerCase();
      const matchesQuery = !q || `${e.description || ''} ${e.vendor || ''} ${e.category || ''}`.toLowerCase().includes(q);
      const matchesCat = !category || (e.category || 'Other') === category;
      return matchesQuery && matchesCat;
    });
  }, [expenses, query, category]);

  // Sort expenses by date
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.date || a.created_at || 0);
      const dateB = new Date(b.date || b.created_at || 0);
      
      if (order === 'asc') {
        return dateA - dateB; // Oldest to newest
      } else {
        return dateB - dateA; // Newest to oldest
      }
    });
  }, [filtered, order]);

  // Pagination
  const paginated = useMemo(() => {
    const start = page * rowsPerPage;
    return sorted.slice(start, start + rowsPerPage);
  }, [sorted, page, rowsPerPage]);

  const handleRequestSort = () => {
    setOrder(order === 'asc' ? 'desc' : 'asc');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await ExpenseAPI.deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id && e._id !== id));
    } catch (e) {
      alert('Failed to delete expense.');
    }
  };

  const handleEdit = (expense) => {
    setEditExpense({
      id: expense.id || expense._id,
      vendor: expense.vendor || '',
      date: expense.date || '',
      description: expense.description || '',
      amount: expense.amount || 0,
      category: expense.category || ''
    });
    setEditDialog(true);
  };

  const handleUpdateExpense = async () => {
    try {
      await ExpenseAPI.updateExpense(editExpense.id, editExpense);
      setExpenses((prev) => prev.map((e) => 
        (e.id === editExpense.id || e._id === editExpense.id) ? { ...e, ...editExpense } : e
      ));
      setEditDialog(false);
      setEditExpense(null);
    } catch (error) {
      alert('Failed to update expense.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const totalAmount = useMemo(() => 
    sorted.reduce((sum, e) => sum + (e.amount || 0), 0), 
    [sorted]
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <HistoryIcon sx={{ fontSize: 40, color: '#667eea' }} />
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Expense History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {sorted.length} expense{sorted.length !== 1 ? 's' : ''} • Total: Rs. {totalAmount.toFixed(2)}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Filters */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <FilterListIcon sx={{ color: '#667eea' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filters
          </Typography>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            placeholder="Search by vendor, description, or category..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'white',
                '&:hover fieldset': { borderColor: '#667eea' },
                '&.Mui-focused fieldset': { borderColor: '#667eea' },
              }
            }}
          />

          <FormControl 
            sx={{ 
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'white',
                '&:hover fieldset': { borderColor: '#667eea' },
                '&.Mui-focused fieldset': { borderColor: '#667eea' },
              }
            }}
          >
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c} value={c}>
                  {categoryEmojis[c] || '📦'} {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {(query || category) && (
            <Button
              variant="outlined"
              onClick={() => { setQuery(''); setCategory(''); }}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                borderColor: '#667eea',
                color: '#667eea',
                '&:hover': {
                  borderColor: '#764ba2',
                  backgroundColor: 'rgba(102, 126, 234, 0.1)'
                }
              }}
            >
              Clear Filters
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Table */}
      <Paper sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f7fa' }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  <TableSortLabel
                    active={true}
                    direction={order}
                    onClick={handleRequestSort}
                    sx={{
                      '&.Mui-active': { color: '#667eea' },
                      '& .MuiTableSortLabel-icon': { color: '#667eea !important' }
                    }}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Vendor</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }} align="right">Amount</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                      No expenses found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try adjusting your filters or add a new expense
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((expense, index) => (
                  <TableRow 
                    key={expense.id || expense._id || index}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'rgba(102, 126, 234, 0.05)',
                        transition: 'background-color 0.2s ease'
                      }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatDate(expense.date || expense.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {expense.vendor || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={expense.category || 'Other'}
                        size="small"
                        icon={<span>{categoryEmojis[expense.category] || '📦'}</span>}
                        sx={{
                          backgroundColor: categoryColors[expense.category] || '#607d8b',
                          color: 'white',
                          fontWeight: 600,
                          '& .MuiChip-icon': { color: 'white' }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {expense.description || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#f5576c' }}>
                        Rs. {(expense.amount || 0).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEdit(expense)}
                            sx={{ 
                              color: '#667eea',
                              '&:hover': { backgroundColor: 'rgba(102, 126, 234, 0.1)' }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDelete(expense.id || expense._id)}
                            sx={{ 
                              color: '#f44336',
                              '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={sorted.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            borderTop: '1px solid #e0e0e0',
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontWeight: 600
            }
          }}
        />
      </Paper>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialog} 
        onClose={() => setEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          fontWeight: 700,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          Edit Expense
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {editExpense && (
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Vendor"
                value={editExpense.vendor}
                onChange={(e) => setEditExpense({ ...editExpense, vendor: e.target.value })}
              />
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={editExpense.date}
                onChange={(e) => setEditExpense({ ...editExpense, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Description"
                value={editExpense.description}
                onChange={(e) => setEditExpense({ ...editExpense, description: e.target.value })}
                multiline
                rows={2}
              />
              <TextField
                fullWidth
                label="Amount (Rs.)"
                type="number"
                value={editExpense.amount}
                onChange={(e) => setEditExpense({ ...editExpense, amount: parseFloat(e.target.value) })}
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={editExpense.category}
                  label="Category"
                  onChange={(e) => setEditExpense({ ...editExpense, category: e.target.value })}
                >
                  <MenuItem value="Food">🍔 Food</MenuItem>
                  <MenuItem value="Transport">🚗 Transport</MenuItem>
                  <MenuItem value="Entertainment">🎬 Entertainment</MenuItem>
                  <MenuItem value="Shopping">🛍️ Shopping</MenuItem>
                  <MenuItem value="Bills">📄 Bills</MenuItem>
                  <MenuItem value="Healthcare">🏥 Healthcare</MenuItem>
                  <MenuItem value="Education">📚 Education</MenuItem>
                  <MenuItem value="Other">📦 Other</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditDialog(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateExpense} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ExpenseHistory;