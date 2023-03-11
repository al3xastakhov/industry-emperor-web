/**
 * Settings that influence core/* modules behavior
 * e.g. tile(cell) size
 */
export namespace CoreSettings {
    export class Graphics {
        public static readonly	tileWidth = 128;
        public static readonly	tileHeight = 64;
        // static readonly	tileWidth = 64;
        // static readonly	tileHeight = 32;
    }

    export class Camera {
        public static readonly scaleDelta = 0.006;
    }
}

/**
 * Settings that influence game logic
 */
export namespace GameSettings {
    export class World {
        public static readonly size = 20;
    }
}
