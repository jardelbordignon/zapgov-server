import { Module } from '@nestjs/common'
//import { MulterModule } from '@nestjs/platform-express'
import { ServeStaticModule } from '@nestjs/serve-static'

import { EnvModule } from 'src/infra/env/env.module'
import { EnvService } from 'src/infra/env/env.service'

//import { CloudinaryStorage } from './implementations/cloudinary-storage'
import { DiskStorage } from './implementations/disk-storage'
//import { S3Storage } from './implementations/s3-storage'
import { Storage } from './storage'
import { uploadConfig } from './upload-config'

@Module({
  exports: [Storage, DiskStorage],
  imports: [
    EnvModule,
    ServeStaticModule.forRoot({
      rootPath: uploadConfig.storageFolder,
    }),
    // MulterModule.register({
    //   dest: './uploads',
    // }),
  ],
  // providers: [DiskStorage, { provide: Storage, useClass: DiskStorage }],
  // providers: [ DiskStorage, { provide: Storage, useExisting: forwardRef(() => DiskStorage) }],
  providers: [
    DiskStorage,
    {
      inject: [EnvService],
      provide: Storage,
      useFactory: (env: EnvService) => {
        const storageDriver = env.get('STORAGE_DRIVER')
        console.log(storageDriver)
        //if (storageDriver === 's3') {
        //  return new S3Storage()
        // } else if (storageDriver === 'cloudinary') {
        //   return new CloudinaryStorage()
        // } else {
        return new DiskStorage()
        // }
      },
    },
  ],
})
export class StorageModule {}
