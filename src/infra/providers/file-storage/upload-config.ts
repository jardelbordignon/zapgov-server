import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync } from 'node:fs'
import { extname } from 'node:path'
import { resolve } from 'path'

import { diskStorage } from 'multer'

// o PUBLIC_DIRECTORY vai ser definido a partir do diretório dist
const distDir = resolve(__dirname, '..', '..', '..', '..')
const publicDir = resolve(distDir, process.env.PUBLIC_DIRECTORY!)

const tmpFolder = resolve(publicDir, 'tmp')

if (!existsSync(tmpFolder)) {
  mkdirSync(tmpFolder, { recursive: true })
}

const driver = process.env.STORAGE_DRIVER ?? 'disk' // 'disk' | 's3

export const uploadConfig = {
  driver,
  filesPath:
    driver === 's3'
      ? `https://${process.env.STORAGE_BUCKET}.s3.amazonaws.com/`
      : `${global['serverUrl']}/files/`,

  storageFolder: resolve(publicDir, 'storage'),

  storeInTmpFolder: diskStorage({
    destination: tmpFolder,
    filename(request, file, callback) {
      return callback(null, `${randomUUID()}${extname(file.originalname)}`)
    },
  }),

  tmpFolder,
}
