import apiClient from '../../../core/api/apiClient';

interface PredictionResponse {
    label: string;
    confidence: number;
    remedy: string;
    severity: string;
    isRejected: boolean;
    rejectionReason: string | null;
}

export interface DiseaseRecord {
    id: string;
    userId: string;
    diseaseType: number;
    predictedLabel: string;
    confidence: number;
    timestamp: string;
    imagePath: string;
}

export const DiseaseService = {
    detect: async (imageUri: string, type: number): Promise<PredictionResponse> => {
        try {
            const formData = new FormData();

            // Append Image
            const filename = imageUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename || '');
            const ext = match ? match[1] : 'jpg';

            formData.append('Image', {
                uri: imageUri,
                name: filename || `photo.${ext}`,
                type: `image/${ext}`
            } as any);

            // Append Disease Type (0=Leaf, 1=Pest, 2=Weed)
            formData.append('Type', type.toString());

            const response = await apiClient.post('/disease/detect', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            return response.data;
        } catch (error) {
            console.error('Disease Detection Error:', error);
            throw error;
        }
    },

    getHistory: async (): Promise<DiseaseRecord[]> => {
        const response = await apiClient.get<DiseaseRecord[]>('/disease/history');
        return response.data;
    }
};
