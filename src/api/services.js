import api from './axios';

export const getMsciCandidates = async () => {
    try {
        const response = await api.get('/analytics/screener/msci-candidates');
        return response.data;
    } catch (error) {
        console.warn("API Error (getMsciCandidates), returning empty array:", error);
        return { data: [] }; // match the expected response format containing .data
    }
}
