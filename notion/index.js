const domain = "example.com";
const startPage = "https://www.notion.so/link/to/your/public/page";

addEventListener('fetch', event => {
    event.respondWith(fetchAndApply(event.request))
});

/**
 * @param {Request} request
 * @returns {Response}
 */
async function fetchAndApply(request) {
    if (request.method === 'OPTIONS') {
        if (request.headers.get('Origin') !== null &&
            request.headers.get('Access-Control-Request-Method') !== null &&
            request.headers.get('Access-Control-Request-Headers') !== null) {
            // Handle CORS pre-flight request.
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, HEAD, POST,PUT, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                }
            })
        } else {
            // Handle standard OPTIONS request.
            return new Response(null, {headers: {'Allow': 'GET, HEAD, POST, PUT, OPTIONS'}})
        }
    }

    let response;

    const url = new URL(request.url);
    const pathname = url.pathname;
    if (pathname.startsWith('/app') && pathname.endsWith('js')) {
        response = await fetch(`https://www.notion.so${pathname}`);
        let body = await response.text();
        body = body.replace(/www.notion.so/g, domain);
        body = body.replace(/notion.so/g, domain);
        try {
            response = new Response(body, response);
            // response = new Response(response.body, response)
            response.headers.set('Content-Type', 'application/x-javascript');
            console.log('get rewrite app.js');
        } catch (err) {
            console.log(err);
        }
    } else if (pathname.startsWith('/api')) {
        response = await fetch(`https://www.notion.so${pathname}`, {
            body: request.body, // must match 'Content-Type' header
            headers: {
                'content-type': 'application/json;charset=UTF-8',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36'
            },
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
        })
        response = new Response(response.body, response);
        response.headers.set('Access-Control-Allow-Origin', '*');
    } else if (pathname === `/`) {
        const pageUrlList = startPage.split('/');
        const redirectUrl = `https://${domain}/${pageUrlList[pageUrlList.length - 1]}`;
        return Response.redirect(redirectUrl, 301)
    } else {
        response = await fetch(`https://www.notion.so${pathname}`, {
            body: request.body, // must match 'Content-Type' header
            headers: request.headers,
            method: request.method, // *GET, POST, PUT, DELETE, etc.
        })
    }
    return response
}