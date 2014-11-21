/*
    Simple localhost http server
    targets the `build` folder in current path as the server root
    optional: supply a port number as the only argument, defaults to `1337`
    depends: mime (should get included via package.json dev dependencies)
*/

var
http = require('http'),
path = require('path'),
fs = require('fs'),
mime = require('mime'),
// qs = require('querystring'),
script_root = process.cwd(),
url = require('url'),
server_ip = '127.0.0.1'
server_port = process.env['DEV_PORT'] || process.argv[2] || 1337;

var server = http.createServer(function (req, res) {
    var
    parts = url.parse(req.url),
    file_path = path.normalize(path.join(path.sep, parts.path));
    // chrooted

    console.log('> route: ' + req.url);
    console.log(JSON.stringify(parts, null, 4));

    console.log("CHRooted url: ", file_path);
    // // windows path hacking
    // file_path = file_path.replace(/^[^\\]+/, '');
    file_path = path.resolve(path.join(script_root, 'build', file_path));

    console.log("file path: ", file_path);

    var send_error = function send_error(code, message){
        console.trace();
        res.writeHead(code || 404, {'Content-Type': 'text/plain'});
        res.end( message || 'File not found');
    };

    var send_file = function send_file(path){
        console.trace();
        console.log(path);
        res.setHeader('Content-Type', mime.lookup(path));
        res.writeHead(200);
        fs.readFile(path, function(err, data){
            if(err)
                return res.end(path+"--"+JSON.stringify(err)+'--data was truncated--');
            if(data)
                return res.end(data);
        })
        // res.end('Hello World\n');
    };

    fs.stat(file_path, function(err, stats){
        if(err){
            return send_error(404);
        }

        if(stats.isDirectory()){
            // find index
            var
            suffixes = ['html', 'htm'];
            fs.readdir(file_path, function(err, files){
                if(err)
                    return send_error(500, 'unexpected server error');
                var
                file, i,
                isIndex = suffixes.some(function(ext, idx, arr){
                    file = 'index.'+ext;
                    if(files.indexOf(file) > -1){
                        return true;
                    }
                    return false;
                });

                console.log("isIndex: "+isIndex);

                if( isIndex )
                    return send_file(path.join(file_path, file));
                return send_error();
            });
        } else
            return send_file(file_path);
    });

});
server.listen(server_port, server_ip);

console.log('Script Root: '+script_root);
console.log('Server running at http://'+server_ip+':'+server_port+'/');