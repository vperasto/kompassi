export interface CompassState {
  heading: number;
  accuracy: number;
  isAbsolute: boolean;
}

export interface PermissionState {
  granted: boolean;
  required: boolean;
}

export type CardinalPoint = {
  label: string;
  degree: number;
};