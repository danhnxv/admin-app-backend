import { TypeOrmConfigService } from '@configs/typeorm';
import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
// import { DataSource } from 'typeorm';
@Module({
  imports: [],
})
export class DatabaseModule {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static forRoot(entities?: any[]): DynamicModule {
    return TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options) => {
        if (!options) {
          throw new Error('Invalid options passed');
        }

        return addTransactionalDataSource(new DataSource(options));
      },
    });
  }
  public static forFeature(entities: EntityClassOrSchema[]): DynamicModule {
    return TypeOrmModule.forFeature(entities);
  }
}
