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

    generateLatexHTML(data: any) {
        const { assessment, sensorData } = data;
        return `
            <html>
            <head>
                <style>
                    body { font-family: Helvetica, Arial, sans-serif; padding: 20px; }
                    h1 { color: #2E7D32; }
                    .header { border-bottom: 2px solid #EEE; padding-bottom: 10px; margin-bottom: 20px; }
                    .status-good { color: #2E7D32; font-weight: bold; }
                    .status-bad { color: #D32F2F; font-weight: bold; }
                    .card { background: #F9FAFB; padding: 15px; border-radius: 8px; margin-bottom: 10px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Latex Quality Report</h1>
                    <p>Generated: ${new Date().toLocaleString()}</p>
                </div>

                <div class="card">
                    <h2>Overall Assessment</h2>
                    <p class="${assessment.isGoodQuality ? 'status-good' : 'status-bad'}" style="font-size: 24px;">
                        ${assessment.isGoodQuality ? 'GOOD QUALITY' : 'POOR QUALITY'}
                    </p>
                </div>

                <h3>Sensor Readings</h3>
                <div class="card">
                    <p><strong>Temperature:</strong> ${sensorData.temperature.toFixed(1)} °C</p>
                    <p><strong>Turbidity:</strong> ${sensorData.turbidity.toFixed(1)} NTU</p>
                    <p><strong>pH Level:</strong> ${sensorData.pH.toFixed(1)}</p>
                </div>

                <h3>Details</h3>
                <ul>
                    ${assessment.reasons.map((r: string) => `<li>${r}</li>`).join('')}
                </ul>
            </body>
            </html>
        `;
    }
};
