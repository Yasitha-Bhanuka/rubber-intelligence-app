import apiClient from '../../../core/api/apiClient';

export interface PriceRequest {
    rubberSheetGrade: string;
    quantityKg: number;
    moistureContentPct: number;
    dirtContentPct: number;
    visualQualityScore: number;
    district: string;
    marketAvailability: string;
}

export interface PriceResponse {
    predictedPriceLkr: number;
    currency: string;
}

export const PriceForecastingService = {
    predictPrice: async (data: PriceRequest): Promise<PriceResponse> => {
        const response = await apiClient.post<PriceResponse>('/price/predict', data);
        return response.data;
    }
};
