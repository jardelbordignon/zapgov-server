import { existsSync, mkdirSync, promises } from 'fs'
import { extname, resolve } from 'path'

import { Storage } from '../storage'
import { uploadConfig } from '../upload-config'

const { storageFolder, tmpFolder } = uploadConfig

// const deleteFile = async (filename: string) => {
//   try {
//     await promises.stat(filename)
//   } catch {
//     return null
//   }

//   await promises.unlink(filename)
//   return null
// }

export class CloudinaryStorage implements Storage {
  public async store(file: Express.Multer.File, folder: string): Promise<string> {
    const destinationFolder = resolve(storageFolder, folder)

    if (!existsSync(destinationFolder)) {
      mkdirSync(destinationFolder, { recursive: true })
    }

    await promises.rename(
      resolve(tmpFolder, file.filename),
      resolve(destinationFolder, `big${extname(file.filename)}`)
    )
    return destinationFolder
  }

  public async destroyTmp(filename: string): Promise<void> {
    const tmpFilePath = resolve(tmpFolder, filename)
    if (existsSync(tmpFilePath)) await promises.unlink(tmpFilePath)
  }

  public async destroy(filename: string, folder: string): Promise<void> {
    this.destroyTmp(filename)
    const oldFilePath = resolve(storageFolder, folder)
    if (existsSync(oldFilePath)) await promises.unlink(oldFilePath)
  }
}
