export type EventType = 'PURCHASED'

export interface CartItem {
  id: string
  itemCount: string
}

export interface Body {
  event: EventType
  storeId: string
  cartItems: CartItem[]
}
