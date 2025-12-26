import React, { useState } from 'react';
import { uploadFile } from '../api/awsApi';

const FileUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        if (!file) return alert("Select a file first!");
        setLoading(true);
        try {
            await uploadFile(file);
            alert("Uploaded Successfully!");
            onUploadSuccess(); // Refresh the gallery
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <div style={{ padding: '20px', border: '1px dashed #ccc' }}>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <button onClick={handleUpload} disabled={loading}>
                {loading ? "Uploading..." : "Upload to S3"}
            </button>
        </div>
    );
};

export default FileUpload;