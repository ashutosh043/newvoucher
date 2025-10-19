import { useState, useRef } from 'react';
import Swal from 'sweetalert2';
import api from '../utils/api'; // ✅ use central API instance

export default function CSVUploadPage() {
  const fileInputRef = useRef(null);
  const [wifiType, setWifiType] = useState(null);
  const [csvFile, setCsvFile] = useState(null);

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleUpload = async () => {
    if (!wifiType) {
      return Swal.fire({
        icon: 'warning',
        title: 'WiFi Type Missing',
        text: 'Please select WiFi Type',
      });
    }

    if (!csvFile) {
      return Swal.fire({
        icon: 'info',
        title: 'No File Selected',
        text: 'Please select a CSV file to upload.',
      });
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvData = e.target.result;

      try {
        console.log('Selected File Type:', csvFile.type);
        const res = await api.post('/voucher/upload', { csvData, wifiType }); // ✅ using api.js

        if (res.status === 200 && res.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Upload Successful',
            text: res.data.message || 'CSV Uploaded Successfully',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: res.data.message || 'Failed to upload CSV',
          });
        }
      } catch (err) {
        console.error('Upload Error:', err);
        Swal.fire({
          icon: 'error',
          title: 'Upload Error',
          text: err.response?.data?.message || 'Error uploading CSV',
        });
      }
    };

    reader.readAsText(csvFile);
  };

  return (
    <div className="main">
      <div className="card">
        <h2 className="heading">Upload Voucher CSV</h2>

        <div className="button-group">
          <button onClick={() => setWifiType('student')} style={{ margin: '10px' }}>
            Student WiFi
          </button>
          <button onClick={() => setWifiType('faculty')} style={{ margin: '10px' }}>
            Faculty WiFi
          </button>
        </div>

        <p className="intro">Selected WiFi Type: {wifiType || 'None'}</p>

        <input
          type="file"
          accept=".csv"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <button
          onClick={triggerFileInput}
          style={{
            padding: '12px 20px',
            borderRadius: '8px',
            backgroundColor: '#4CAF50',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Choose CSV File
        </button>

        {csvFile && (
          <p style={{ marginTop: '10px', fontStyle: 'italic' }}>
            Selected: {csvFile.name}
          </p>
        )}

        <br /><br />
        <button onClick={handleUpload}>Upload CSV</button>
      </div>
    </div>
  );
}