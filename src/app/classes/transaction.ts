export class Transaction {
  characterID: string;
  entityID: string;
  entityType: string;

  //Wallet display items
  type: string;
  item: string;
  pulsars: number;
  balance: number;
  time: number;
  details= new TransactionDetails();
  flow: string;
}

export class TransactionDetails {
  quantity: number;
  pl: number;
  fees: number;
  desc: string;
  itemPrice: number;
  cog: number;
  totalPrice: number;
}
