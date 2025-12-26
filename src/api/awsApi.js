import axios from 'axios';

const API_URL = "http://localhost:5000/api"; // Your Node.js URL

export const uploadFile = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API_URL}/upload`, formData);
};

export const getFiles = () => axios.get(`${API_URL}/files`);

export const deleteFile = (key) => axios.delete(`${API_URL}/delete`, { data: { key } });