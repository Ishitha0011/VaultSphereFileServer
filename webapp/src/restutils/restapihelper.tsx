/** Wrapper for REST API calls to server */

import fetch from 'isomorphic-fetch';
import { headers, parseJSON, rest_call, download_file } from './utils';
// import request from 'superagent';
import { v4 as uuidv4 } from 'uuid';

// Timeout for 1 hour = 3600*1000 ms
const _timeout = 3600000;

let _hostname: string;

if (process.env.NODE_ENV !== 'production') {
    // Code will be removed from production build.
    _hostname = 'localhost:3041';
} else {
    _hostname = window.location.host;
}

export function getHostName(): string {
    return _hostname;
}

export function getRESTApi(url: string, callback?: (response: any) => void): Promise<any> {
    const header = headers();

    const options: RequestInit = {
        method: "GET",
        headers: header
    };

    return rest_call(url, options);
}

export function downloadFile(url: string, mimetype: string, callback?: (response: any) => void): Promise<any> {
    const header = headers();
    header['Accept'] = mimetype;
    header["Content-Type"] = mimetype;

    const options: RequestInit = {
        method: "GET",
        headers: header
    };

    return download_file(url, options);
}

export function postRESTApi(url: string, reqBody: any): Promise<any> {
    const header = headers();

    const options: RequestInit = {
        method: "POST",
        headers: header,
        body: JSON.stringify(reqBody)
    };

    return rest_call(url, options);
}

export function postRESTApi2(url: string, reqBody: any): Promise<any> {
    const header = headers();

    const options: RequestInit = {
        method: "POST",
        headers: header,
        body: reqBody
    };

    return rest_call(url, options);
}

export async function postBinFile(
    image: any,
    file: File,
    progressHandler: (progress: any) => void,
    handler: (error?: any, response?: any) => void
): Promise<void> {
    const size = file.size;
    const chunk_size = 10000000; // chunk size = 10MB

    let start = 0;
    let end = Math.min(chunk_size, size);

    const uri = '/rest/uploadchunks';
    const url = `http://${_hostname}${uri}`;
    console.log("URL: ", url);

    while (end <= size) {
        const slice = file.slice(start, end);
        const progress = { start, end, size };

        const header = headers(true);
        header['Content-Type'] = 'application/octet-stream';
        header['data'] = JSON.stringify(image);
        header['progress'] = JSON.stringify(progress);

        const options: RequestInit = {
            method: "POST",
            headers: header,
            body: slice
        };

        const response = await fetch(url, options);
        const json = await response.json();
        progressHandler(json);

        start += chunk_size;
        end = Math.min(start + chunk_size, size);

        if (start >= size) {
            handler(undefined, json);
            break;
        }
    }
}

// export function postImage(
//     image: any,
//     file: File,
//     progressHandler: (event: ProgressEvent) => void,
//     handler: (error?: any, response?: any) => void
// ): void {
//     const header = headers(true);
//
//     request.post(`https://${_hostname}/rest/upload`)
//         .timeout(_timeout)
//         .set(header)
//         .field('data', JSON.stringify(image))
//         .attach('file', file)
//         .on('progress', progressHandler)
//         .end(handler);
// }
