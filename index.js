#!/usr/bin/env node
const fs = require('fs');
const {extname} = require('path');

const {prompt} = require('inquirer');

const {dir_pathes, file_pathes} = require('./libs/utils');
const {captvty} = require('./libs/captvty');
const {glossary} = require('./libs/glossary');

async function main() {
  let run = true;

  console.log('Bonjour Papa!');

  await new Promise(resolve => setTimeout(resolve, 500));

  const STOP = `c'est bon j'ai ce tout ce qu'il me faut !`;
  const CAPTVTY = 'Générer un fichier regroupant les résumés Captvty';
  const GLOSSARY = 'Aplatir un csv';

  while (run) {

    const {func} = await prompt([
      {
        name: 'func',
        message: 'Que souhaites-tu faire ?',
        type: 'list',
        choices: [CAPTVTY, GLOSSARY, STOP]
      }
    ]);

    if (func === STOP) {
      break ;
    }

    if (func ===  CAPTVTY) {
      const dirs = await dir_pathes('.');

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
  
      await captvty(dir, output);
      console.log(`c'est fait !`);
    } else if (func === GLOSSARY) {
      const files = (await file_pathes('.')).filter(name => extname(name) === '.csv');

      const {file} = await prompt([
        {
          name: 'file',
          message: 'Quel fichier csv souhaites-tu lister ?',
          type: 'list',
          choices: [...files, STOP]
        }
      ]);

      if (file === STOP) {
        break ;
      }

      let output, override;
      while (true) {
        const answer = await prompt([
          {
            name: 'output',
            message: 'Quel nom souhaites-tu donner à la liste ?',
            type: 'string',
            default: file + '-glossary.csv',
            validate: answer => extname(answer) === '.csv' ? true : 'le nom de fichier doit se terminer par .csv !'
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
  
      await glossary(file, output);
      console.log(`c'est fait !`);
    }
  }
}

main();
