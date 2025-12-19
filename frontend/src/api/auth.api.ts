import axios from 'axios';
import config from '../lib/config';

// Auth APIs
export const authApi = {
    register: async (data: { email: string; password: string; name: string }) => {
        return await axios.post(`${config.apiBaseUrl}/auth/register`, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
    },
    login: async (data: { email: string; password: string }) => {
        return await axios.post(`${config.apiBaseUrl}/auth/login`, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    },
    getMe: async() => {
        return await axios.get(`${config.apiBaseUrl}/auth/me`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
    }
};