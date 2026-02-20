import React, { useState, useEffect } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  LinearProgress,
  Typography,
  Chip,
  Paper,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { BudgetAPI } from '../services/api';

const BudgetAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const { data } = await BudgetAPI.getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load budget alerts', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (alerts.length === 0) return null;

  const exceededAlerts = alerts.filter((a) => a.status === 'exceeded');
  const warningAlerts = alerts.filter((a) => a.status === 'warning');

  return (
    <Box sx={{ mb: 3 }}>
      {exceededAlerts.map((alert) => (
        <Alert
          key={alert.budget.id}
          severity="error"
          icon={<ErrorIcon />}
          sx={{ mb: 1 }}
        >
          <AlertTitle>Budget Exceeded: {alert.budget.category}</AlertTitle>
          You've spent <strong>Rs. {alert.spent.toFixed(2)}</strong> out of Rs. {alert.budget.monthly_limit.toFixed(2)} 
          ({alert.percentage}%)
          <LinearProgress
            variant="determinate"
            value={Math.min(alert.percentage, 100)}
            color="error"
            sx={{ mt: 1 }}
          />
        </Alert>
      ))}

      {warningAlerts.map((alert) => (
        <Alert
          key={alert.budget.id}
          severity="warning"
          icon={<WarningIcon />}
          sx={{ mb: 1 }}
        >
          <AlertTitle>Approaching Limit: {alert.budget.category}</AlertTitle>
          You've spent <strong>Rs. {alert.spent.toFixed(2)}</strong> out of Rs. {alert.budget.monthly_limit.toFixed(2)} 
          ({alert.percentage}%)
          <LinearProgress
            variant="determinate"
            value={alert.percentage}
            color="warning"
            sx={{ mt: 1 }}
          />
        </Alert>
      ))}

      {alerts.some((a) => a.status === 'ok') && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            <CheckCircleIcon sx={{ verticalAlign: 'middle', mr: 1, color: 'success.main' }} />
            Budgets on Track
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {alerts
              .filter((a) => a.status === 'ok')
              .map((alert) => (
                <Chip
                  key={alert.budget.id}
                  label={`${alert.budget.category}: ${alert.percentage}%`}
                  color="success"
                  size="small"
                />
              ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default BudgetAlerts;
