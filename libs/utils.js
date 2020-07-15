const fs = require('fs');
const {resolve} = require('path');

async function get_pathes(path, mode) {
  const pathes = [];
  const dir = await fs.promises.opendir(path);
  for await (const dirent of dir) {
    if (mode === 'file' && dirent.isFile()) {
      pathes.push(resolve(path, dirent.name));
    } else if (mode === 'dir' && dirent.isDirectory()) {
      pathes.push(resolve(path, dirent.name));
    }
  }
  return pathes;
}

async function file_pathes(path) {
  return get_pathes(path, 'file');
}

async function dir_pathes(path) {
  return get_pathes(path, 'dir');
}

module.exports = {file_pathes, dir_pathes};
