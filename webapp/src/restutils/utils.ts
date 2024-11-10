export function headers(includeContentType = false): HeadersInit {
    const header: HeadersInit = {
        'Accept': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, data, progress'
    };

    if (includeContentType) {
        header['Content-Type'] = 'application/json';
    }

    return header;
} 