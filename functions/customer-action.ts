import middy from '@middy/core'
import sqsPartialBatchFailure from '@middy/sqs-partial-batch-failure'
import ssm from '@middy/ssm'
import { SQSEvent, SQSRecord } from 'aws-lambda'

import { ProductDb } from '../dynamo/product.db'
import { bodySchema } from '../schemas/customer-action.schema'
import { Body } from '../types/customer-action'

const handleRecordByEventType = async (record: SQSRecord): Promise<void> => {
  const body = JSON.parse(record.body) as Body
  await bodySchema.validateAsync(body)
  switch (body.event) {
    case 'PURCHASED':
      await ProductDb.updatePurchaseCount(body)
  }
}

type HandlerFn = (event: SQSEvent) => Promise<PromiseSettledResult<void>[]>
const handlerFn: HandlerFn = (event) => {
  const recordPromises = event.Records.map(handleRecordByEventType)
  return Promise.allSettled(recordPromises)
}

export const handler = middy(handlerFn)
  .use(
    ssm({
      cache: true,
      names: {
        PRODUCTS_TABLE: process.env.SSM_PRODUCTS_TABLE as string,
      },
    }),
  )
  .use(sqsPartialBatchFailure())
