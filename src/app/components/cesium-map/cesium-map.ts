import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { CesiumDirective } from './cesium.directive';
// import { CesiumService, CesiumConfig } from './cesium.service';
import * as Cesium from 'cesium';
import { CesiumDirective } from '../../core/directives/cesium';
import { CesiumConfig, CesiumService } from '../../core/services/cesium';

@Component({
  selector: 'app-cesium-map',
  standalone: true,
  imports: [CommonModule, CesiumDirective],
  template: `
    <div class="cesium-container">
      <div
        #cesiumContainer
        appCesium
        [cesiumConfig]="cesiumConfig"
        [initialView]="initialView"
        [autoResize]="true"
        (viewerReady)="onViewerReady($event)"
        (viewerError)="onViewerError($event)"
        class="cesium-viewer">
      </div>

      <div class="controls" *ngIf="viewer">
        <button (click)="flyToNewYork()">Fly to New York</button>
        <button (click)="flyToLondon()">Fly to London</button>
        <button (click)="addMarker()">Add Marker</button>
        <button (click)="clearMarkers()">Clear Markers</button>
        <button (click)="toggle3D()">Toggle 3D/2D</button>
      </div>
    </div>
  `,
  styles: [`
    .cesium-container {
      position: relative;
      width: 100%;
      height: 600px;
    }

    .cesium-viewer {
      width: 100%;
      height: 100%;
    }

    .controls {
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 1000;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .controls button {
      padding: 8px 16px;
      background: rgba(42, 42, 42, 0.8);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }

    .controls button:hover {
      background: rgba(42, 42, 42, 1);
    }
  `]
})
export class CesiumMapComponent implements OnInit {
  @ViewChild('cesiumContainer', { static: true }) cesiumContainer!: ElementRef;

  viewer: Cesium.Viewer | null = null;

  cesiumConfig: CesiumConfig = {
    homeButton: true,
    sceneModePicker: true,
    baseLayerPicker: false,
    navigationHelpButton: false,
    timeline: false,
    fullscreenButton: true,
    requestRenderMode: true
  };

  initialView = {
    longitude: -74.0060,  // New York
    latitude: 40.7128,
    height: 1000000
  };

  constructor(private cesiumService: CesiumService) {}

  ngOnInit(): void {
    console.log('CesiumMapComponent initialized');
  }

  onViewerReady(viewer: Cesium.Viewer): void {
    this.viewer = viewer;
    console.log('Cesium viewer ready!', viewer);

    // Example: Add some initial setup
    this.setupInitialScene();
  }

  onViewerError(error: Error): void {
    console.error('Cesium viewer error:', error);
  }

  private setupInitialScene(): void {
    if (!this.viewer) return;

    // Enable lighting based on sun/moon positions
    this.viewer.scene.globe.enableLighting = true;

    // Configure atmosphere
    this.viewer.scene.skyAtmosphere.show = true;

    // Add some example styling
    this.viewer.scene.globe.showWaterEffect = true;
  }

  flyToNewYork(): void {
    if (!this.viewer) return;

    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(-74.0060, 40.7128, 1000000),
      duration: 2.0
    });
  }

  flyToLondon(): void {
    if (!this.viewer) return;

    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(-0.1276, 51.5074, 1000000),
      duration: 2.0
    });
  }

  addMarker(): void {
    if (!this.viewer) return;

    const longitude = -74.0060 + (Math.random() - 0.5) * 0.1;
    const latitude = 40.7128 + (Math.random() - 0.5) * 0.1;

    this.cesiumService.addEntity({
      position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
      point: {
        pixelSize: 10,
        color: Cesium.Color.YELLOW,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      },
      label: {
        text: 'Random Marker',
        font: '12pt sans-serif',
        pixelOffset: new Cesium.Cartesian2(0, -40),
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE
      }
    });
  }

  clearMarkers(): void {
    this.cesiumService.clearEntities();
  }

  toggle3D(): void {
    if (!this.viewer) return;

    const scene = this.viewer.scene;
    const currentMode = scene.mode;

    if (currentMode === Cesium.SceneMode.SCENE3D) {
      scene.morphTo2D(2.0);
    } else {
      scene.morphTo3D(2.0);
    }
  }
}
