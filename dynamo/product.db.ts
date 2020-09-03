import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import * as AWSXRay from 'aws-xray-sdk'

import { Body, CartItem } from '../types/customer-action'

const aws = process.env.IS_OFFLINE ? AWS : AWSXRay.captureAWS(AWS)
const docClient = new aws.DynamoDB.DocumentClient()

const getItemCount = (countStr: string): number => {
  const count = Number(countStr)
  return isNaN(count) ? 1 : count
}

const transactUpdatePurchaseCount = (storeId: string) => (
  cartItem: CartItem,
): DocumentClient.TransactWriteItem => {
  const count = getItemCount(cartItem.itemCount)
  return {
    Update: {
      TableName: process.env.PRODUCTS_TABLE as string, // ssm middleware adds this to env
      Key: {
        productId: cartItem.id,
        placeOfBusinessId: storeId,
      },
      ConditionExpression: 'attribute_exists(placeOfBusinessId) and attribute_exists(productId)',
      UpdateExpression: 'SET purchaseCount = if_not_exists(purchaseCount, :initial) + :incr',
      ExpressionAttributeValues: {
        ':initial': 0,
        ':incr': count,
      },
    },
  }
}

const updatePurchaseCount = async ({ storeId, cartItems = [] }: Body): Promise<void> => {
  const TransactItems = cartItems.map(transactUpdatePurchaseCount(storeId))
  await docClient.transactWrite({ TransactItems }).promise()
}

export const ProductDb = { updatePurchaseCount }
