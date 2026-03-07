# Digital Product Passport (DPP) Module

This module implements a rigorous **Conditional "Bank Statement" Zero-Knowledge Encryption Model** combined with **Physical-to-Digital QR Verification**, forming the core trust mechanism for the Rubber Intelligence Supply Chain platform.

## Architecture & Workflow

The DPP module ensures that sensitive exporter/buyer transactions (like invoices and financial statements) are accessible *only* to the authorized parties, adhering to strict Zero-Knowledge (ZK) principles. The backend retains zero ability to decrypt confidential documents once processed.

### 1. Conditional Upload & Classification (Buyer Side)
When a Buyer uploads a document (e.g., an invoice) to finalize a transaction:
1. **OCR Extraction:** The document is processed via Gemini OCR to extract structured fields.
2. **AI Classification:** An ONNX-based AI classifier determines if the document is `CONFIDENTIAL` or `PUBLIC`.
3. **Encryption:** 
   - If `PUBLIC`, the document is stored in cleartext.
   - If `CONFIDENTIAL`, the backend immediately encrypts the file using **AES-256-CBC**.
   - The key is derived using **PBKDF2-SHA256 (100,000 iterations)**.
   - **Password:** The Exporter's `SecretRequestId` (a 32-byte cryptographically secure hex string generated at transaction creation).
   - **Salt:** The `TransactionId` (Lot ID).

### 2. Zero-Knowledge Key Delivery (ReBAC)
The `SecretRequestId` acts as a one-time pad. 
- It is delivered to the purchasing Exporter just-in-time via a strictly guarded endpoint (`GET /transactions/{id}/my-secret`).
- This endpoint enforces **Relationship-Based Access Control (ReBAC)**—only the exact Exporter who purchased the lot can claim it.
- **ZK Property:** Once claimed or immediately after document processing, the `SecretRequestId` can be nullified. The backend *never* stores the ciphertext alongside the plaintext key, rendering database breaches harmless against confidential documents.

### 3. Client-Side Decryption Vault (Exporter Side)
See: [`DualLayerDppScreen.tsx`](./screens/DualLayerDppScreen.tsx)
- The Exporter views the Dual-Layer DPP, which contains a Layer 1 (Public Summary) and Layer 2 (Confidential Vault).
- The Exporter inputs their claimed `SecretRequestId`.
- **CryptoJS** is used directly on the React Native client to perform the identical PBKDF2 derivation (100k iterations) and AES-256-CBC decryption.
- The document is unlocked and viewed entirely locally. The plaintext never travels back over the network.

### 4. Physical-to-Digital QR Verification
See: [`ExporterScannerScreen.tsx`](./screens/ExporterScannerScreen.tsx)
To bridge the physical rubber lot with its digital passport:
1. The physical lot is tagged with a QR code containing `{ lotId, hash }`.
2. The Exporter uses the app's camera to scan this QR code at the port/warehouse.
3. The app fetches the current cryptographic state from the backend (`GET /api/dpp/verify/{lotId}`) which recalculates the SHA-256 hash of the DPP.
4. The scanner compares the Physical Hash against the Recalculated Digital Hash. 
5. Any tampering with the physical good (mismatched lot ID) or digital record (altered grade/quantity yielding a different hash) triggers a strict Anti-Fraud visual rejection alert.

## Core Services & Screens
- **`DualLayerDppScreen`**: The strictly native, on-device Zero-Knowledge decryption vault.
- **`ExporterScannerScreen`**: The Expo Camera-based QR anti-fraud physical scanner.
- **`dppService.ts` / `marketplaceService.ts`**: The API layers handling the cryptographic handshakes (`my-secret`, `dual-layer-dpp`, `verify`).

## Security Parameters Recap
- **Algorithm:** AES-256-CBC with PKCS#7 padding.
- **KDF:** PBKDF2 / HMAC-SHA256 / 100,000 iterations.
- **Key Length:** 32 bytes (256-bit).
- **IV Length:** 16 bytes (128-bit) derived alongside the key.
- **Asymmetric Keys:** Strictly avoided (No RSA for this flow) to ensure pure symmetric zero-knowledge compliance defined by the system.
