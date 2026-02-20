import React, { useState } from 'react';
import { 
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Card,
  CardMedia,
  Snackbar,
  CircularProgress,
  Chip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { ExpenseAPI } from '../services/api';

const AddExpense = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [vendor, setVendor] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [confidence, setConfidence] = useState(null);
  const [receiptType, setReceiptType] = useState('');
  const [message, setMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const f = event.target.files[0];
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const extractFromText = async (text, fields) => {
    // naive extraction helpers
    const lines = text.split(/\n|\r/).map((l) => l.trim()).filter(Boolean);
    
    // Use backend-extracted fields first
    if (!vendor && fields?.vendor) setVendor(fields.vendor);
    if (!date && fields?.date) setDate(fields.date);
    
    // Store receipt_type for smarter categorization
    let detectedReceiptType = '';
    if (fields?.receipt_type) {
      detectedReceiptType = fields.receipt_type.type || '';
      setReceiptType(detectedReceiptType);
    }
    
    // Fallback extraction
    if (!description && lines[0]) setDescription(lines[0]);
    if (!vendor && lines[0]) setVendor(lines[0].split(/\s{2,}|-/)[0]);
    
    // Prefer backend-parsed total if available
    const totalField = fields?.total;
    if (!amount && totalField?.amount) {
      setAmount(String(totalField.amount));
    } else {
      // fallback regex (improved) - try to find 'total' line last
      const lowerLines = lines.map((l) => l.toLowerCase());
      const neg = /subtotal|total\s*(items|qty|quantity|points|savings)/i;
      const pos = /(grand\s+total|amount\s+due|balance\s+due|total\s+due|cash\s+total|\btotal\b)/i;
      let candidateAmount = null;
      for (let i = lowerLines.length - 1; i >= 0; i--) {
        const l = lowerLines[i];
        if (neg.test(l)) continue;
        if (pos.test(l)) {
          const match = lines[i].match(/([0-9]{1,3}(?:[ ,][0-9]{3})*(?:[.,][0-9]{2})|[0-9]+(?:[.,][0-9]{2}))/);
          if (match) { candidateAmount = match[1]; break; }
        }
      }
      if (!candidateAmount) {
        const m2 = text.match(/([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})|[0-9]+\.[0-9]{2})/);
        if (m2) candidateAmount = m2[1];
      }
      if (!amount && candidateAmount) setAmount(candidateAmount.replace(/,/g, ''));
    }
    const dateMatch = text.match(/(\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})/);
    if (!date && dateMatch) setDate(dateMatch[1]);
    
    // Smart categorization: Pass receipt_type and vendor for better accuracy
    try {
      const categorizationPayload = {
        text: text,
        receipt_type: detectedReceiptType,
        vendor: fields?.vendor || lines[0]?.split(/\s{2,}|-/)[0] || ''
      };
      const { data } = await ExpenseAPI.categorize(categorizationPayload);
      if (data?.category) setCategory(data.category);
      if (data?.confidence) setConfidence(Math.round(data.confidence * 100));
    } catch (e) {
      // ignore categorize failure
    }
  };

  const handleExtract = async () => {
    if (!file) {
      setMessage('Please choose a receipt image first.');
      return;
    }
    setLoading(true);
    setMessage('Extracting details...');
    try {
      const { data } = await ExpenseAPI.uploadReceipt(file);
      const text = data?.text || data?.extracted_text || '';
      const fields = data?.fields || {};
      
      // Set receipt type if detected
      if (fields?.receipt_type) {
        setReceiptType(fields.receipt_type.type || '');
      }
      
      if (text) await extractFromText(text, fields);
      setMessage('Details extracted. Review and save.');
    } catch (e) {
      setMessage('Failed to extract details. You can enter them manually.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExpense = async () => {
    try {
      await ExpenseAPI.addExpense({ vendor, date, description, amount: Number(amount), category });
      setMessage('Expense saved successfully!');
      setSnackbarOpen(true);
      // reset fields
      setVendor('');
      setDate('');
      setDescription('');
      setAmount('');
      setCategory('');
      setConfidence(null);
      setReceiptType('');
      setFile(null);
      setPreview('');
    } catch (error) {
      setMessage('Failed to save expense.');
      setSnackbarOpen(true);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Add New Expense
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Upload a receipt or manually enter expense details
        </Typography>
      </Box>

      {/* Receipt Upload Section */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          📸 Upload Receipt
        </Typography>
        
        <Button
          component="label"
          variant="contained"
          startIcon={<CloudUploadIcon />}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
            }
          }}
        >
          Choose Receipt Image
          <input type="file" accept="image/*" hidden onChange={handleFileChange} />
        </Button>

        {preview && (
          <Card sx={{ mt: 3, borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <CardMedia
              component="img"
              image={preview}
              alt="Receipt preview"
              sx={{ maxHeight: 400, objectFit: 'contain', backgroundColor: '#f5f5f5' }}
            />
          </Card>
        )}

        {file && (
          <Button
            onClick={handleExtract}
            disabled={loading}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoFixHighIcon />}
            sx={{
              mt: 2,
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
              }
            }}
          >
            {loading ? 'Extracting...' : 'Extract Details with AI'}
          </Button>
        )}

        {receiptType && (
          <Chip
           label={`${receiptType.charAt(0).toUpperCase() + receiptType.slice(1)} Receipt 📄`}

            color="success"
            sx={{ mt: 2, fontWeight: 600 }}
          />
        )}
        
        {confidence != null && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#e8f5e9', borderRadius: 2 }}>
            <Typography variant="body2" color="success.dark">
              🤖 AI suggested category: <strong>{category || '—'}</strong> (confidence: {confidence}%)
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Expense Details Form */}
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          💰 Expense Details
        </Typography>

        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            label="Vendor/Merchant"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': { borderColor: '#667eea' },
                '&.Mui-focused fieldset': { borderColor: '#667eea' },
              }
            }}
          />

          <TextField
            fullWidth
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': { borderColor: '#667eea' },
                '&.Mui-focused fieldset': { borderColor: '#667eea' },
              }
            }}
          />

          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            variant="outlined"
            multiline
            rows={2}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': { borderColor: '#667eea' },
                '&.Mui-focused fieldset': { borderColor: '#667eea' },
              }
            }}
          />

          <TextField
            fullWidth
            label="Amount (Rs.)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': { borderColor: '#667eea' },
                '&.Mui-focused fieldset': { borderColor: '#667eea' },
              }
            }}
          />

          <FormControl 
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
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
              <MenuItem value="">Select a category</MenuItem>
              <MenuItem value="Food">🍔 Food</MenuItem>
              <MenuItem value="Transport">🚗 Transport</MenuItem>
              <MenuItem value="Entertainment">🎬 Entertainment</MenuItem>
              <MenuItem value="Shopping">🛍 Shopping</MenuItem>
              <MenuItem value="Bills">📄 Bills</MenuItem>
              <MenuItem value="Healthcare">🏥 Healthcare</MenuItem>
              <MenuItem value="Education">📚 Education</MenuItem>
              <MenuItem value="Other">📦 Other</MenuItem>
            </Select>
          </FormControl>

          <Button
            onClick={handleSaveExpense}
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            sx={{
              mt: 2,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '1.1rem',
              textTransform: 'none',
              boxShadow: '0 4px 15px rgba(245, 87, 108, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                boxShadow: '0 6px 20px rgba(245, 87, 108, 0.6)',
              }
            }}
          >
            Save Expense
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2500}
        onClose={() => setSnackbarOpen(false)}
        message={message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
};

export default AddExpense;