addEventListener('fetch', e => {
    e.respondWith(handleRequest(e.request))
});


/**
 * @param {Request} request
 * @returns {Response}
 */
async function handleRequest(request) {
    const reqUrl = new URL(request.url);
    const mkt = reqUrl.searchParams.get('mkt') || 'zh-CN';
    const idx = reqUrl.searchParams.get('idx') || 0;
    const download = reqUrl.searchParams.get('download') === '';

    const data = await (await fetch(`https://www.bing.com/HPImageArchive.aspx?format=js&idx=${idx}&n=1&mkt=${mkt}`)).json();
    const imgUrl = data['images'][0]['url'];
    if (imgUrl === undefined) {
        return new Response(null, {status: 404})
    }
    const filename = [];
    filename.push(data['images'][0]['startdate']);
    filename.push('_');
    const copyright = data['images'][0]['copyright'];
    filename.push(copyright.slice(0, copyright.indexOf(' (©')));
    filename.push('.jpg');

    let response = await fetch(`https://www.bing.com${data['images'][0]['url']}`);
    response = new Response(response.body, response);
    if (download === true) {
        response.headers.set('content-disposition', `attachment; filename=${encodeURIComponent(filename.join(''))}`);
    }
    return response;
}
