import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

export const listMenu = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/menu`);
        return response.data;
    } catch (error) {
        console.error('Error fetching menu list:', error);
        throw error;
    }
};



