import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:10000';

export const getGvamaxInmuebles = async (page = 1) => {
    try {
        const response = await axios.get(`${API_URL}/api/gvamax/inmuebles`, {
            params: {
                page: page
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching GVAmax inmuebles:", error);
        throw error;
    }
};
