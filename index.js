#!/usr/bin/env node
const fs = require('fs');
const {extname, resolve, relative} = require('path');
const {TextDecoder} = require('util');

const jschardet = require('jschardet');
const {prompt} = require('inquirer');

const decoders = {};

async function dir_pathes(path) {
  const pathes = [];
  const dir = await fs.promises.opendir(path);
  for await (const dirent of dir) {
    if (dirent.isDirectory()) {
      pathes.push(resolve(path, dirent.name));
    }
  }
  return pathes;
}

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

async function process_dir(dir, outfilename) {
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

async function main() {
  const dirs = await dir_pathes('.');

  let run = true;

  console.log('Bonjour Papa!');

  await new Promise(resolve => setTimeout(resolve, 500));

  const STOP = `c'est bon j'ai ce tout ce qu'il me faut !`;

  while (run) {

    const {dir} = await prompt([
      {
        name: 'dir',
        message: 'Quel dossier souhaites-tu lister ?',
        type: 'list',
        choices: [...dirs, STOP]
      }
    ]);

    if (dir === STOP) {
      break ;
    }

    let output, override;
    while (true) {
      const answer = await prompt([
        {
          name: 'output',
          message: 'Quel nom souhaites-tu donner à la liste ?',
          type: 'string',
          default: dir + '-list.txt',
          validate: answer => extname(answer) === '.txt' ? true : 'le nom de fichier doit se terminer par .txt !'
        },
        {
          name: 'override',
          message: `un fichier portant ce nom existe déjà. Souhaites-tu vraiment l'écraser ?`,
          type: 'confirm',
          default: false,
          when: ({output}) => fs.existsSync(output)
        }
      ]);

      output = answer.output;
      override = answer.override;

      if (output && override !== false) {
        break ;
      }
    }

    await process_dir(dir, output);
    console.log(`c'est fait !`);
  }
}

main();
