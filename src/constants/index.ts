export const Status = {
  Active: 'ACTIVE',
  Inactive: 'INACTIVE',
};

export enum Gender {
  MALE = 'MALE',
  GIRL = 'FEMALE',
  OTHER = 'OTHER',
}

export const Environment = {
  Development: 'development',
  Production: 'production',
};

export enum CreateCategoryKind {
  Product = 'product',
  Blog = 'blog',
}

export const TypePermissionCategory = {
  Single: 'SINGLE',
  Multilevel: 'MUlTILEVEL',
};

export const TypeGameDice = {
  XocDia: '0',
  ChanLe: '1',
  Blockchain: '2',
};

export const StatusDiceDetail = {
  prepare: 0,
  shake: 1,
  bet: 2,
  waitOpen: 3,
  check: 4,
  end: 5,
};

export const TypeAnswerDice = {
  p1: 1,
  p2: 2,
  p3: 3,
  p4: 4,
  p5: 5,
  p6: 6,
  p7: 7,
  p8: 8,
  p9: 9,
  p10: 10,
};

export const StatusHistoryPlayDice = {
  wait: 0,
  success: 1,
};

export * from './message';
export * from './interface';
