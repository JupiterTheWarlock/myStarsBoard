import path from 'path';

/**
 * Runtime paths are anchored at the repository working directory so tsx
 * development runs and built dist runs read the same data files.
 */
export const DATA_DIR = path.resolve(process.cwd(), 'datas');
