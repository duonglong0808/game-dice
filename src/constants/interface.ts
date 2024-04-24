export interface DataJobCalcPointDice {
  diceDetailId: number;
  transactionId: number;
  totalRed: number;
}

export interface DataJobAddPointToUser {
  userId: number;
  gamePointId: number;
  points: number;
  type: number;
}
