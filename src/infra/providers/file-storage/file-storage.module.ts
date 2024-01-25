import { Module } from '@nestjs/common'
//import { MulterModule } from '@nestjs/platform-express'
import { ServeStaticModule } from '@nestjs/serve-static'

import { EnvModule } from 'src/infra/env/env.module'
import { EnvService } from 'src/infra/env/env.service'

//import { CloudinaryStorage } from './implementations/cloudinary-storage'
import { FileStorage } from './file-storage'
import { DiskFileStorage } from './implementations/disk-file-storage'
//import { S3Storage } from './implementations/s3-storage'
import { uploadConfig } from './upload-config'

@Module({
  exports: [FileStorage, DiskFileStorage],
  imports: [
    EnvModule,
    ServeStaticModule.forRoot({
      rootPath: uploadConfig.storageFolder,
      serveRoot: '/files',
    }),
    // MulterModule.register({
    //   dest: './uploads',
    // }),
  ],
  // providers: [DiskStorage, { provide: Storage, useClass: DiskStorage }],
  // providers: [ DiskStorage, { provide: Storage, useExisting: forwardRef(() => DiskStorage) }],
  providers: [
    DiskFileStorage,
    {
      inject: [EnvService],
      provide: FileStorage,
      useFactory: (env: EnvService) => {
        const storageDriver = env.get('STORAGE_DRIVER')
        console.log(storageDriver)
        //if (storageDriver === 's3') {
        //  return new S3Storage()
        // } else if (storageDriver === 'cloudinary') {
        //   return new CloudinaryStorage()
        // } else {
        return new DiskFileStorage()
        // }
      },
    },
  ],
})
export class FileStorageModule {}
