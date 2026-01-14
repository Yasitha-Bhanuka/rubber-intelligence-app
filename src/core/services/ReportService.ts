import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert, Platform } from 'react-native';

const REPORT_DIR = (FileSystem.documentDirectory || FileSystem.cacheDirectory || '') + 'TestReports/';

export interface SavedReportInfo {
    uri: string;
    name: string;
    isDirectory: boolean;
    sizeInBytes?: number;
    modified?: string; // Formatted date string
}

export const ReportService = {
    async ensureDirExists() {
        const dirInfo = await FileSystem.getInfoAsync(REPORT_DIR);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(REPORT_DIR, { intermediates: true });
        }
    },

    async generatePDF(html: string, filename: string): Promise<string | null> {
        try {
            console.log("Generating PDF for:", filename);
            await this.ensureDirExists();

            const { uri } = await Print.printToFileAsync({ html });
            console.log("Temp PDF URI:", uri);

            // Move file to our directory
            const targetUri = REPORT_DIR + filename;

            // Check if file already exists, delete if so to overwrite
            const check = await FileSystem.getInfoAsync(targetUri);
            if (check.exists) {
                await FileSystem.deleteAsync(targetUri);
            }

            await FileSystem.moveAsync({
                from: uri,
                to: targetUri
            });
            console.log("Saved PDF to:", targetUri);
            return targetUri;
        } catch (error) {
            console.error("Error generating/saving PDF:", error);
            Alert.alert("Error", "Failed to generate report PDF.");
            return null;
        }
    },

    async sharePDF(uri: string) {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
            await Sharing.shareAsync(uri);
        } else {
            Alert.alert("Error", "Sharing is not available on this device.");
        }
    },

    async listSavedReports(): Promise<SavedReportInfo[]> {
        try {
            await this.ensureDirExists();
            const files = await FileSystem.readDirectoryAsync(REPORT_DIR);

            const reports: SavedReportInfo[] = [];
            for (const file of files) {
                if (file.endsWith('.pdf')) {
                    const uri = REPORT_DIR + file;
                    const info = await FileSystem.getInfoAsync(uri, { size: true } as any);
                    if (info.exists) {
                        reports.push({
                            uri,
                            name: file,
                            isDirectory: info.isDirectory,
                            sizeInBytes: info.size,
                            modified: new Date(info.modificationTime! * 1000).toLocaleDateString()
                        });
                    }
                }
            }
            return reports.sort((a, b) => (b.modified && a.modified ? b.modified.localeCompare(a.modified) : 0));
        } catch (error) {
            console.error("Error listing reports:", error);
            return [];
        }
    },

    async deleteReport(uri: string): Promise<boolean> {
        try {
            await FileSystem.deleteAsync(uri);
            return true;
        } catch (error) {
            console.error("Error deleting report:", error);
            return false;
        }
    },

    generateGradingHTML(data: any) {
        const { batchId, result, params } = data;
        return `
            <html>
            <head>
                <style>
                    body { font-family: Helvetica, Arial, sans-serif; padding: 20px; }
                    h1 { color: #2E7D32; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #EEE; padding-bottom: 10px; margin-bottom: 20px; }
                    .grade-box { background: #f0fdf4; border: 1px solid #2E7D32; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
                    .grade-title { font-size: 32px; font-weight: bold; color: #2E7D32; }
                    .meta-table { width: 100%; border-collapse: collapse; }
                    .meta-table td { padding: 8px; border-bottom: 1px solid #EEE; }
                    .label { font-weight: bold; color: #555; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1>Rubber Grading Report</h1>
                        <p>Batch ID: ${batchId}</p>
                    </div>
                    <div>
                        <p>${new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <div class="grade-box">
                    <p>Predicted Grade</p>
                    <div class="grade-title">${result?.predictedClass || 'N/A'}</div>
                    <p>Confidence: ${(result?.confidence * 100).toFixed(1)}%</p>
                </div>

                <h3>Test Details</h3>
                <table class="meta-table">
                    <tr><td class="label">Tester Name</td><td>${params?.testerName || '-'}</td></tr>
                    <tr><td class="label">Sheet Count</td><td>${params?.sheetCount || '-'}</td></tr>
                    <tr><td class="label">Weight</td><td>${params?.sheetWeight || '-'} kg</td></tr>
                    <tr><td class="label">Test Date</td><td>${params?.testDate || '-'}</td></tr>
                    <tr><td class="label">Test Time</td><td>${params?.testTime || '-'}</td></tr>
                    <tr><td class="label">Severity</td><td>${result?.severity || '-'}</td></tr>
                </table>

                <h3>AI Suggestions</h3>
                <p>${result?.suggestions || 'No suggestions available.'}</p>
            </body>
            </html>
        `;
    },

    generateLatexHTML(data: { result: any, testId: string, testDate: string, testTime: string, testerName?: string }) {
        const { result, testId, testDate, testTime, testerName } = data;
        const { qualityGrade, qualityScore, confidence, status, sensorReadings, recommendations } = result;

        const getStatusColor = (status: string) => {
            if (status === 'Pass') return '#10B981';
            if (status === 'Warning') return '#F59E0B';
            return '#EF4444';
        };

        const statusColor = getStatusColor(status);

        return `
            <html>
            <head>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1F2937; line-height: 1.5; }
                    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #E5E7EB; padding-bottom: 20px; margin-bottom: 30px; }
                    .logo-text { font-size: 24px; font-weight: bold; color: #166534; }
                    .report-title { font-size: 14px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px; }
                    
                    .summary-card { background: #F9FAFB; border-radius: 12px; padding: 24px; margin-bottom: 30px; border: 1px solid #E5E7EB; }
                    .grade-section { text-align: center; margin-bottom: 20px; }
                    .grade-label { font-size: 14px; color: #6B7280; margin-bottom: 4px; }
                    .grade-value { font-size: 42px; font-weight: 800; color: ${statusColor}; margin-bottom: 4px; }
                    .score-value { font-size: 18px; color: #374151; font-weight: 600; }
                    
                    .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 20px; border-top: 1px solid #E5E7EB; padding-top: 20px; }
                    .meta-item { display: flex; flex-direction: column; }
                    .meta-label { font-size: 12px; color: #6B7280; font-weight: 600; text-transform: uppercase; }
                    .meta-value { font-size: 16px; color: #111827; font-weight: 500; }

                    .section-title { font-size: 18px; font-weight: 700; color: #1F2937; margin-bottom: 16px; margin-top: 30px; display: flex; align-items: center; }
                    .sensor-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 30px; }
                    .sensor-card { background: white; border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; text-align: center; }
                    .sensor-val { font-size: 20px; font-weight: 700; color: #1F2937; margin-top: 8px; }
                    .sensor-name { font-size: 12px; color: #6B7280; }

                    .rec-list { list-style: none; padding: 0; }
                    .rec-item { background: #FFF7ED; border-left: 4px solid #F59E0B; padding: 12px 16px; margin-bottom: 12px; border-radius: 0 4px 4px 0; font-size: 14px; color: #92400E; }

                    .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="logo-text">RubberEX</div>
                        <div class="report-title">Latex Quality Certificate</div>
                    </div>
                    <div style="text-align: right;">
                        <div class="meta-value">${testId}</div>
                        <div class="meta-label">Test ID</div>
                    </div>
                </div>

                <div class="summary-card">
                    <div class="grade-section">
                        <div class="grade-label">Overall Quality Grade</div>
                        <div class="grade-value">${qualityGrade}</div>
                        <div class="score-value">Score: ${qualityScore}/100 • Status: ${status}</div>
                    </div>
                    <div class="meta-grid">
                        <div class="meta-item">
                            <span class="meta-label">Date Tested</span>
                            <span class="meta-value">${testDate}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Time</span>
                            <span class="meta-value">${testTime}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Tester</span>
                            <span class="meta-value">${testerName || 'Authorized Personnel'}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Confidence</span>
                            <span class="meta-value">${(confidence * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>

                <div class="section-title">Sensor Analysis</div>
                <div class="sensor-grid">
                    <div class="sensor-card">
                        <div class="sensor-name">Temperature</div>
                        <div class="sensor-val">${sensorReadings.temperature}°C</div>
                    </div>
                    <div class="sensor-card">
                        <div class="sensor-name">Turbidity</div>
                        <div class="sensor-val">${sensorReadings.turbidity} NTU</div>
                    </div>
                    <div class="sensor-card">
                        <div class="sensor-name">pH Level</div>
                        <div class="sensor-val">${sensorReadings.pH}</div>
                    </div>
                </div>

                <div class="section-title">AI Recommendations</div>
                <ul class="rec-list">
                    ${recommendations.map((rec: string) => `<li class="rec-item">${rec}</li>`).join('')}
                </ul>

                <div class="footer">
                    <p>Generated by RubberEX Intelligence System • Valid without signature</p>
                    <p>${new Date().toLocaleString()}</p>
                </div>
            </body>
            </html>
        `;
    },

    generatePriceForecastHTML(data: { type: string, grade: string, items: any[] }) {
        const { type, grade, items } = data;
        const title = type === 'prediction' ? 'Price Predictions' : 'Historical Prices';

        return `
            <html>
            <head>
                <style>
                    body { font-family: Helvetica, Arial, sans-serif; padding: 30px; }
                    h1 { color: #2E7D32; margin-bottom: 5px; }
                    .header { border-bottom: 2px solid #2E7D32; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
                    .meta { color: #666; font-size: 14px; }
                    
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { text-align: left; padding: 12px; background-color: #f8f9fa; border-bottom: 2px solid #ddd; color: #333; }
                    td { padding: 12px; border-bottom: 1px solid #eee; color: #555; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    
                    .price { font-weight: bold; color: #2E7D32; }
                    .footer { margin-top: 50px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <h1>Rubber Price Report</h1>
                        <div class="meta">${title} • Grade: <strong>${grade}</strong></div>
                    </div>
                    <div class="meta">
                        Generated: ${new Date().toLocaleDateString()}
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Grade</th>
                            <th>Forecasted Price (LKR)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                        <tr>
                            <td>${item.date}</td>
                            <td>${item.grade}</td>
                            <td class="price">${item.price.toFixed(2)}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="footer">
                    <p>Rubber Intelligence Agent • Automated Market Analysis</p>
                </div>
            </body>
            </html>
        `;
    }
};
