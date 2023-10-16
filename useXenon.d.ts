import XenonInterface from 'xenon-view-sdk';

declare module 'xenon-view-sdk/useXenon' {
    export const useXenon : (apiKey: string) => XenonInterface;
}
