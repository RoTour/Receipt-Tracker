
// src/routes/dashboard/upload/+page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { ScanAndSaveReceiptUseCase } from '../../../modules/receipt-scanning/use-cases/ScanAndSaveReceiptUseCase';
import { SupabaseFileStorage } from '../../../modules/receipt-scanning/infrastructure/adapters/SupabaseFileStorage';
import { OpenAiReceiptScanner } from '../../../modules/receipt-scanning/infrastructure/adapters/OpenAiReceiptScanner';
import { SupabaseReceiptRepository } from '../../../modules/receipt-scanning/infrastructure/adapters/SupabaseReceiptRepository';
import { SupabaseProductRepository } from '../../../modules/receipt-scanning/infrastructure/adapters/SupabaseProductRepository';
import { SupabaseReceiptItemRepository } from '../../../modules/receipt-scanning/infrastructure/adapters/SupabaseReceiptItemRepository';

export const actions: Actions = {
  upload: async ({ request }) => {
    const formData = await request.formData();
    const files = formData.getAll('receipts') as File[];

    if (files.length === 0 || (files.length === 1 && files[0].size === 0)) {
      return fail(400, { error: 'No files were uploaded.' });
    }

    const useCase = new ScanAndSaveReceiptUseCase(
      new SupabaseFileStorage(),
      new OpenAiReceiptScanner(),
      new SupabaseReceiptRepository(),
      new SupabaseProductRepository(),
      new SupabaseReceiptItemRepository()
    );

    const processedReceipts = [];
    const skippedFiles = [];

    for (const file of files) {
      try {
        const result = await useCase.execute(file);
        if (result.skipped) {
          skippedFiles.push({ name: file.name, reason: result.reason });
        } else if (result.success) {
          processedReceipts.push(result.receipt);
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return fail(500, { error: `Failed to process ${file.name}: ${errorMessage}` });
      }
    }

    let message = `${processedReceipts.length} receipt(s) processed and saved successfully!`;
    if (skippedFiles.length > 0) {
      message += ` ${skippedFiles.length} file(s) were skipped as duplicates.`;
    }

    return {
      success: true,
      message,
      processedReceipts,
    };
  },
};

