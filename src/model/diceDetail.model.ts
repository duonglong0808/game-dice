import { BeforeCount, BeforeFind, Column, Model, Table } from 'sequelize-typescript';
import { DataType } from 'sequelize-typescript';
import { addConditionNotDelete } from '.';
import { StatusDiceDetail } from 'src/constants';

@Table({
  tableName: 'DiceDetails',
  timestamps: true,
  indexes: [{ name: 'idLive_index', fields: ['idLive'] }],
})
export class DiceDetailModel extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @Column({ type: DataType.STRING })
  transaction: string;

  @Column({ type: DataType.INTEGER })
  totalRed: number;

  @Column({ type: DataType.INTEGER, defaultValue: StatusDiceDetail.prepare })
  status: number;

  @Column({ type: DataType.STRING, unique: true })
  idLive: string;

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
