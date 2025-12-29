import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaFilePdf,
  FaFileWord,
  FaFileArchive,
  FaFileImage,
  FaFileAlt,
} from "react-icons/fa";

import axios from "axios";
import "./App.css";

function App() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  // const [message, setMessage] = useState("");

  // Get Backend URL from .env
  const API_URL = process.env.REACT_APP_API_URL;

  // 1. Fetch Files (GET)
  const fetchFiles = async () => {
    try {
      const response = await axios.get(`${API_URL}/files`);
      setFiles(response.data);
    } catch (error) {
      toast.error("Error fetching files:", error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // 2. Upload File (POST)
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.warning("Please select a file!");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await axios.post(`${API_URL}/upload`, formData);
      toast.success("Uploaded to S3 Successfully!");
      setSelectedFile(null);
      fetchFiles();
    } catch (error) {
      toast.error("Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (s3Key) => {
    if (window.confirm("Delete this file permanently?")) {
      try {
        await axios.delete(`${API_URL}/delete`, {
          data: { key: s3Key }, // This matches const { key } = req.body
        });

        toast.success("Deleted successfully!");
        fetchFiles(); // Refresh your gallery
      } catch (err) {
        console.error("Delete Error:", err);
        toast.error("Could not delete file.");
      }
    }
  };

  const handleOpen = (url) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      toast.error("File link is missing or expired.");
    }
  };

 // Clean name safely
const getCleanName = (fullName) => {
  if (!fullName) return "Unknown-file"; // fallback for undefined
  const fileName = fullName.split("/").pop();
  const dashIndex = fileName.indexOf("-");
  return dashIndex >= 0 ? fileName.substring(dashIndex + 1) : fileName;
};

// File preview safely
const getFilePreview = (file) => {
  const name = file.name || file.originalName || "unknown-file";
  const ext = name.split(".").pop().toLowerCase();

  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
    return <img src={file.viewUrl} alt="preview" />;
  }

  if (ext === "pdf") return <FaFilePdf size={120} color="red" />;
  if (ext === "doc" || ext === "docx") return <FaFileWord size={60} color="blue" />;
  if (ext === "zip" || ext === "rar") return <FaFileArchive size={60} color="orange" />;

  return <FaFileAlt size={90} color="gray" />;
};

  return (
    <div className="App">
      <header className="App-header">
        <h1>AWS S3 Cloud Gallery</h1>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
        />

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
          {files.map((file, index) => {
            // 1. Get the clean name using your function
            const cleanName = getCleanName(file.name || file.s3Key || file.key);

            return (
              <div key={index} className="file-card">
                <a
                  href={file.viewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="file-link"
                >
                  <div className="image-container">{getFilePreview(file)}</div>

                  {/* 2. Show the clean name under the preview */}
                  <p className="file-name" title={cleanName}>
                    {cleanName}
                  </p>
                </a>

                <div className="button-group">
                  {/* 3. Use cleanName here so the downloaded file has a nice name */}
                  <button
                    onClick={() => handleOpen(file.viewUrl)}
                    className="btn-open"
                  >
                    Open
                  </button>

                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(file.s3Key)} // Still uses file.name for AWS
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </header>
    </div>
  );
}

export default App;
