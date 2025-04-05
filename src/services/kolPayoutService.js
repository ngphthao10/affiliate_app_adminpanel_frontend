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

    /**
     * Export KOL payout report
     */
    exportPayoutReport: async (params = {}) => {
        try {
            const response = await axios.get(`${backendUrl}/api/kol-payouts/export`, {
                params,
                headers: {
                    'token': localStorage.getItem('token')
                },
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Failed to export report' };
        }
    },

    /**
     * Update payout status
     */
    updatePayoutStatus: async (payoutId, data) => {
        try {
            const response = await axios.put(`${backendUrl}/api/kol-payouts/${payoutId}/status`, data, {
                headers: {
                    'token': localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Failed to update status' };
        }
    },

    /**
     * Get payout statistics
     */
    getPayoutStats: async (params = {}) => {
        try {
            const response = await axios.get(`${backendUrl}/api/kol-payouts/stats`, {
                params,
                headers: {
                    'token': localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Failed to get statistics' };
        }
    },

    /**
     * Get payout by ID
     */
    getPayoutById: async (payoutId) => {
        try {
            const response = await axios.get(`${backendUrl}/api/kol-payouts/${payoutId}`, {
                headers: {
                    'token': localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Failed to get payout details' };
        }
    },

    /**
     * Get payouts by KOL ID
     */
    getPayoutsByKolId: async (kolId, params = {}) => {
        try {
            const response = await axios.get(`${backendUrl}/api/kol-payouts/kol/${kolId}`, {
                params,
                headers: {
                    'token': localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Failed to get KOL payouts' };
        }
    },

    /**
     * Create new payout
     */
    createPayout: async (data) => {
        try {
            const response = await axios.post(`${backendUrl}/api/kol-payouts`, data, {
                headers: {
                    'token': localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Failed to create payout' };
        }
    }
};

export default kolPayoutService;