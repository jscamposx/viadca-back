import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaquetesModule } from './paquetes/paquetes.module';
import { ImagenModule } from './imagen/imagen.module';
import { VuelosModule } from './vuelos/vuelos.module';
import { HotelesModule } from './hoteles/hoteles.module';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ...(await configService.get('database')),
      }),
    }),
    PaquetesModule,
    ImagenModule,
    VuelosModule,
    HotelesModule,
  ],
})
export class AppModule {}
