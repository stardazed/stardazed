/**
 * audio/device - audio interface
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */
let sharedAudioContext_;
/**
 * @internal
 */
function sharedAudioContext() {
    if (!sharedAudioContext_) {
        if ("AudioContext" in window) {
            sharedAudioContext_ = new AudioContext();
        }
        else if ("webkitAudioContext" in window) {
            sharedAudioContext_ = new webkitAudioContext();
        }
        else {
            throw new Error("WebAudio is not supported.");
        }
    }
    return sharedAudioContext_;
}
function makeAudioDevice() {
    return {
        ctx: sharedAudioContext()
    };
}

/**
 * @stardazed/audio - audio device
 * Part of Stardazed
 * (c) 2015-Present by Arthur Langereis - @zenmumbler
 * https://github.com/stardazed/stardazed
 */

export { sharedAudioContext, makeAudioDevice };
//# sourceMappingURL=index.esm.js.map
