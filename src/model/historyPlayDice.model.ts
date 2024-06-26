import { BeforeCount, BeforeFind, BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { DataType } from 'sequelize-typescript';
import { DiceDetailModel, GameDiceModel, UserModel, addConditionNotDelete } from '.';
import { StatusHistoryPlayGame } from 'src/constants';

@Table({
  tableName: 'HistoryPlayDices',
  timestamps: false,
  indexes: [
    { name: 'gameDiceId_index', fields: ['gameDiceId'] },
    { name: 'diceDetailId_index', fields: ['diceDetailId'] },
  ],
})
export class HistoryPlayDiceModel extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @ForeignKey(() => UserModel)
  @Column({ type: DataType.INTEGER })
  userId: number;

  @BelongsTo(() => UserModel)
  user: UserModel;

  @Column({ type: DataType.INTEGER })
  gamePointId: number;

  @Column({ type: DataType.INTEGER })
  answer: number;

  @Column({ type: DataType.INTEGER })
  point: number;

  @Column({ type: DataType.INTEGER, defaultValue: StatusHistoryPlayGame.wait })
  status: number;

  @ForeignKey(() => GameDiceModel)
  @Column
  gameDiceId: number;

  @BelongsTo(() => GameDiceModel)
  gameDice: GameDiceModel;

  @ForeignKey(() => DiceDetailModel)
  @Column
  diceDetailId: number;

  @BelongsTo(() => DiceDetailModel)
  diceDetail: DiceDetailModel;

  @Column({ type: DataType.DATE })
  createdAt: Date;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isDeleted: boolean;

  @Column({ type: DataType.DATE })
  deletedAt: Date;

  @BeforeFind
  @BeforeCount
  static async BeforeFindHook(options: any) {
    addConditionNotDelete(options);
  }
}
