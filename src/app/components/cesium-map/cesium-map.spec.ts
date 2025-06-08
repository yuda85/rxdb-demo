import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CesiumMap } from './cesium-map';

describe('CesiumMap', () => {
  let component: CesiumMap;
  let fixture: ComponentFixture<CesiumMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CesiumMap]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CesiumMap);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
