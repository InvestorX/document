import { getExtensions } from 'ranuts/utils';
import { t } from './i18n';
import { X2TConverter } from './document-converter';
import { createEditorInstance } from './onlyoffice-editor';
import { getDocumentType } from './document-utils';
import type { ConversionResult, EmscriptenModule } from './document-types';

// Export types
export type { ConversionResult, EmscriptenModule, DocumentType } from './document-types';

// Export utilities
export { getDocumentType, getBasePath, BASE_PATH, DOCUMENT_TYPE_MAP } from './document-utils';

// Singleton instance
const x2tConverter = new X2TConverter();

// Export converter methods
export const initX2T = (): Promise<EmscriptenModule> => x2tConverter.initialize();
export const convertDocument = (file: File): Promise<ConversionResult> => x2tConverter.convertDocument(file);

// Export editor functions
export { createEditorInstance };

// File operation method for opening existing documents
export async function handleDocumentOperation(options: { fileName: string; file?: File }): Promise<void> {
  try {
    const { fileName, file } = options;
    const fileType = getExtensions(file?.type || '')[0] || fileName.split('.').pop() || '';
    const _docType = getDocumentType(fileType);

    // Opening existing document requires conversion
    if (!file) throw new Error(t('invalidFileObject'));
    const documentData = await convertDocument(file);

    // Create editor instance (now returns a Promise, uses queue internally)
    await createEditorInstance({
      fileName,
      fileType,
      // @ts-expect-error BlobPart is compatible with ArrayBuffer at runtime
      binData: documentData.bin,
      media: documentData.media,
    });
  } catch (error: any) {
    console.error(`${t('documentOperationFailed')}`, error);
    alert(`${t('documentOperationFailed')}${error.message}`);
    throw error;
  }
}
