import { Op } from 'sequelize';

export * from './user.model';
export * from './gameDice.model';
export * from './diceDetail.model';
export * from './historyPlayDice.model';
export * from './game-point.model';
export * from './user-point.model';

export const addConditionNotDelete = (options: any) => {
  if (!options.where) {
    options.where = {};
  }
  options.where.isDeleted = { [Op.ne]: true };
};
