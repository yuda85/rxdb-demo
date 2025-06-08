import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  AfterViewInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';

import * as Cesium from 'cesium';
import { CesiumConfig, CesiumService } from '../services/cesium';

@Directive({
  selector: '[appCesium]',
  standalone: true
})
export class CesiumDirective implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() cesiumConfig: CesiumConfig = {};
  @Input() initialView?: { longitude: number; latitude: number; height?: number };
  @Input() autoResize: boolean = true;

  @Output() viewerReady = new EventEmitter<Cesium.Viewer>();
  @Output() viewerError = new EventEmitter<Error>();

  private viewer: Cesium.Viewer | null = null;
  private resizeObserver?: ResizeObserver;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private cesiumService: CesiumService
  ) {}

  ngOnInit(): void {
    // Prepare the container
    this.prepareContainer();
  }

  ngAfterViewInit(): void {
    // Initialize Cesium after view is ready
    setTimeout(() => {
      this.initializeCesium();
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialView'] && this.viewer && changes['initialView'].currentValue) {
      this.setInitialView();
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  /**
   * Prepare the container element
   */
  private prepareContainer(): void {
    const element = this.elementRef.nativeElement;

    // Set default styles if not already set
    if (!element.style.width) {
      element.style.width = '100%';
    }
    if (!element.style.height) {
      element.style.height = '400px';
    }

    // Ensure the container has a position context
    if (getComputedStyle(element).position === 'static') {
      element.style.position = 'relative';
    }
  }

  /**
   * Initialize Cesium viewer
   */
  private initializeCesium(): void {
    try {
      const element = this.elementRef.nativeElement;

      // Check if element is visible and has dimensions
      if (element.offsetWidth === 0 || element.offsetHeight === 0) {
        console.warn('Cesium container has no dimensions. Retrying...');
        setTimeout(() => this.initializeCesium(), 100);
        return;
      }

      this.viewer = this.cesiumService.initializeViewer(element, this.cesiumConfig);

      // Set initial view if provided
      if (this.initialView) {
        this.setInitialView();
      }

      // Setup auto-resize if enabled
      if (this.autoResize) {
        this.setupAutoResize();
      }

      this.viewerReady.emit(this.viewer);

    } catch (error) {
      console.error('Failed to initialize Cesium:', error);
      this.viewerError.emit(error as Error);
    }
  }

  /**
   * Set the initial camera view
   */
  private setInitialView(): void {
    if (this.viewer && this.initialView) {
      const { longitude, latitude, height = 10000000 } = this.initialView;
      this.cesiumService.setView(longitude, latitude, height);
    }
  }

  /**
   * Setup auto-resize functionality
   */
  private setupAutoResize(): void {
    if (!this.viewer || typeof ResizeObserver === 'undefined') {
      return;
    }

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0 && this.viewer) {
          // Trigger Cesium resize
          this.viewer.resize();
          this.viewer.scene.requestRender();
        }
      }
    });

    this.resizeObserver.observe(this.elementRef.nativeElement);
  }

  /**
   * Get the viewer instance
   */
  getViewer(): Cesium.Viewer | null {
    return this.viewer;
  }

  /**
   * Force resize the viewer
   */
  resize(): void {
    if (this.viewer) {
      this.viewer.resize();
      this.viewer.scene.requestRender();
    }
  }

  /**
   * Clean up resources
   */
  private cleanup(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    // Note: We don't destroy the viewer here since it might be shared
    // The service will handle viewer lifecycle
    this.viewer = null;
  }
}
