import * as Joi from '@hapi/joi'

const requiredNonEmptyString = Joi.string().trim().not().empty().required()

const event = Joi.string().valid('PURCHASED').required()
const storeId = requiredNonEmptyString

const cartItem = Joi.object({
  id: requiredNonEmptyString,
  itemCount: Joi.string(),
})

export const bodySchema = Joi.object({
  event,
  storeId,
  cartItems: Joi.array().min(1).items(cartItem),
}).required()
