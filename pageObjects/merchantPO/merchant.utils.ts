import Tesseract from 'tesseract.js';
import jsQR from 'jsqr';
import sharp from 'sharp';

export async function extractTextFromScreenshot(imagePath: string): Promise<string | null> {
  console.log(`Running OCR on: ${imagePath}`);
  
  try {
    const result = await Tesseract.recognize(imagePath, 'eng', {
      logger: () => {}
    });
    
    const recognizedText = result.data.text;
    console.log(`OCR recognized text: ${recognizedText.substring(0, 200)}...`);
    return recognizedText;
  } catch (error) {
    console.log(`OCR error: ${error}`);
    return null;
  }
}

export async function verifyTextInScreenshot(imagePath: string, expectedTexts: string[]): Promise<{ found: string[], notFound: string[] }> {
  console.log(`Running OCR on: ${imagePath}`);
  
  const result = await Tesseract.recognize(imagePath, 'eng', {
    logger: () => {} // Suppress progress logs
  });
  
  const recognizedText = result.data.text.toLowerCase();
  console.log(`OCR recognized text: ${recognizedText.substring(0, 200)}...`);
  
  const found: string[] = [];
  const notFound: string[] = [];
  
  for (const text of expectedTexts) {
    if (recognizedText.includes(text.toLowerCase())) {
      found.push(text);
    } else {
      notFound.push(text);
    }
  }
  
  return { found, notFound };
}

export async function decodeQRFromImage(imagePath: string): Promise<string | null> {
  console.log(`Decoding QR from: ${imagePath}`);
  
  try {
    // Load image and convert to raw pixel data
    const image = sharp(imagePath);
    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    // Decode QR code
    const qrCode = jsQR(new Uint8ClampedArray(data), info.width, info.height);
    
    if (qrCode) {
      console.log(`QR decoded: ${qrCode.data.substring(0, 100)}...`);
      return qrCode.data;
    } else {
      console.log('No QR code found in image');
      return null;
    }
  } catch (error) {
    console.log(`QR decode error: ${error}`);
    return null;
  }
}

export function compareQRCodes(qr1: string | null, qr2: string | null): { match: boolean, qr1Data: string | null, qr2Data: string | null } {
  const match = qr1 !== null && qr2 !== null && qr1 === qr2;
  return { match, qr1Data: qr1, qr2Data: qr2 };
}
