import axios from 'axios';
import { backendUrl } from '../App';

const kolService = {
    /**
     * Get paginated list of active KOLs with filtering options
     * @param {Object} options - Query parameters
     * @returns {Promise} Promise with KOL data
     */
    getKOLs: async (options = {}) => {
        try {
            const queryParams = new URLSearchParams();

            // Add all options as query parameters
            Object.entries(options).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });

            const response = await axios.get(`${backendUrl}/api/kols/list?${queryParams.toString()}`, {
                headers: {
                    'token': localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Get detailed information for a single KOL
     * @param {string|number} kolId - KOL ID
     * @returns {Promise} Promise with KOL details
     */
    getKOLDetails: async (kolId) => {
        try {
            const response = await axios.get(`${backendUrl}/api/kols/${kolId}`, {
                headers: {
                    'token': localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Update KOL status
     * @param {string|number} kolId - KOL ID
     * @param {Object} data - Status update data
     * @param {string} data.status - New status ('active', 'suspended', 'banned')
     * @param {string} [data.reason] - Required reason for suspend/ban actions
     * @returns {Promise} Promise with update status and updated KOL data
     */
    updateKOLStatus: async (kolId, data) => {
        try {
            const response = await axios.put(
                `${backendUrl}/api/kols/${kolId}/status`,
                data,
                {
                    headers: {
                        'token': localStorage.getItem('token')
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Get KOL tiers for filtering
     * @returns {Promise} Promise with tiers data
     */
    getTiers: async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/kols/tiers`, {
                headers: {
                    'token': localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Get all KOL applications (pending status)
     * @param {Object} options - Query parameters
     * @returns {Promise} Promise with applications data
     */
    getApplications: async (options = {}) => {
        try {
            const queryParams = new URLSearchParams();

            // Add all options as query parameters
            Object.entries(options).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });

            // Match the proper endpoint
            const response = await axios.get(`${backendUrl}/api/kols/list/applications?${queryParams.toString()}`, {
                headers: {
                    'token': localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Get details of a specific KOL application
     * @param {string|number} applicationId - Application ID
     * @returns {Promise} Promise with application details
     */
    getApplicationDetails: async (applicationId) => {
        try {
            const response = await axios.get(`${backendUrl}/api/kols/applications/${applicationId}`, {
                headers: {
                    'token': localStorage.getItem('token')
                }
            });
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Approve a pending KOL application
     * @param {string|number} applicationId - Application ID
     * @param {Object} [data] - Optional data like tier_id
     * @returns {Promise} Promise with approval status
     */
    approveApplication: async (applicationId, data = {}) => {
        try {
            const response = await axios.put(
                `${backendUrl}/api/kols/applications/${applicationId}/approve`,
                data,
                {
                    headers: {
                        'token': localStorage.getItem('token')
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    },

    /**
     * Reject a pending KOL application
     * @param {string|number} applicationId - Application ID
     * @param {Object} data - Rejection data
     * @param {string} data.reason - Required reason for rejection
     * @returns {Promise} Promise with rejection status
     */
    rejectApplication: async (applicationId, data) => {
        try {
            if (!data.reason) {
                throw new Error('Rejection reason is required');
            }

            const response = await axios.put(
                `${backendUrl}/api/kols/applications/${applicationId}/reject`,
                data,
                {
                    headers: {
                        'token': localStorage.getItem('token')
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }
};

export default kolService;