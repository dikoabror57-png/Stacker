"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORTED_EXTENSIONS = exports.SUPPORTED_MIMES = exports.MAX_TOTAL_BYTES = exports.MAX_FRAMES = exports.MAX_FRAME_BYTES = exports.DEFAULT_PARAMS = void 0;
exports.DEFAULT_PARAMS = {
    combineMethod: 'median',
    sigmaClipSigma: 3,
    sigmaClipIter: 5,
    enableEnhancement: false,
    enhancementMode: 'denoise',
    psfEstimate: 'auto',
    psfSigma: null,
    displayStretch: {
        type: 'linear',
        percentileLow: 0.5,
        percentileHigh: 99.5,
        asinhScaling: 1000,
        gamma: 1,
    },
};
exports.MAX_FRAME_BYTES = 500 * 1024 * 1024; // 500 MB
exports.MAX_FRAMES = 100;
exports.MAX_TOTAL_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB
exports.SUPPORTED_MIMES = [
    'image/jpeg',
    'image/png',
    'image/tiff',
    'image/x-tiff',
];
exports.SUPPORTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.fits', '.fit', '.fz']);
