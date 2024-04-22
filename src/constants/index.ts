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
  open: 3,
  check: 4,
  end: 5,
};

export * from './message';
