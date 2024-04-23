import { BeforeCount, BeforeFind, BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { DataType } from 'sequelize-typescript';
import { GameDiceModel, addConditionNotDelete } from '.';
import { StatusDiceDetail } from 'src/constants';

@Table({
  tableName: 'DiceDetails',
  timestamps: true,
  indexes: [{ name: 'gameDiceId_index', fields: ['gameDiceId'] }],
})
export class DiceDetailModel extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @Column({ type: DataType.INTEGER, unique: true })
  transaction: number;

  @Column({ type: DataType.INTEGER })
  totalRed: number;

  @Column({ type: DataType.INTEGER, defaultValue: StatusDiceDetail.prepare })
  status?: number;

  @ForeignKey(() => GameDiceModel)
  @Column
  gameDiceId: number;

  @BelongsTo(() => GameDiceModel)
  gameDice: GameDiceModel;

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
