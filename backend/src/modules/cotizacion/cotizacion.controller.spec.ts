import { Test, TestingModule } from '@nestjs/testing';
import { CotizacionController } from './cotizacion.controller';

describe('CotizacionController', () => {
  let controller: CotizacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CotizacionController],
    }).compile();

    controller = module.get<CotizacionController>(CotizacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
