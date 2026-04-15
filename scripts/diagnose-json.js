
// Use built-in fetch


async function testApi(url) {
    try {
        const res = await fetch(url);
        const text = await res.text();
        console.log(`URL: ${url}`);
        console.log(`Status: ${res.status}`);
        console.log(`Content Length: ${text.length}`);
        console.log('Raw Content (first 2000 chars):');
        console.log(text.slice(0, 2000));

        try {
            JSON.parse(text);
            console.log('JSON is valid');
        } catch (e) {
            console.error('JSON Parse Error:', e.message);
            const pos = parseInt(e.message.match(/position (\d+)/)?.[1] || '0');
            if (pos > 0) {
                console.log('Surrounding text at error position:');
                console.log(text.slice(Math.max(0, pos - 20), pos + 20));
            }
        }
    } catch (e) {
        console.error('Fetch error:', e.message);
    }
}

const baseUrl = 'http://localhost:3000';
testApi(`${baseUrl}/api/user/stats`);
testApi(`${baseUrl}/api/achievements`);
