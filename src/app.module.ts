import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaquetesModule } from './paquetes/paquetes.module';
import { ImagenModule } from './imagen/imagen.module';
import { VuelosModule } from './vuelos/vuelos.module';
import { HotelesModule } from './hoteles/hoteles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
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
          synchronize: configService.get<string>('NODE_ENV') !== 'production',
        };
        console.log('Database configuration:', dbConfig);
        return dbConfig;
      },
    }),
    PaquetesModule,
    ImagenModule,
    VuelosModule,
    HotelesModule,
  ],
})
export class AppModule {}
