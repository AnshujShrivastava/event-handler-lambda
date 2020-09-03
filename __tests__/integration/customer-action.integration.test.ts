/* eslint-disable jest/no-mocks-import */
import * as R from 'ramda'

import * as ProductsDb from '../__helpers__/product-test.db'
import { ProductDlq, ProductSqs, purgeQueues } from '../__helpers__/sqs.helper'

jest.setTimeout(60000)

const placeOfBusinessId = 'herkkuid'

const products = R.times((i: number) => {
  return {
    placeOfBusinessId,
    productId: `productid_${i}`,
  }
}, 10)

const MESSAGES_8_VALID_2_INVALID = products.map((p, i) => {
  return {
    event: i === 0 ? 'invalid' : 'PURCHASED',
    storeId: i === 4 ? 'invalid' : placeOfBusinessId,
    cartItems: [
      {
        id: p.productId,
        itemCount: '2',
      },
    ],
  }
})

const sleep = (millis: number): Promise<void> => new Promise((r) => setTimeout(r, millis))

describe('customer-action.ts', () => {
  let start = 0
  beforeAll(async () => {
    await ProductsDb.putItems(products)
    await Promise.all(MESSAGES_8_VALID_2_INVALID.map((msg) => ProductSqs.sendMessage(msg)))
    start = Date.now()
    await sleep(6000) // long sleep that error message ends up to dlq
  })
  afterAll(() => Promise.all([ProductsDb.removeProductsFromDb(), purgeQueues()]))
  describe('send 8 valid and 2 invalid message to queue', () => {
    it('should have 2 messages in dlq', async () => {
      const products = await ProductsDb.scan()
      expect(products).toHaveLength(10)
      expect(products.filter((p) => !!p.purchaseCount).length).toEqual(8)
      const { Messages = [] } = await ProductDlq.receiveMessage()
      // eslint-disable-next-line no-console
      console.info('Execution time: %dms', Date.now() - start)
      expect(Messages.length).toBeGreaterThan(0) // receiveMessage might return 1 or 2 messages
    })
  })
})
