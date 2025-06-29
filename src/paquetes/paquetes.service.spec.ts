import { Test, TestingModule } from '@nestjs/testing';
import { PaquetesService } from './paquetes.service';

describe('PaquetesService', () => {
  let service: PaquetesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaquetesService],
    }).compile();

    service = module.get<PaquetesService>(PaquetesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
