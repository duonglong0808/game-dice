import { BeforeCount, BeforeFind, Column, Model, Table } from 'sequelize-typescript';
import { DataType } from 'sequelize-typescript';
import { addConditionNotDelete } from '.';

@Table({
  tableName: 'GameDices',
  timestamps: true,
  indexes: [{ name: 'name_index', fields: ['name'] }],
})
export class GameDiceModel extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id: number;

  @Column({ type: DataType.STRING })
  type: string;

  @Column({ type: DataType.STRING })
  name: string;

  @Column({ type: DataType.STRING })
  nameAuthor: string;

  @Column({ type: DataType.TEXT })
  avtAuthor: string;

  @Column({ type: DataType.STRING })
  nationalAuthor: string;

  @Column({ type: DataType.STRING, unique: true })
  idLive: string;

  @Column({ type: DataType.STRING })
  idChat: string;

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
