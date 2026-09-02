declare module 'react-native-knob' {
  import { FC } from 'react';
  
  export interface KnobProps {
    value: number;
    min?: number;
    max?: number;
    onValueChange?: (value: number) => void;
    color?: string;
    trackColor?: string;
    backgroundColor?: string;
    radius?: number;
    strokeWidth?: number;
    margin?: number;
    padding?: number;
  }

  export const Knob: FC<KnobProps>;
}
