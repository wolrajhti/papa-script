const fs = require('fs');

const csv = require('csv-parser');
const { resolve } = require('path');

async function glossary(file, output) {
  const results = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(file)
      .pipe(csv({separator: ';', headers: ['title', 'keywords']}))
      .on('data', data => {
        const keywords = data.keywords.split(';');
        keywords.forEach(keyword => {
          results.push(`${data.title};${keyword}`);
        });
      })
      .on('end', resolve)
      .on('error', reject);
  });

  fs.writeFileSync(output, results.join('\n'));
}

module.exports = {glossary};
