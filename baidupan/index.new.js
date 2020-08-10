import {BDUSS, STOKEN} from './config.json';

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function handleRequest(request) {
    let response;
    const url = request.url;
    if (request.method === 'POST') {
        if (url.includes('download')) {
            return await download(request);
        } else {

        }
    } else {
        // TODO handle help
    }
    return response;
}


/**
 * @param {string} randsk
 * @returns {Object}
 */
function headerWithRandsk(randsk) {
    return {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.1234.56 Safari/537.36',
        'cookie': `BDUSS=${BDUSS}; STOKEN=${STOKEN}; BDCLND=${randsk}`
    }
}

const htmlResponse = {headers: {'content-type': 'text/html; charset=UTF-8'}};

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function download(request) {
    const form = await request.formData();
    const formData = new FormData();
    formData.append('encrypt', '0');
    formData.append('extra', `{"sekey": "${decodeURIComponent(form.get('randsk'))}"}`);
    formData.append('fid_list', `[${form.get('fs_id')}]`);
    formData.append('primaryid', form.get('share_id'));
    formData.append('uk', form.get('uk'));
    formData.append('product', 'share');
    formData.append('type', 'nolimit');
    const resp = await fetch(`https://pan.baidu.com/api/sharedownload?app_id=250528&channel=chunlei&clienttype=12&sign=${form.get('sign')}&timestamp=${form.get('time')}&web=1`, {
        method: 'POST',
        body: formData,
        headers: headerWithRandsk(form.get('randsk'))
    });
    const json = await resp.json();

    if (json['errno'] === 0) {
        // TODO handle get download link successful
    } else {
        // TODO handle get download link failed
    }
    return new Response(null, htmlResponse)
}

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function generate(request) {
    const form = await request.formData();

    const formData = new FormData();
    formData.append('pwd', form.get('pwd'));
    let resp = await fetch(`https://pan.baidu.com/share/verify?channel=chunlei&clienttype=0&web=1&app_id=250528&surl=${form.get('surl').substring(1)}`, {
        method: 'POST',
        body: formData,
        headers: {
            'user-agent': 'netdisk',
            'referer': 'https://pan.baidu.com/disk/home'
        }
    });
    const json = await resp.json();
    const randsk = json['errno'] === 0 ? json['randsk'] : 1;

    let sign;
    if (randsk === 1)
        sign = 1;
    else {
        resp = await fetch(`https://pan.baidu.com/s/1${form.get('surl')}`, {
            method: 'GET',
            headers: headerWithRandsk(randsk)
        });
        const bodyText = await resp.text();
        const re = /yunData.setData\(({.+)\);/;
        if (bodyText.match(re))
            sign = JSON.parse(bodyText.match(re)[1]);
        else
            sign = 1;
    }

    if (sign !== 1) {
        sign = sign['sign'];

        resp = await fetch(`https://pan.baidu.com/share/list?app_id=250528&channel=chunlei&clienttype=0&desc=0&num=100&order=name&page=1&root=1&shareid=${sign['shareid']}&showempty=0&uk=${sign['uk']}&web=1`, {
            method: 'GET',
            headers: headerWithRandsk(randsk)
        });
        const fileJson = await resp.json();
    }


    return new Response(null, htmlResponse)
}