
// When isolatedModules is enabled in tsconfig, we need to use 'export type' for type exports
export type AlertResult = 
  | { success: true; warning?: string; results?: any[] }
  | { success: false; error: string; results?: any[] };

export type RecordingStatus = "idle" | "loading" | "recording" | "stopping" | "sending" | "sent";
