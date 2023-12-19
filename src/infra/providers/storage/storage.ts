export abstract class Storage {
  abstract store(file: Express.Multer.File, folder: string): Promise<string>
  abstract destroyTmp(filename: string): Promise<void>
  abstract destroy(filename: string, folder: string): Promise<void>
}
