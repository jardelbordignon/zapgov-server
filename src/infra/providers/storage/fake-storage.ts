import { Storage } from './storage'

export class FakeStorage implements Storage {
  private storage: string[] = []

  public async store(file: Express.Multer.File): Promise<string> {
    this.storage.push(file.filename)
    return file.filename
  }

  public async destroyTmp(file: string): Promise<void> {
    const findIndex = this.storage.findIndex(storedFile => storedFile === file)
    this.storage.splice(findIndex, 1)
  }

  public async destroy(file: string): Promise<void> {
    this.destroyTmp(file)
  }
}
