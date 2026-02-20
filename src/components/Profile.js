import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { AuthAPI, BudgetAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Grid, Card, CardContent } from '@mui/material';

const Profile = () => {
  const { user, token } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [budgets, setBudgets] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    const init = async () => {
      try {
        // Load profile from backend (authoritative)
        const { data } = await AuthAPI.getProfile();
        if (data?.user) {
          setName(data.user.name || '');
          setEmail(data.user.email || '');
        } else if (user) {
          setName(user.name || '');
          setEmail(user.email || '');
        }
      } catch {
        // fallback to context
        if (user) {
          setName(user.name || '');
          setEmail(user.email || '');
        }
      }
      // Load budgets for current month
      try {
        const res = await BudgetAPI.getBudgets(currentMonth);
        setBudgets(res.data || []);
      } catch {}
    };
    if (token) init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, currentMonth]);

  const handleUpdate = async () => {
    try {
      await AuthAPI.updateProfile({ name });
      setMessage('Profile updated');
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      setMessage('Failed to update');
    }
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>Profile</Typography>

      <Box maxWidth={600}>
        <TextField fullWidth label="Name" value={name} onChange={(e) => setName(e.target.value)} margin="normal" />
        <TextField fullWidth label="Email" value={email} disabled margin="normal" />
        <Button variant="contained" sx={{ mt: 2 }} onClick={handleUpdate}>Save</Button>
        {message && <Typography sx={{ mt: 2 }}>{message}</Typography>}
      </Box>

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>Budgets for {currentMonth}</Typography>
        <TextField type="month" size="small" value={currentMonth} onChange={(e)=>setCurrentMonth(e.target.value)} sx={{ mb:2 }} />
        {budgets.length === 0 ? (
          <Typography variant="body2">No budgets found.</Typography>
        ) : (
          <Grid container spacing={2}>
            {budgets.map((b) => (
              <Grid item xs={12} sm={6} md={4} key={b.id}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">{b.month}</Typography>
                    <Typography variant="h6">{b.category}</Typography>
                    <Typography variant="body1">Rs. {b.monthly_limit.toFixed(2)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default Profile;
