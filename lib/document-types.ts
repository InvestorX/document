// Type definitions for x2t module

export interface EmscriptenFileSystem {
  mkdir(path: string): void;
  readdir(path: string): string[];
  readFile(path: string, options?: { encoding: 'binary' }): BlobPart;
  writeFile(path: string, data: Uint8Array | string): void;
}

export interface EmscriptenModule {
  FS: EmscriptenFileSystem;
  ccall: (funcName: string, returnType: string, argTypes: string[], args: any[]) => number;
  onRuntimeInitialized: () => void;
}

export interface ConversionResult {
  fileName: string;
  type: DocumentType;
  bin: BlobPart;
  media: Record<string, string>;
}

export type DocumentType = 'word' | 'cell' | 'slide';

declare global {
  interface Window {
    Module: EmscriptenModule;
    editor?: {
      sendCommand: ({
        command,
        data,
      }: {
        command: string;
        data: {
          err_code?: number;
          urls?: Record<string, string>;
          path?: string;
          imgName?: string;
          buf?: ArrayBuffer;
          success?: boolean;
          error?: string;
        };
      }) => void;
      destroyEditor: () => void;
    };
  }
}
