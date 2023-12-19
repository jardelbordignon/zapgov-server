// import { promises } from 'fs'
// import { resolve } from 'path'

// import { S3 } from 'aws-sdk'

// import { Storage } from '../storage'
// import { uploadConfig } from '../upload-config'

// export class S3Storage implements Storage {
//   private client: S3

//   constructor(private bucket = process.env.STORAGE_AWS_S3_BUCKET) {
//     this.client = new S3({
//       accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//       region: process.env.AWS_REGION,
//       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     })
//   }

//   async store(file: string, folder: string): Promise<string> {
//     const originalName = resolve(uploadConfig.tmpFolder, file)

//     const fileContent = await promises.readFile(originalName)

//     const ContentType = mime.getType(originalName)

//     const Bucket = `${this.bucket}/${folder}`

//     await this.client
//       .putObject({
//         ACL: 'public-read',
//         Body: fileContent,
//         Bucket,
//         ContentType,
//         Key: file,
//       })
//       .promise()

//     await promises.unlink(originalName)

//     return file
//   }

//   async destroy(file: string, folder: string): Promise<void> {
//     const Bucket = `${this.bucket}/${folder}`
//     await this.client.deleteObject({ Bucket, Key: file }).promise()
//   }
// }
