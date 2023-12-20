import { FileStorage } from './file-storage'

export class FakeFileStorage implements FileStorage {
  private storage: string[] = []

  public async store(file: Express.Multer.File): Promise<string> {
    this.storage.push(file.filename)
    return file.filename
  }

  public async destroyTmpFile(file: string): Promise<void> {
    const findIndex = this.storage.findIndex(storedFile => storedFile === file)
    this.storage.splice(findIndex, 1)
  }

  public async destroyFolder(file: string): Promise<void> {
    this.destroyTmpFile(file)
  }
}
