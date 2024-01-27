import { Test } from '@nestjs/testing'
import st from 'supertest'
import TestAgent from 'supertest/lib/agent'

import { AppModule } from 'src/app.module'

//export type Supertest = st.SuperTest<st.Test>
export type Supertest = TestAgent<st.Test>

export async function supertest() {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
  const app = moduleRef.createNestApplication()
  await app.init()

  return st(app.getHttpServer())
}
