import * as ImageManipulator from 'expo-image-manipulator';
import * as jpeg from 'jpeg-js';
import { Buffer } from 'buffer';

export interface ValidationResult {
    isValid: boolean;
    reason?: string;
}

export const ImageValidator = {
    /**
     * Validates if the image is likely a rubber sheet and is not blurred.
     * Uses heuristic pixel analysis on a downscaled sample.
     */
    validateImage: async (imageUri: string): Promise<ValidationResult> => {
        try {
            // 1. Downscale for performance (64x64 is sufficient for color/variance)
            const manipResult = await ImageManipulator.manipulateAsync(
                imageUri,
                [{ resize: { width: 64, height: 64 } }],
                { base64: true, format: ImageManipulator.SaveFormat.JPEG }
            );

            if (!manipResult.base64) {
                return { isValid: false, reason: "Failed to process image data." };
            }

            // 2. Decode raw JPEG data
            const rawBuffer = Buffer.from(manipResult.base64, 'base64');
            const decoded = jpeg.decode(rawBuffer, { useTArray: true });
            const { data } = decoded;

            // 3. Analysis Variables
            let validHueCount = 0;
            let totalBrightness = 0;
            let varianceSum = 0;
            let prevGray = 0;

            const totalPixels = data.length / 4; // RGBA

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // --- Color Analysis ---
                // RSS Rubber is Amber/Brown/Yellow.
                // Hue: 5 (Red-Orange) to 65 (Yellow).
                // Saturation: Must be > 20 to avoid gray/white walls.
                // Value: Must be > 20 to avoid pitch black.
                const { h, s, v } = rgbToHsv(r, g, b);

                const isRubberHue = (h >= 5 && h <= 65);
                const isSaturated = (s > 20);
                const isNotBlack = (v > 20);

                if (isRubberHue && isSaturated && isNotBlack) {
                    validHueCount++;
                }

                // --- Blur/Focus Analysis ---
                // Simple gradient variance check
                const gray = (r + g + b) / 3;
                totalBrightness += gray;
                varianceSum += Math.abs(gray - prevGray);
                prevGray = gray;
            }

            // 4. Thresholds
            const rubberContentRatio = validHueCount / totalPixels;
            const avgBrightness = totalBrightness / totalPixels;
            const avgVariance = varianceSum / totalPixels;

            // console.log(`[ImageValidator] Ratio: ${rubberContentRatio.toFixed(2)}, Brightness: ${avgBrightness.toFixed(0)}, Variance: ${avgVariance.toFixed(1)}`);
            // console.log(`[Validation Stats] ContentRatio: ${rubberContentRatio.toFixed(2)} (Min 0.2), Brightness: ${avgBrightness.toFixed(0)} (20-230), Variance: ${avgVariance.toFixed(1)} (Min 2.5)`);

            // Check 1: Content (Rubber Sheet Colors)
            // Stricter Thresholds:
            // - Hue: 10 (Red-Orange) to 60 (Yellow) -> Typical RSS Rubber
            // - Saturation: > 20 (Exclude Gray/White/Black walls)
            // - Ratio: > 30% coverage
            if (rubberContentRatio < 0.30) {
                return {
                    isValid: false,
                    reason: `Subject not recognized as a Rubber Sheet.\nmatch: ${(rubberContentRatio * 100).toFixed(0)}%\n\nTip: Ensure the brown/amber sheet fills the frame.`
                };
            }

            // Check 2: Brightness
            if (avgBrightness < 30) {
                return { isValid: false, reason: "Image is too dark.\nPlease ensure good lighting." };
            }
            if (avgBrightness > 220) {
                return { isValid: false, reason: "Image is overexposed.\nToo much white glare." };
            }

            // Check 3: Blur (Low Variance)
            // Relaxed slightly to 2.0 to avoid rejecting smooth sheets, but kept for out-of-focus
            if (avgVariance < 2.0) {
                return { isValid: false, reason: "Image is blurry.\nPlease tap to focus." };
            }

            return { isValid: true };

        } catch (error: any) {
            console.error("Validation Error Details:", error);
            // FAIL SAFE: If validation crashes, assume functionality is broken but let user know.
            // Returning FALSE here to alert the user that validation failed (debugging mode).
            return { isValid: false, reason: `Validation System Error: ${error.message || "Unknown error"}` };
        }
    }
};

/**
 * Converts RGB to HSV (Hue 0-360, Sat 0-100, Val 0-100)
 */
function rgbToHsv(r: number, g: number, b: number) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;

    if (max !== min) {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h: h * 360, s: s * 100, v: v * 100 };
}
