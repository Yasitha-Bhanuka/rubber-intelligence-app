import apiClient from '../../../core/api/apiClient';
import { DppResult } from '../types';

export const uploadDppDocument = async (fileUri: string, fileName: string, fileType: string): Promise<DppResult> => {
    const formData = new FormData();

    formData.append('File', {
        uri: fileUri,
        name: fileName,
        type: fileType,
    } as any);

    try {
        const response = await apiClient.post<DppResult>('/Dpp/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('DPP Upload Error:', error);
        throw error;
    }
};
