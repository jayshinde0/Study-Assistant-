import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { AppError } from '../middleware/errorHandler.js';

export class FileExtractionService {
  async extractTextFromPDF(filePath) {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(fileBuffer);
      
      // Extract text from all pages
      const text = data.text || '';
      
      if (!text || text.trim().length === 0) {
        throw new AppError('No text could be extracted from PDF', 400);
      }
      
      console.log(`✅ PDF extracted: ${text.length} characters from ${data.numpages} pages`);
      return text;
    } catch (error) {
      console.error('❌ PDF extraction error:', error.message);
      throw new AppError(`Failed to extract PDF: ${error.message}`, 400);
    }
  }

  async extractTextFromDOCX(filePath) {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      
      const text = result.value || '';
      
      if (!text || text.trim().length === 0) {
        throw new AppError('No text could be extracted from DOCX', 400);
      }
      
      console.log(`✅ DOCX extracted: ${text.length} characters`);
      return text;
    } catch (error) {
      console.error('❌ DOCX extraction error:', error.message);
      throw new AppError(`Failed to extract DOCX: ${error.message}`, 400);
    }
  }

  async extractTextFromTXT(filePath) {
    try {
      const text = fs.readFileSync(filePath, 'utf-8');
      
      if (!text || text.trim().length === 0) {
        throw new AppError('Text file is empty', 400);
      }
      
      console.log(`✅ TXT extracted: ${text.length} characters`);
      return text;
    } catch (error) {
      console.error('❌ TXT extraction error:', error.message);
      throw new AppError(`Failed to extract TXT: ${error.message}`, 400);
    }
  }

  async extractText(filePath, fileType) {
    const ext = path.extname(filePath).toLowerCase();
    
    console.log(`📄 Extracting text from ${fileType} file: ${ext}`);
    
    switch (ext) {
      case '.pdf':
        return await this.extractTextFromPDF(filePath);
      case '.docx':
      case '.doc':
        return await this.extractTextFromDOCX(filePath);
      case '.txt':
        return await this.extractTextFromTXT(filePath);
      default:
        throw new AppError(`Unsupported file type: ${ext}. Supported: PDF, DOCX, TXT`, 400);
    }
  }

  async cleanupFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Cleaned up temporary file: ${filePath}`);
      }
    } catch (error) {
      console.error('⚠️ Error cleaning up file:', error.message);
    }
  }

  validateFileSize(fileSize, maxSizeMB = 50) {
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (fileSize > maxBytes) {
      throw new AppError(`File size exceeds ${maxSizeMB}MB limit`, 400);
    }
  }

  validateFileType(filename) {
    const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    const ext = path.extname(filename).toLowerCase();
    
    if (!allowedExtensions.includes(ext)) {
      throw new AppError(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}`, 400);
    }
  }
}

export default new FileExtractionService();
