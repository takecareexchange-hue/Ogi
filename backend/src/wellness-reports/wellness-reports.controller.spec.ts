import { Test, TestingModule } from '@nestjs/testing';
import { WellnessReportsController } from './wellness-reports.controller';

describe('WellnessReportsController', () => {
  let controller: WellnessReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WellnessReportsController],
    }).compile();

    controller = module.get<WellnessReportsController>(WellnessReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
