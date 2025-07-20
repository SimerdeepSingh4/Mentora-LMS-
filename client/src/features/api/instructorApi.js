import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1/instructors'; // Replace with your actual backend URL

// Submit an instructor application
export const submitInstructorApplication = async (applicationData) => {
    try {
        const response = await axios.post(`${API_URL}/apply`, applicationData);
        return response.data;
    } catch (error) {
        console.error('Error submitting instructor application:', error);
        throw error;
    }
};

// Fetch all pending instructor applications
export const getPendingApplications = async () => {
    try {
        const response = await axios.get(`${API_URL}/applications`);
        return response.data;
    } catch (error) {
        console.error('Error fetching pending applications:', error);
        throw error;
    }
};

// Approve or reject an instructor application
export const updateUserRole = async (userId, newRole) => {
    try {
        const response = await axios.put(`${API_URL}/update-role`, { userId, newRole });
        return response.data;
    } catch (error) {
        console.error('Error updating user role:', error);
        throw error;
    }
};
