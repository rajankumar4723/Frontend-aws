import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Get Backend URL from .env
  const API_URL = process.env.REACT_APP_API_URL;

  // 1. Fetch Files (GET)
  const fetchFiles = async () => {
    try {
      const response = await axios.get(`${API_URL}/files`);
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // 2. Upload File (POST)
  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select a file!");

    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await axios.post(`${API_URL}/upload`, formData);
      alert("Uploaded to S3!");
      setSelectedFile(null);
      fetchFiles(); // Refresh the list
    } catch (error) {
      alert("Upload failed!");
    } finally {
      setUploading(false);
    }
  };
  const handleDelete = async (fileKey) => {
    if (window.confirm("Delete this file permanently?")) {
      try {
        await axios.delete(`${API_URL}/delete`, {
          data: { key: fileKey }, // This matches const { key } = req.body
        });

        alert("Deleted successfully!");
        fetchFiles(); // Refresh your gallery
      } catch (err) {
        console.error("Delete Error:", err);
        alert("Could not delete file.");
      }
    }
  };
  // const handleDownload = async (url, fileName) => {
  //   try {
  //     const response = await fetch(url);
  //     const blob = await response.blob();
  //     const blobUrl = window.URL.createObjectURL(blob);

  //     const link = document.createElement('a');
  //     link.href = blobUrl;
  //     link.download = fileName || 'download';
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   } catch (err) {
  //     console.error("Download failed", err);
  //   }
  // };
  const handleDownload = async (url, fileName) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      // Remove the 'uploads/' prefix from the filename for a cleaner look
      link.download = fileName.replace("uploads/", "") || "file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl); // Clean up memory
    } catch (err) {
      alert("Download failed. The link may have expired.");
    }
  };
  const getCleanName = (fullName) => {
    // 1. Removes the folder path (e.g., "uploads/")
    const fileName = fullName.split("/").pop();

    // 2. Removes the ID/Timestamp (e.g., "3432423-")
    // It finds the first dash and takes everything after it
    return fileName.substring(fileName.indexOf("-") + 1);
  };
  return (
    <div className="App">
      <header className="App-header">
        <h1>AWS S3 Cloud Gallery</h1>

        <div className="upload-section">
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
          />
          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload to AWS"}
          </button>
        </div>

        <div className="gallery">
          {files.map((file, index) => (
            <div key={index} className="file-card">
             <a href={file.viewUrl} target="_blank" rel="noopener noreferrer" className="file-link">
          <div className="image-container">
             <img src={file.viewUrl} alt="PDF" />
          </div>
          {/* <p className="file-name">{cleanName}</p> */}
        </a>
              <div className="button-group">
                <button onClick={() => handleDownload(file.viewUrl, file.name)}>
                  Download
                </button>

                <button
                  onClick={() => handleDelete(file.name)}
                  style={{ backgroundColor: "red", color: "white" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;
