import axios from 'axios';
import config from '../lib/config';

// File APIs
const fileApi = {
    getFiles: async() => {
        const res =  await axios.get(`${config.apiBaseUrl}/files/`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        console.log("Files: ", res.data);
        return res;
    },

    uploadFiles: async(file: File) => {
        const fileData = new FormData();
        fileData.append('file', file)
        console.log("FileData: ", fileData);
        
        return await axios.post(`${config.apiBaseUrl}/files/upload`, fileData, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });         
    },

    renameFile: async(id: string, newName: string) =>{
       const res = await axios.put(`${config.apiBaseUrl}/files/${id}/rename`, { newFilename: newName }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        console.log("Rename response: ", res);
        return res;
    },

    deleteFile: async (id: string) => {
        const res = await axios.delete(`${config.apiBaseUrl}/files/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })

        console.log("Delete response: ", res);
        return res;
    },

    downloadFile: async(id: string) => {
        const res = await axios.get(`${config.apiBaseUrl}/files/${id}/download`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })

        console.log("Download response: ", res);
        return res;
    },

    shareFile: async(id: string) => {
        const res = await axios.post(`${config.apiBaseUrl}/files/${id}/share`, {}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })  
        console.log("Share response: ", res);
        return res;
    },

    unshareFile: async(id: string) => {
        const res = await axios.post(`${config.apiBaseUrl}/files/${id}/unshare`, {}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })  
        console.log("Unshare response: ", res);
        return res;
    },
    getSharedFile: async(token: string) => {
        const res = await axios.get(`${config.apiBaseUrl}/files/shared/${token}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        })  
        console.log("Get shared file response: ", res);
        return res;
    }
};

export default fileApi;