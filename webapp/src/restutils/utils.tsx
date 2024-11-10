import fetch from "isomorphic-fetch";

interface Headers {
    [key: string]: string;
}

let _headers: Headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};
const localStorage = window.localStorage;

let _hostname: string;

if (process.env.NODE_ENV !== 'production') {
    // Code will be removed from production build.
    _hostname = 'localhost:3041';
} else {
    _hostname = window.location.host;
}

export function isJSONEmpty(json: Record<string, unknown>): boolean {
    return Object.keys(json).length === 0;
}

export function clearBrowserStorage(user: string): void {
    try {
        localStorage.setItem("isAuthenticated", "false");
        localStorage.setItem("token", "");
        localStorage.setItem("user", user);
    } catch (e) {
        console.error("clearBrowserStorage failed:", e);
    }
}

export function headers(upload: boolean = false): Headers {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const token = localStorage.getItem("token");

    if (isAuthenticated && token) {
        const jwtToken = `JWT ${token}`;

        _headers = upload
            ? { 'Accept': 'application/json', 'Authorization': jwtToken }
            : { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': jwtToken };
    }

    return _headers;
}

export function upload_headers(): Headers {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const token = localStorage.getItem("token");

    if (isAuthenticated && token) {
        const jwtToken = `JWT ${token}`;

        _headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': jwtToken
        };
    }

    return _headers;
}

export async function rest_call(uri: string, options: RequestInit): Promise<any> {
    const url = `http://${_hostname}${uri}`;
    console.log("rest_call: url:", url);

    try {
        const response = await fetch(url, options);
        console.log("rest_call:", response);

        if (!response.ok) {
            const error = response.status === 401
                ? { status: 401, msg: "Unauthorized", statusText: "Unauthorized" }
                : { status: response.status, statusText: response.statusText, msg: response.statusText };
            return { result: {}, error };
        } else {
            console.log("rest_call: ok");
            return response.json();
        }
    } catch (err) {
        console.error("fetch error:", err);
        // const error = { status: 800, statusText: err.toString() };
        const error = {
            status: 800,
            statusText: err instanceof Error ? err.message : String(err)
        };
        return Promise.reject(error);
    }
}

export function download_file(uri: string, options: RequestInit): Promise<Response> {
    const url = `https://${_hostname}${uri}`;
    return fetch(url, options);
}

export function parseJSON(response: Response): Promise<any> {
    if (response.ok) {
        return response.json();
    }
    return Promise.reject(response);
}

export function updateHeaders(newHeaders: Headers): void {
    _headers = { ..._headers, ...newHeaders };
    Object.keys(_headers).forEach((key) => {
        if (_headers[key] === undefined) {
            delete _headers[key];
        }
    });
}
