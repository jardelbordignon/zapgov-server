import { existsSync, mkdirSync, promises } from 'fs'
import { extname, resolve } from 'path'

// yarn add sharp --ignore-engines
import sharp from 'sharp'

import { FileStorage } from '../file-storage'
import { uploadConfig } from '../upload-config'

const { storageFolder, tmpFolder } = uploadConfig

const deleteFile = async (filename: string) => {
  try {
    await promises.stat(filename)
  } catch {
    return null
  }

  await promises.unlink(filename)
  return null
}

export class DiskFileStorage implements FileStorage {
  public async store(file: Express.Multer.File, folder: string): Promise<string> {
    folder = resolve(storageFolder, folder)

    if (!existsSync(folder)) mkdirSync(folder, { recursive: true })

    //try {
    const ext = extname(file.filename)
    await sharp(file.path).resize(800, null).toFile(`${folder}/big${ext}`)
    await sharp(file.path).resize(350, null).toFile(`${folder}/small${ext}`)
    // } catch (error) {
    //   console.log('file', file)
    //   console.error(error)
    // }

    // await promises.rename(
    //   resolve(tmpFolder, file.filename),
    //   resolve(folder, `big${extname(file.filename)}`)
    // )

    deleteFile(resolve(tmpFolder, file.filename))

    return folder
  }

  public async destroyTmpFile(filename: string): Promise<void> {
    const tmpFilePath = resolve(tmpFolder, filename)
    if (existsSync(tmpFilePath)) await deleteFile(tmpFilePath)
  }

  public async destroyFolder(folder: string): Promise<void> {
    folder = resolve(storageFolder, folder)
    if (existsSync(folder)) await promises.unlink(folder)
  }
}
