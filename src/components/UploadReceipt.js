import React, { useState } from 'react';
import { ExpenseAPI } from '../services/api';

const UploadReceipt = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [total, setTotal] = useState(null);
  const [preview, setPreview] = useState('');

  const handleFileChange = (event) => {
    const f = event.target.files[0];
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file first.');
      return;
    }

    try {
      const response = await ExpenseAPI.uploadReceipt(file);
      const text = response.data?.text || response.data?.extracted_text || '';
      const t = response.data?.fields?.total;
      if (t?.amount) setTotal(t.amount);
      setMessage(
        t?.amount
          ? `Detected total: ${t.amount} (via ${t.strategy || 'heuristic'})`
          : text
          ? `Extracted text length: ${text.length}`
          : 'Uploaded successfully.'
      );
    } catch (error) {
      setMessage('Error uploading file.');
    }
  };

  return (
    
    <div>
      <h2>Upload Receipt</h2>
      <input type="file" onChange={handleFileChange} />
      {preview && (
        <div style={{ margin: '10px 0' }}>
          <img src={preview} alt="preview" style={{ maxWidth: '100%', borderRadius: 8 }} />
        </div>
      )}
      <button onClick={handleUpload}>Upload</button>
      {message && <p>{message}</p>}
      {total != null && (
        <p>
          Total detected: <strong>{total}</strong>
        </p>
      )}
    </div>
  );
};

export default UploadReceipt;