importScripts("../comlink.min.js");
class Fetch {
    constructor() {
        this._baseUrl = "";
        this._defaultHeaders = {};
        this._defaultBody = {};
    }

    getBaseUrl() {
        return this._baseUrl;
    }

    getDefaultHeaders() {
        return this._defaultHeaders;
    }

    getDefaultBody() {
        return this._defaultBody;
    }

    setBaseUrl(baseUrl) {
        this._baseUrl = baseUrl;
    }

    setDefaultHeaders(defaultHeaders) {
        this._defaultHeaders = defaultHeaders;
    }

    setDefaultBody(defaultBody) {
        this._defaultBody = defaultBody;
    }

    async get(endpoint = '') {
        const response = await fetch(this.getBaseUrl() + endpoint)
        const data = await response.json();
        return data;
    }

    async post(endpoint = '', body = undefined, headers = {}) {
        this._send('POST', endpoint, body, headers);
    }

    async put(endpoint = '', body = undefined, headers = {}) {
        this._send('PUT', endpoint, body, headers);
    }

    async delete(endpoint = '', body = undefined, headers = {}) {
        this._send('DELETE', endpoint, body, headers);
    }

    async _send(method, endpoint = '', body = undefined, headers = {}) {
        const response = await fetch(this.getBaseUrl() + endpoint)
        const data = await response.json();
        return data;
    }
}

Comlink.expose({ Fetch }, self);