import axios from 'axios';
import { backendUrl } from '../App';

const kolPayoutService = {
    /**
     * Get paginated list of KOL payouts with filtering options
     */
    getPayouts: async (params = {}) => {
        try {
            const response = await axios.get(`${backendUrl}/api/kol-payouts/list`, {
                params,
                headers: {
                    'token': localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Failed to fetch payouts' };
        }
    },

    updatePayoutStatus: async (payoutId, data) => {
        try {
            const response = await axios.patch(`${backendUrl}/api/kol-payouts/${payoutId}/status`, data, {
                headers: { 'token': localStorage.getItem('token') }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating payout status:', error);
            return { success: false, message: error.response?.data?.message || error.message };
        }
    },
    getPayoutDetails: async (payoutId) => {
        try {
            const response = await axios.get(`${backendUrl}/api/kol-payouts/${payoutId}`, {
                headers: { 'token': localStorage.getItem('token') }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching payout details:', error);
            return { success: false, message: error.response?.data?.message || error.message };
        }
    },
    exportPayoutReport: async (params = {}) => {
        try {
            const response = await axios.get(`${backendUrl}/api/kol-payouts/export`, {
                headers: {
                    'token': localStorage.getItem('token'),
                    'Content-Type': 'application/json',
                },
                params,
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Error exporting payout report:', error);
            throw error;
        }
    },
    getInfluencers: async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/kol-payouts/influencers`, {
                headers: { 'token': localStorage.getItem('token') }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching influencers:', error);
            return { success: false, message: error.response?.data?.message || error.message };
        }
    },


    generatePayouts: async (data) => {
        try {
            const response = await axios.post(`${backendUrl}/api/kol-payouts/generate`, data, {
                headers: { 'token': localStorage.getItem('token') }
            });
            return response.data;
        } catch (error) {
            console.error('Error generating payouts:', error);
            return { success: false, message: error.response?.data?.message || error.message };
        }
    },
};

export default kolPayoutService;