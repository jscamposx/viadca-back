import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaquetesModule } from './paquetes/paquetes.module';
import { ImagenModule } from './imagen/imagen.module';
import * as fs from 'fs'; // <-- ¡Importa el módulo 'fs'!

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = {
          type: 'mysql' as const,
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
          
        };
        console.log('Database configuration:', dbConfig);
        return dbConfig;
      },
    }),
    PaquetesModule,
    ImagenModule,
  ],
})
export class AppModule {}