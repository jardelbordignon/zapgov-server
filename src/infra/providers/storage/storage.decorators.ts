import {
  BadRequestException,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  UploadedFile,
  UseInterceptors,
  applyDecorators,
} from '@nestjs/common'
import { FileInterceptor as NestFileInterceptor } from '@nestjs/platform-express'
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface'

import { uploadConfig } from './upload-config'

export function FileInterceptor(fieldName = 'file', options?: MulterOptions) {
  return applyDecorators(
    UseInterceptors(
      NestFileInterceptor(fieldName, {
        ...options,
        fileFilter: (req, file, callback) => {
          const object = { ...req.body }
          if (object.file) delete object.file
          req.body = object
          callback(null, true)
        },
        storage: uploadConfig.storeInTmpFolder,
      })
    )
  )
}

type Props = {
  maxMB?: number
  /** default 'png|jpg|jpeg|pdf' */
  validTypes?: string
  nullable?: boolean
}

class OptionalFilePipe extends ParseFilePipe {
  async transform(value: any) {
    try {
      return await super.transform(value)
    } catch (error) {
      if (error instanceof BadRequestException) {
        return undefined
      } else {
        throw error
      }
    }
  }
}

export const File = (props?: Props) => {
  const { maxMB = 2, nullable = false, validTypes = 'png|jpg|jpeg|pdf' } = props ?? {}
  const FilePipe = nullable ? OptionalFilePipe : ParseFilePipe

  return UploadedFile(
    new FilePipe({
      validators: [
        new MaxFileSizeValidator({
          maxSize: 1024 * 1024 * maxMB, // 2mb
        }),
        new FileTypeValidator({
          fileType: `.(${validTypes})`,
        }),
      ],
    })
  )
}
