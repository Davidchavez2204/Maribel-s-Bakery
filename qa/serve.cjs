const http=require('http'),fs=require('fs'),path=require('path');
// Servidor estático mínimo para las pruebas: sirve out/ con la Content-Security-Policy de netlify.toml.
const root=process.argv[2] ?? path.join(__dirname,'..','out');
const toml=fs.readFileSync(path.join(root,'..','netlify.toml'),'utf8');
const csp=toml.match(/Content-Security-Policy = "([^"]+)"/)[1];
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.woff2':'font/woff2','.png':'image/png','.svg':'image/svg+xml','.txt':'text/plain','.xml':'application/xml'};
http.createServer((req,res)=>{let u=decodeURIComponent(req.url.split('?')[0]);let f=path.join(root,u);if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');
if(!fs.existsSync(f)){res.writeHead(404);return res.end();}
res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream','Content-Security-Policy':csp});fs.createReadStream(f).pipe(res);}).listen(4173,()=>console.log('Sirviendo '+root+' en http://localhost:4173 (Ctrl+C para salir)'));
