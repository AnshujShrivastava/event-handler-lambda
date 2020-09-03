import { CredentialProviderChain, DynamoDB } from 'aws-sdk'
import { AttributeMap, DocumentClient } from 'aws-sdk/clients/dynamodb'

export interface Product {
  placeOfBusinessId: string
  productId: string
}

const chain = new CredentialProviderChain()

const TableName = 'Products-integration-test'

const getDynamoClient = async (): Promise<DynamoDB.DocumentClient> => {
  const creds = await chain.resolvePromise()
  return new DynamoDB.DocumentClient({ ...creds, region: 'eu-west-1' })
}

const putItem = async (Item: DocumentClient.PutItemInputAttributeMap): Promise<AttributeMap> => {
  const docClient = await getDynamoClient()
  const { Attributes } = await docClient
    .put({
      TableName,
      Item,
    })
    .promise()
  return Attributes as AttributeMap
}

const putItems = async (orders: DocumentClient.PutItemInputAttributeMap[]): Promise<void> => {
  await Promise.all(orders.map(putItem))
}

const removeProductsFromDb = async (): Promise<void> => {
  const docClient = await getDynamoClient()
  const Items = await scan()
  await Promise.all(
    Items.map(({ placeOfBusinessId, productId }) =>
      docClient
        .delete({
          TableName,
          Key: {
            placeOfBusinessId,
            productId,
          },
        })
        .promise(),
    ),
  )
}

const scan = async (): Promise<DocumentClient.ItemList> => {
  const docClient = await getDynamoClient()
  const { Items = [] } = await docClient.scan({ TableName }).promise()
  return Items
}

export { removeProductsFromDb, putItem, putItems, scan }
