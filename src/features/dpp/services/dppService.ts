import apiClient from '../../../core/api/apiClient';
import { DppResult, DppDocument } from '../types';

export const uploadDppDocument = async (fileUri: string, fileName: string, fileType: string): Promise<DppResult> => {
    const formData = new FormData();

    formData.append('File', {
        uri: fileUri,
        name: fileName,
        type: fileType,
    } as any);

    try {
        const response = await apiClient.post<{ dppId: string; result: DppResult }>('/Dpp/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        // Backend returns { dppId: string, result: ClassificationResult }
        // We unpack it to flatten the structure for the UI
        return {
            ...response.data.result,
            id: response.data.dppId
        };
    } catch (error) {
        console.error('DPP Upload Error:', error);
        throw error;
    }
};

export const getBuyerDocuments = async (): Promise<DppDocument[]> => {
    try {
        const response = await apiClient.get<DppDocument[]>('/Dpp/my-uploads');
        return response.data;
    } catch (error) {
        console.error('Fetch Documents Error:', error);
        return []; // Return empty on error or propagate
    }
};
