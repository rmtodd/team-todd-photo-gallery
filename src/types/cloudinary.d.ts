// Type definitions for Cloudinary Upload Widget
// Based on: https://gist.github.com/iykekings/6432ea675943ccb766915e989bb70683

declare namespace cloudinary {
  // Callback for createUploadWidget
  type UploadWidgetCallback = (
    error: Error | null,
    result: UploadWidgetResult
  ) => void;

  // Main function to create the widget
  function createUploadWidget(
    options: UploadWidgetOptions,
    callback: UploadWidgetCallback
  ): UploadWidget;

  // The widget instance interface
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

  // Options for creating the widget
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

  // The result object from the callback
  interface UploadWidgetResult {
    event:
      | 'success'
      | 'abort'
      | 'batch-cancelled'
      | 'close'
      | 'display-changed'
      | 'publicid'
      | 'queues-end'
      | 'queues-start'
      | 'retry'
      | 'show-completed'
      | 'source-changed'
      | 'tags'
      | 'upload-added';
    info: UploadWidgetResultInfo;
  }

  // The 'info' object within the result
  interface UploadWidgetResultInfo {
    // For 'success' event
    secure_url?: string;
    public_id?: string;
    width?: number;
    height?: number;
    format?: string;
    [key: string]: any; // Allow other properties
  }
} 