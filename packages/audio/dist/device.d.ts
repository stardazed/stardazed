/**
 * audio/device - audio interface
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
/**
 * @internal
 */
export declare function sharedAudioContext(): AudioContext;
export interface AudioDevice {
    ctx: AudioContext;
}
export declare function makeAudioDevice(): AudioDevice;
