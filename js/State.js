import { MAX_SKELS, INITIAL_ROTATION } from "./constants/SKEL.js";


export class State {
    constructor() {
        this.selectedId = -1;  // -1: livestream; [0-3]: skels
        this.scrub = new Array(MAX_SKELS).fill(0);
        this.lock = false;
        this.rotation = INITIAL_ROTATION;
        this.maxFrames = new Array(MAX_SKELS).fill(1);
        const skelIndices = [];
        for (let i = 0; i < MAX_SKELS; i += 1) {
            skelIndices.push(i);
        }
        this.skelIndices = skelIndices;
    }

    initialize(maxFrames) {
        this.maxFrames = maxFrames;
        const skelIndices = [];
        for (let i = 0; i < MAX_SKELS; i += 1) {
            skelIndices.push(i);
        }
        this.skelIndices = skelIndices;
    }

    paginate(skelIndices, maxFrames) {
        this.skelIndices = skelIndices;
        this.maxFrames = maxFrames;
        this.scrub = new Array(MAX_SKELS).fill(0);
    };

    select(id = -1) {
        this.selectedId = id % MAX_SKELS;
        if (id >= 0) {
            this.scrub[this.selectedId] = 0;
        }
    }

    trace(index) {
        if (this.selectedId >= 0 && 0 <= index <= this.maxFrames[this.selectedId]) {
            this.scrub[this.selectedId] = index;
        }
    }

    toggle(state) {
        this.lock = state;
    }

    rotate(rotation) {
        this.rotation = rotation
    }

    update(delta) {
        for (let i = 0; i < MAX_SKELS; i += 1) {
            if (this.lock && i === this.selectedId) {
                // Do nothing
            }
            else if (this.maxFrames[i] > 1) {
                this.scrub[i] += delta;
                if (this.scrub[i] > this.maxFrames[i]) {
                    this.scrub[i] %= this.maxFrames[i];
                }

            }
        }
    }
}
