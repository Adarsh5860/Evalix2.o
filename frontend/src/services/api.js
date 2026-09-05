import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL
});

export const analyzePaper = async (formData) => {
    try {
        const response = await api.post('/papers/analyze', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error calling API:', error);
        throw error;
    }
};

export default api;