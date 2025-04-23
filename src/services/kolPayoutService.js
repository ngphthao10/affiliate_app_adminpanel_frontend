// kolPayoutService.js
import axios from 'axios';
import { backendUrl } from '../App';

class KolPayoutService {
    /**
     * Get paginated payouts with optional filters
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>}
     */
    async getPayouts(params = {}) {
        try {
            const response = await axios.get(`${backendUrl}/api/kol-payouts/`, {
                params,
                headers: {
                    token: localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching payouts:', error);
            throw error.response?.data || error;
        }
    }

    /**
     * Get payout details by ID
     * @param {number} payoutId - The payout ID
     * @returns {Promise<Object>}
     */
    async getPayoutDetails(payoutId) {
        try {
            const response = await axios.get(`${backendUrl}/api/kol-payouts/${payoutId}`, {
                headers: {
                    token: localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching payout details:', error);
            throw error.response?.data || error;
        }
    }

    /**
     * Get eligible influencers for new payouts
     * @param {Object} params - Query parameters with start_date and end_date
     * @returns {Promise<Object>}
     */
    async getEligiblePayouts(params = {}) {
        try {
            const response = await axios.get(`${backendUrl}/api/kol-payouts/eligible`, {
                params,
                headers: {
                    token: localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching eligible payouts:', error);
            throw error.response?.data || error;
        }
    }

    /**
     * Generate new payouts
     * @param {Object} data - Payout data with start_date, end_date, and optional influencer_ids
     * @returns {Promise<Object>}
     */
    async generatePayouts(data) {
        try {
            const response = await axios.post(`${backendUrl}/api/kol-payouts/generate`, data, {
                headers: {
                    token: localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error generating payouts:', error);
            throw error.response?.data || error;
        }
    }

    /**
     * Update payout status
     * @param {number} payoutId - The payout ID
     * @param {Object} data - Update data with payment_status and optional notes
     * @returns {Promise<Object>}
     */
    async updatePayoutStatus(payoutId, data) {
        try {
            const response = await axios.put(`${backendUrl}/api/kol-payouts/${payoutId}/status`, data, {
                headers: {
                    token: localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating payout status:', error);
            throw error.response?.data || error;
        }
    }

    /**
     * Export payout report as Excel file
     * @param {Object} params - Query parameters
     * @returns {Promise<Blob>}
     */
    async exportPayoutReport(params = {}) {
        try {
            const response = await axios.get(`${backendUrl}/api/kol-payouts/export`, {
                params,
                headers: {
                    token: localStorage.getItem('token')
                },
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Error exporting payouts:', error);
            throw error.response?.data || error;
        }
    }
}

export default new KolPayoutService();