const fs = require('fs');
const {extname, resolve, relative} = require('path');

const {TextDecoder} = require('util');
const jschardet = require('jschardet');
const decoders = {};

async function txt_pathes(path) {
  const pathes = [];
  const dir = await fs.promises.opendir(path);
  for await (const dirent of dir) {
    if (dirent.isDirectory()) {
      pathes.push(...await txt_pathes(resolve(path, dirent.name)));
    } else if (extname(dirent.name) === '.txt') {
      pathes.push(resolve(path, dirent.name));
    }
  }
  return pathes;
}

async function captvty(dir, outfilename) {
  const fullpath = resolve(__dirname, dir);

  const pathes = await txt_pathes(fullpath);

  let result = '';
  pathes.forEach(path => {
    const relativepath = relative(fullpath, path);
    const dashline = relativepath
      .replace(/^/, '# ')
      .replace(/$/, ' #')
      .replace(/./g, '#');
    const buff = fs.readFileSync(path);

    let {encoding} = jschardet.detect(buff);
    
    if (!encoding) {
      return ;
    }
    
    if (!decoders[encoding]) {
      decoders[encoding] = new TextDecoder(encoding);
    }
    
    const str = decoders[encoding].decode(buff);

    result += `${dashline}\n# ${relativepath} #\n${dashline}\n${str}\n\n`;
  });

  fs.writeFileSync(outfilename, result);
}

module.exports = {captvty};
