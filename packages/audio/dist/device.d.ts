/**
 * @internal
 */
export declare function sharedAudioContext(): AudioContext;
export interface AudioDevice {
    ctx: AudioContext;
}
export declare function makeAudioDevice(): AudioDevice;
