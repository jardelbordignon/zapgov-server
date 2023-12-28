import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

import { I18n, Lang } from '../providers/i18n/i18n'

@Injectable()
export class LangMiddleware implements NestMiddleware {
  constructor(private i18n: I18n) {}

  use(req: Request, res: Response, next: NextFunction) {
    this.i18n.setLang((req.query.lang || 'pt') as Lang)
    next()
  }
}
