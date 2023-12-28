import { Test } from '@nestjs/testing'
import st from 'supertest'

import { AppModule } from 'src/app.module'

export type Supertest = st.SuperTest<st.Test>

export async function supertest() {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()

  const app = moduleRef.createNestApplication()
  await app.init()

  return st(app.getHttpServer())

  // const api = (url: string, method = 'get', body = undefined) => {
  //   return new Promise<supertest.Response>((resolve, reject) => {
  //     const timeoutId = setTimeout(() => {
  //       reject(new Error('Request timed out'))
  //     }, 5000)

  //     supertest(app.getHttpServer())
  //       [method](url)
  //       .send(body)
  //       .end((err, response) => {
  //         clearTimeout(timeoutId)
  //         if (err) {
  //           reject(err)
  //         } else {
  //           resolve(response)
  //         }
  //       })
  //   })
  // }

  // return api
}
