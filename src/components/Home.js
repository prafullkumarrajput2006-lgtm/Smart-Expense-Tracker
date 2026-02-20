import React, { useEffect, useMemo, useState } from 'react';
import './Dashboard.css';
import { ExpenseAPI } from '../services/api';
import BudgetAlerts from './BudgetAlerts';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

import CategoryIcon from '@mui/icons-material/Category';
import SavingsIcon from '@mui/icons-material/Savings';

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

// Helper function for progress/budget colors
const getBudgetStatus = (percent) => {
  if (percent > 100) return { color: 'error', theme: 'over' };
  if (percent >= 80) return { color: 'error', theme: 'danger' };
  if (percent >= 50) return { color: 'warning', theme: 'warning' };
  return { color: 'success', theme: 'safe' };
};

// Helper function to get card styling
const getBudgetCardStyles = (statusTheme) => {
  const styles = {
    transition: '0.3s',
    color: 'white',
    '&:hover': {
      transform: 'translateY(-4px)',
    },
  };

  switch (statusTheme) {
    case 'over':
      return {
        ...styles,
        background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
        boxShadow: '0 8px 25px rgba(211,47,47,0.4)',
      };
    case 'danger':
      return {
        ...styles,
        background: 'linear-gradient(135deg, #ff5858 0%, #f09819 100%)',
        boxShadow: '0 8px 25px rgba(255,88,88,0.4)',
      };
    case 'warning':
      return {
        ...styles,
        background: 'linear-gradient(135deg, #ffb75e 0%, #ed8f03 100%)',
        boxShadow: '0 8px 25px rgba(255,183,94,0.4)',
      };
    case 'safe':
    default:
      return {
        ...styles,
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        boxShadow: '0 8px 25px rgba(79,172,254,0.4)',
      };
  }
};

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);

  const monthlyBudget =
    Number(localStorage.getItem('monthlyBudget')) || 10000; // default 10,000

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await ExpenseAPI.listExpenses();
        setExpenses(Array.isArray(data) ? data : []);
      } catch (e) {
        // fallback demo
        setExpenses([
          {
            date: '2025-10-06',
            category: 'Bills',
            amount: 200,
            description: 'Electricity',
          },
          {
            date: '2025-10-01',
            category: 'Food',
            amount: 120,
            description: 'Lunch',
          },
          {
            date: '2025-10-08',
            category: 'Entertainment',
            amount: 150,
            description: 'Movie',
          },
          {
            date: '2025-10-03',
            category: 'Transport',
            amount: 80,
            description: 'Taxi',
          },
        ]);
      }
    };
    fetch();
  }, []);

  const totals = useMemo(() => {
    const sum = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);

    const byCat = expenses.reduce((acc, e) => {
      const cat = e.category || 'Other';
      acc[cat] = (acc[cat] || 0) + Number(e.amount || 0);
      return acc;
    }, {});

    const topCat =
      Object.entries(byCat).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

    const remaining = monthlyBudget - sum;

    const percentSpent =
      monthlyBudget > 0 ? (sum / monthlyBudget) * 100 : sum > 0 ? 101 : 0; // Handle budget=0 case

    return { sum, byCat, topCat, remaining, percentSpent };
  }, [expenses, monthlyBudget]);

  const budgetStatus = getBudgetStatus(totals.percentSpent);

  const chartColors = [
    'rgba(255, 99, 132, 0.7)',
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)',
    'rgba(199, 199, 199, 0.7)',
  ];

  const chartBorderColors = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(199, 199, 199, 1)',
  ];

  const barData = {
    labels: Object.keys(totals.byCat),
    datasets: [
      {
        label: 'By Category',
        data: Object.values(totals.byCat),
        backgroundColor: chartColors,
        borderColor: chartBorderColors,
        borderWidth: 1,
      },
    ],
  };

  const pieData = barData;

  // 🔥 NEW: Sort expenses by date for the line chart
  const sortedExpenses = useMemo(() => {
    // Create a new array to avoid mutating state, and sort by date ascending
    return [...expenses].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [expenses]);

  // 🔥 MODIFIED: Use the new sortedExpenses array
  const lineData = {
    labels: sortedExpenses.map((e) => new Date(e.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Daily Spend',
        data: sortedExpenses.map((e) => Number(e.amount || 0)),
        borderColor: '#007BFF',
        fill: false,
        tension: 0.1,
      },
    ],
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 2, py: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 0.5,
          }}
        >
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Track your expenses and manage your budget effectively
        </Typography>
      </Box>

      {/* Budget Alerts */}
      <Box sx={{ mb: 2 }}>
        <BudgetAlerts />
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* TOTAL SPENT (with Progress Circle) */}
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              transition: '0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(102,126,234,0.4)',
              },
            }}
          >
            <CardContent sx={{ py: 2 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ opacity: 0.9, fontWeight: 500 }}
                  >
                    Total Spent
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Rs. {totals.sum.toFixed(2)}
                  </Typography>
                </Box>
                {/* Progress Circle Box */}
                <Box
                  sx={{
                    position: 'relative',
                    display: 'inline-flex',
                    mr: 1,
                  }}
                >
                  <CircularProgress
                    variant="determinate"
                    value={
                      totals.percentSpent > 100 ? 100 : totals.percentSpent
                    }
                    color={budgetStatus.color}
                    size={50}
                    thickness={4}
                    sx={{
                      color:
                        budgetStatus.color === 'success'
                          ? '#4caf50'
                          : budgetStatus.color === 'warning'
                          ? '#ff9800'
                          : '#d32f2f',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: '50%',
                    }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography
                      variant="caption"
                      component="div"
                      color="white"
                      sx={{ fontWeight: 600, fontSize: '0.8rem' }}
                    >
                      {`${Math.round(totals.percentSpent)}%`}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* TOP CATEGORY */}
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              transition: '0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(245,87,108,0.4)',
              },
            }}
          >
            <CardContent sx={{ py: 2 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ opacity: 0.9, fontWeight: 500 }}
                  >
                    Top Category
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {totals.topCat}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    p: 1.5,
                  }}
                >
                  <CategoryIcon sx={{ fontSize: 32 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* REMAINING BUDGET (with Warning Colors) */}
        <Grid item xs={12} sm={4}>
          <Card sx={getBudgetCardStyles(budgetStatus.theme)}>
            <CardContent sx={{ py: 2 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ opacity: 0.9, fontWeight: 500 }}
                  >
                    Remaining Budget
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Rs. {totals.remaining.toFixed(2)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: 'rgba(255,255,2foo,0.2)',
                    borderRadius: '50%',
                    p: 1.5,
                  }}
                >
                  <SavingsIcon sx={{ fontSize: 32 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={2}>
        {/* Pie */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              📊 Spending by Category
            </Typography>
            <Box sx={{ height: 220 }}>
              <Pie
                data={pieData}
                options={{
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'right' } },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Bar */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              📁 Category Breakdown
            </Typography>
            <Box sx={{ height: 220 }}>
              <Bar
                data={barData}
                options={{
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Line chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              📈 Spending Trend
            </Typography>
            <Box sx={{ height: 250 }}>
              <Line
                data={lineData}
                options={{ maintainAspectRatio: false }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Transactions Table */}
      <Grid item xs={12} sx={{ mt: 2 }}>
        <Paper sx={{ p: 2, borderRadius: 2, width: '100%' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            🧾 Recent Transactions
          </Typography>
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.length > 0 ? (
                  expenses
                    .sort((a, b) => new Date(b.date) - new Date(a.date)) // Show newest first
                    .map((row, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {new Date(row.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell>{row.description}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          Rs. {Number(row.amount || 0).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Container>
  );
};

export default Dashboard;