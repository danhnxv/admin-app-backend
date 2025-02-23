import * as md5 from 'md5';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn({ type: 'mediumint', unsigned: true })
  Id: number;

  @Column({ type: 'varchar', length: 64, nullable: false, unique: true })
  Username: string;

  @Column({ type: 'varchar', length: 64, nullable: false, default: '' })
  Password: string;

  @Column({ type: 'varchar', length: 128, nullable: false, default: '' })
  Email: string;

  isCorrectPassword(password: string) {
    if (this.Password !== md5(password)) {
      return false;
    }

    return true;
  }
}
