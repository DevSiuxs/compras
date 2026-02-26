import { Test, TestingModule } from '@nestjs/testing';
import { RecepcionController } from './recepcion.controller';

describe('RecepcionController', () => {
  let controller: RecepcionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecepcionController],
    }).compile();

    controller = module.get<RecepcionController>(RecepcionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
