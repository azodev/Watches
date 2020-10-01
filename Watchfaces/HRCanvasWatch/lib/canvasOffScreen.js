/* eslint-disable no-restricted-globals */
import { wrap, expose } from 'comlink';
export class BaseEntity {
    constructor(options) {
        this.rAF = 0;
        this.state = {};
        this.canvas = options.canvas;
        this.isWorker = options.isWorker;
    }
    getState() {
        return this.state;
    }
    setState(newState = {}) {
        this.state = Object.assign(Object.assign({}, this.state), newState);
    }
}
/**
 * @param  {} canvas - HTMLCanvasElement
 * @param  {} workerUrl - path to a worker file
 */
export function createOffscreenCanvas({ canvas, workerUrl }, data, forceMainThread = false) {
    return new Promise((resolve, reject) => {
        if (canvas.transferControlToOffscreen && !forceMainThread) {
            try {
                const worker = new Worker(workerUrl);
                const offscreen = canvas.transferControlToOffscreen();
                worker.addEventListener('message', (event) => {
                    if (event.data === 'ready') {
                        const proxy = wrap(worker);
                        resolve(proxy);
                    }
                });
                worker.postMessage({
                    message: 'init',
                    options: Object.assign({ canvas: offscreen, isWorker: true }, data),
                }, [offscreen]);
            }
            catch (err) {
                reject(err);
            }
        }
        else {
            const script = document.createElement('script');
            script.src = workerUrl;
            script.async = true;
            script.onload = () => {
                resolve(window[workerUrl](Object.assign({ canvas, isWorker: false }, data)));
                window[workerUrl] = null;
            };
            script.onerror = (err) => reject(err);
            document.head.appendChild(script);
        }
    });
}
export function initializeWorker(factory) {
    self.addEventListener('message', ({ data: { message, options } }) => {
        if (message === 'init') {
            expose(factory(options));
            self.postMessage('ready');
        }
    });
}