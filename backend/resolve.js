const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.resolveTxt('cluster0.e3vt7qr.mongodb.net', (err, records) => {
    if (err) console.error(err);
    else console.log(JSON.stringify(records));
});
