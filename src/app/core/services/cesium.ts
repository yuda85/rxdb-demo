import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as Cesium from 'cesium';

export interface CesiumConfig {
  baseLayerPicker?: boolean;
  fullscreenButton?: boolean;
  geocoder?: boolean;
  homeButton?: boolean;
  infoBox?: boolean;
  sceneModePicker?: boolean;
  selectionIndicator?: boolean;
  timeline?: boolean;
  navigationHelpButton?: boolean;
  navigationInstructionsInitiallyVisible?: boolean;
  requestRenderMode?: boolean;
  maximumRenderTimeChange?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CesiumService implements OnDestroy {
  private viewer: Cesium.Viewer | null = null;
  private viewerSubject = new BehaviorSubject<Cesium.Viewer | null>(null);

  public viewer$ = this.viewerSubject.asObservable();

  constructor() {
    // Set Cesium configuration
    (window as any).CESIUM_BASE_URL = '/cesium/';

    // Configure Cesium Ion token if you have one
    // Cesium.Ion.defaultAccessToken = 'your_token_here';
  }

  /**
   * Initialize Cesium viewer
   */
  initializeViewer(container: HTMLElement, config: CesiumConfig = {}): Cesium.Viewer {
    if (this.viewer) {
      console.warn('Cesium viewer already initialized');
      return this.viewer;
    }

    const defaultConfig: CesiumConfig = {
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: true,
      infoBox: true,
      sceneModePicker: true,
      selectionIndicator: true,
      timeline: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      requestRenderMode: true,
      maximumRenderTimeChange: Infinity
    };

    const finalConfig = { ...defaultConfig, ...config };

    try {
      this.viewer = new Cesium.Viewer(container, finalConfig);

      // Optional: Add default imagery provider
      this.setupDefaultImagery();

      // Optional: Configure performance settings
      this.configurePerformance();

      this.viewerSubject.next(this.viewer);

      console.log('Cesium viewer initialized successfully');
      return this.viewer;
    } catch (error) {
      console.error('Failed to initialize Cesium viewer:', error);
      throw error;
    }
  }

  /**
   * Get the current viewer instance
   */
  getViewer(): Cesium.Viewer | null {
    return this.viewer;
  }

  /**
   * Check if viewer is initialized
   */
  isInitialized(): boolean {
    return this.viewer !== null;
  }

  /**
   * Fly to a location
   */
  flyTo(destination: Cesium.Cartesian3 | Cesium.Rectangle) {
    if (!this.viewer) {
      throw new Error('Cesium viewer not initialized');
    }

    return this.viewer.camera.flyTo({
      destination: destination
    });
  }

  /**
   * Fly to an entity
   */
  flyToEntity(entity: Cesium.Entity): Promise<boolean> {
    if (!this.viewer) {
      throw new Error('Cesium viewer not initialized');
    }

    return this.viewer.flyTo(entity);
  }

  /**
   * Set the camera view
   */
  setView(longitude: number, latitude: number, height: number = 10000000): void {
    if (!this.viewer) {
      throw new Error('Cesium viewer not initialized');
    }

    this.viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height)
    });
  }

  /**
   * Add an entity to the scene
   */
  addEntity(entityOptions: Cesium.Entity.ConstructorOptions): Cesium.Entity {
    if (!this.viewer) {
      throw new Error('Cesium viewer not initialized');
    }

    return this.viewer.entities.add(new Cesium.Entity(entityOptions));
  }

  /**
   * Remove an entity from the scene
   */
  removeEntity(entity: Cesium.Entity): boolean {
    if (!this.viewer) {
      throw new Error('Cesium viewer not initialized');
    }

    return this.viewer.entities.remove(entity);
  }

  /**
   * Clear all entities
   */
  clearEntities(): void {
    if (!this.viewer) {
      throw new Error('Cesium viewer not initialized');
    }

    this.viewer.entities.removeAll();
  }

  /**
   * Force a render frame
   */
  render(): void {
    if (this.viewer) {
      this.viewer.scene.requestRender();
    }
  }

  /**
   * Setup default imagery
   */
  private setupDefaultImagery(): void {
    if (!this.viewer) return;

    // You can customize the default imagery provider here
    this.viewer.imageryLayers.removeAll();
    this.viewer.imageryLayers.addImageryProvider(
      new Cesium.OpenStreetMapImageryProvider({
        url: 'https://tile.openstreetmap.org/'
      })
    );
  }

  /**
   * Configure performance settings
   */
  private configurePerformance(): void {
    if (!this.viewer) return;

    // Enable request render mode for better performance
    this.viewer.scene.requestRenderMode = true;
    this.viewer.scene.maximumRenderTimeChange = Infinity;

    // Disable fog for better performance
    this.viewer.scene.fog.enabled = false;

    // Configure frame rate
    this.viewer.targetFrameRate = 60;
  }

  /**
   * Destroy the viewer and clean up resources
   */
  destroyViewer(): void {
    if (this.viewer) {
      try {
        this.viewer.destroy();
        this.viewer = null;
        this.viewerSubject.next(null);
        console.log('Cesium viewer destroyed');
      } catch (error) {
        console.error('Error destroying Cesium viewer:', error);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroyViewer();
  }
}
