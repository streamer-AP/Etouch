import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // MySQL/PostgreSQL connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('database.mysql.host'),
        port: configService.get('database.mysql.port'),
        username: configService.get('database.mysql.username'),
        password: configService.get('database.mysql.password'),
        database: configService.get('database.mysql.database'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'development',
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsTableName: 'migrations',
        migrationsRun: true,
        retryAttempts: 3,
        retryDelay: 3000,
        autoLoadEntities: true,
        keepConnectionAlive: true,
        extra: {
          connectionLimit: 10,
        },
      }),
      inject: [ConfigService],
    }),

    // MongoDB connection
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('database.mongodb.uri'),
        retryAttempts: 3,
        retryDelay: 3000,
        connectionFactory: (connection) => {
          connection.on('connected', () => {
            console.log('MongoDB connected successfully');
          });
          connection.on('error', (error) => {
            console.error('MongoDB connection error:', error);
          });
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule, MongooseModule],
})
export class DatabaseModule {}