// Type definitions for Cloudinary Upload Widget
// Based on: https://gist.github.com/iykekings/6432ea675943ccb766915e989bb70683

declare namespace cloudinary {
  function createUploadWidget(
    options: UploadWidgetOptions,
    callback: (error: any, result: UploadWidgetResult) => void
  ): UploadWidget;

  interface UploadWidget {
    open: () => void;
    close: () => void;
    update: (options: UploadWidgetOptions) => void;
    hide: () => void;
    show: () => void;
    minimize: () => void;
    isShowing: () => boolean;
    isMinimized: () => boolean;
    destroy: () => void;
  }

  interface UploadWidgetOptions {
    cloudName: string;
    uploadPreset: string;
    sources?: Array<
      | 'local'
      | 'url'
      | 'camera'
      | 'image_search'
      | 'google_drive'
      | 'dropbox'
      | 'instagram'
      | 'shutterstock'
    >;
    googleApiKey?: string;
    searchBySites?: string[];
    searchByRights?: boolean;
    multiple?: boolean;
    maxFiles?: number;
    maxFileSize?: number;
    clientAllowedFormats?: string[];
    folder?: string;
    cropping?: boolean;
    croppingAspectRatio?: number;
    styles?: object;
    fonts?: object;
    text?: object;
    resourceType?: 'auto' | 'image' | 'video' | 'raw';
    transformation?: Array<object>;
    showUploadMoreButton?: boolean;
    autoMinimize?: boolean;
    showAdvancedOptions?: boolean;
    showPoweredBy?: boolean;
    // Add other options as needed from documentation
  }

  interface UploadWidgetResult {
    event: string;
    info: any; // Can be more specific based on event type
  }
} 