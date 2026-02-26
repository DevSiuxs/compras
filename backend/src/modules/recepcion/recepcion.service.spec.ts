import { Test, TestingModule } from '@nestjs/testing';
import { RecepcionService } from './recepcion.service';

describe('RecepcionService', () => {
  let service: RecepcionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecepcionService],
    }).compile();

    service = module.get<RecepcionService>(RecepcionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
