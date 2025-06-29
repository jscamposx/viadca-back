import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaquetesModule } from './paquetes/paquetes.module';
import { ImagenesModule } from './imagenes/imagenes.module';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',         
      port: 3306,
      username: 'root',     
      password: '',  
      database: 'viadca', 
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,          
    }),
    PaquetesModule,  
    ImagenesModule,            
  ],
})
export class AppModule {}
