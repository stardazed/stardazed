/// <reference path="libzmgame.d.ts" />
declare var webkitAudioContext: {
    prototype: AudioContext;
    new (): AudioContext;
};
interface Window {
    webkitAudioContext?: AudioContext;
    AudioContext?: AudioContext;
}
declare class SoundManager {
    context: AudioContext;
    constructor();
    loadSoundFile(filePath: string): Promise<AudioBuffer>;
}
