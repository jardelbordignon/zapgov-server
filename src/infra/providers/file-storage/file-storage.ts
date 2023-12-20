export abstract class FileStorage {
  abstract store(file: Express.Multer.File, folder: string): Promise<string>
  abstract destroyTmpFile(filename: string): Promise<void>
  abstract destroyFolder(folder: string): Promise<void>
}
