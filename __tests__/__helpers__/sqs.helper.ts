import { SQS } from 'aws-sdk'
import { ReceiveMessageResult } from 'aws-sdk/clients/sqs'

import { ProductDeadLetterQueue, ProductQueue } from './generated.integration-test.output.json'

const sqs = new SQS({ region: 'eu-west-1' })

const sendMessage = async <T>(msg: T): Promise<void> => {
  await sqs
    .sendMessage({
      QueueUrl: ProductQueue,
      MessageBody: JSON.stringify(msg),
    })
    .promise()
}

const receiveMessage = async (): Promise<ReceiveMessageResult> => {
  return sqs
    .receiveMessage({
      QueueUrl: ProductDeadLetterQueue,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,
    })
    .promise()
}

export const purgeQueues = async (): Promise<void> => {
  await Promise.all(
    [ProductQueue, ProductDeadLetterQueue].map((QueueUrl) =>
      sqs
        .purgeQueue({
          QueueUrl,
        })
        .promise(),
    ),
  )
}

export const ProductSqs = { sendMessage }
export const ProductDlq = { receiveMessage }
