import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Category {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Index({ fulltext: true })
  @Column({ type: 'varchar', length: 255 })
  seachableName: string;

  @Column({ type: 'text', 'nullable': true })
  description: string;

  @Index({ fulltext: true })
  @Column({ type: 'text', 'nullable': true })
  seachableDescription: string;

  @Column({ type: 'datetime' })
  createdDate: Date;

  @Column()
  active: boolean;
}
