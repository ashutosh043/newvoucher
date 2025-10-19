import React, { useState } from 'react';
import axios from 'axios';
import swal from 'sweetalert';

export default function CSVUploadForm({ wifiType }) {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      swal('Error', 'Please select a CSV file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvData = e.target.result;

      try {
        const response = await axios.post('http://localhost:5000/api/admin/upload', {
          csvData,
          wifiType
        });

        swal('Success', response.data.message, 'success');
      } catch (error) {
        console.error('Upload failed:', error);
        swal('Error', 'Upload failed', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload {wifiType} Vouchers</button>
    </div>
  );
}