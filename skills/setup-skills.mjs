import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO_ROOT = fileURLToPath(new URL('../', import.meta.url));

export function setupSkills(root = REPO_ROOT) {
  const source = path.resolve(root, 'skills');
  const parent = path.resolve(root, '.claude');
  const link = path.join(parent, 'skills');
  const relative = path.relative(parent, source);

  if (!fs.statSync(source).isDirectory()) throw new Error(`技能目录不存在：${source}`);
  fs.mkdirSync(parent, { recursive: true });

  const existing = fs.lstatSync(link, { throwIfNoEntry: false });
  if (existing) {
    if (existing.isSymbolicLink()) {
      if (fs.readlinkSync(link) === relative) return link;
    } else {
      // core.symlinks=false 时，Git 会将旧链接检出为仅含目标路径的文本文件。
      const content = existing.isFile() && existing.size < 4096
        ? fs.readFileSync(link, 'utf8').trim() : '';
      if (content !== '../skills' && content !== '..\\skills'
        && !/^(?:[A-Za-z]:[\\/]|\/)[^\r\n]*[\\/]skills[\\/]?$/.test(content)) {
        throw new Error(`拒绝覆盖非链接的文件或目录：${link}`);
      }
    }
    fs.unlinkSync(link);
  }

  try {
    fs.symlinkSync(relative, link, 'dir');
  } catch (error) {
    if (process.platform !== 'win32' || !['EPERM', 'EACCES'].includes(error.code)) throw error;
    fs.symlinkSync(source, link, 'junction');
    console.log('当前 Windows 权限不允许符号链接，已生成本机绝对路径目录联接（Git 忽略）。');
  }
  return link;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    console.log(`技能链接已就绪：${setupSkills()}`);
  } catch (error) {
    console.error(`技能链接生成失败：${error.message}`);
    process.exitCode = 1;
  }
}
