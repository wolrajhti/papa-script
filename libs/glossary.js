const fs = require('fs');
const {TextDecoder} = require('util');

const csv = require('csv-parser');
const jschardet = require('jschardet');
const windows1252 = require('windows-1252');

const decoders = {};

async function glossary(file, output) {
  const results = [];

  const buff = fs.readFileSync(file);

  let {encoding} = jschardet.detect(buff);

  if (!encoding) {
    return ;
  }

  if (!decoders[encoding]) {
    if (encoding === 'windows-1252') {
      decoders[encoding] = {
        decode(buff) {
          return windows1252.decode(buff.toString('binary'));
        }
      };
    } else {
      decoders[encoding] = new TextDecoder(encoding);
    }
  }

  await new Promise((resolve, reject) => {
    fs.createReadStream(file)
      .pipe(csv({separator: ';', raw: true, headers: ['title', 'keywords']}))
      .on('data', raw => {
        const data = {
          title: decoders[encoding].decode(raw.title),
          keywords: decoders[encoding].decode(raw.keywords),
        };
        const keywords = data.keywords.split(';');
        keywords.forEach(keyword => {
          results.push(`${data.title};${keyword}`);
        });
      })
      .on('end', resolve)
      .on('error', reject);
  });

  const str = results.join('\n');

  if (encoding === 'windows-1252') {
    fs.writeFileSync(output, windows1252.encode(str));
  } else {
    fs.writeFileSync(output, str);
  }
}

module.exports = {glossary};
