import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { setupSkills } from '../../skills/setup-skills.mjs';

function fixture(t) {
  const base = fs.mkdtempSync(path.join(tmpdir(), 'mono 技能测试 '));
  const root = path.join(base, '原始目录');
  fs.mkdirSync(path.join(root, 'skills', 'demo'), { recursive: true });
  fs.writeFileSync(path.join(root, 'skills', 'demo', 'SKILL.md'), '测试技能');
  t.after(() => fs.rmSync(base, { recursive: true, force: true }));
  return { base, root };
}

function assertLinked(root) {
  const link = path.join(root, '.claude', 'skills');
  assert.ok(fs.lstatSync(link).isSymbolicLink());
  assert.equal(fs.realpathSync(link), fs.realpathSync(path.join(root, 'skills')));
  assert.equal(fs.readFileSync(path.join(link, 'demo', 'SKILL.md'), 'utf8'), '测试技能');
}

test('优先生成相对链接，重复执行仍可加载技能', (t) => {
  const { root } = fixture(t);
  const symlink = fs.symlinkSync;
  const calls = [];
  t.mock.method(fs, 'symlinkSync', (...args) => {
    calls.push(args);
    return symlink(...args);
  });
  const link = setupSkills(root);
  assert.equal(calls[0][0], path.join('..', 'skills'));
  assert.equal(calls[0][2], 'dir');
  assertLinked(root);
  const count = calls.length;
  setupSkills(root);
  assertLinked(root);
  if (!path.isAbsolute(fs.readlinkSync(link))) assert.equal(calls.length, count);
});

test('仓库移动到不同目录后可重新生成有效链接', (t) => {
  const { base, root } = fixture(t);
  setupSkills(root);
  const moved = path.join(base, '新目录 含空格');
  fs.renameSync(root, moved);
  setupSkills(moved);
  assertLinked(moved);
});

test('替换绝对路径旧链接，但不删除其目标内容', (t) => {
  const { base, root } = fixture(t);
  const old = path.join(base, '旧技能目录');
  fs.mkdirSync(old);
  fs.writeFileSync(path.join(old, 'keep.txt'), '保留');
  fs.mkdirSync(path.join(root, '.claude'));
  fs.symlinkSync(old, path.join(root, '.claude', 'skills'), 'junction');
  setupSkills(root);
  assertLinked(root);
  assert.equal(fs.readFileSync(path.join(old, 'keep.txt'), 'utf8'), '保留');
});

test('修复 Git 将旧链接检出为路径文本的情况', (t) => {
  const { root } = fixture(t);
  fs.mkdirSync(path.join(root, '.claude'));
  const link = path.join(root, '.claude', 'skills');
  for (const content of ['../skills', '..\\skills', 'E:/另一台电脑/mono-uihub/skills']) {
    fs.writeFileSync(link, content);
    setupSkills(root);
    assertLinked(root);
    fs.unlinkSync(link);
  }
});

test('拒绝覆盖真实目录或无关文件', (t) => {
  const { root } = fixture(t);
  const link = path.join(root, '.claude', 'skills');
  fs.mkdirSync(link, { recursive: true });
  fs.writeFileSync(path.join(link, 'keep.txt'), '保留');
  assert.throws(() => setupSkills(root), /拒绝覆盖/);
  assert.equal(fs.readFileSync(path.join(link, 'keep.txt'), 'utf8'), '保留');
  fs.rmSync(link, { recursive: true });
  fs.writeFileSync(link, '无关内容');
  assert.throws(() => setupSkills(root), /拒绝覆盖/);
  assert.equal(fs.readFileSync(link, 'utf8'), '无关内容');
});

test('技能源目录缺失时不改动已有路径', (t) => {
  const { root } = fixture(t);
  fs.rmSync(path.join(root, 'skills'), { recursive: true });
  assert.throws(() => setupSkills(root), { code: 'ENOENT' });
  assert.equal(fs.existsSync(path.join(root, '.claude')), false);
});

test('Windows 无符号链接权限时使用本机目录联接', { skip: process.platform !== 'win32' }, (t) => {
  const { root } = fixture(t);
  const symlink = fs.symlinkSync;
  const calls = [];
  t.mock.method(fs, 'symlinkSync', (...args) => {
    calls.push(args);
    if (args[2] === 'dir') throw Object.assign(new Error('权限不足'), { code: 'EPERM' });
    return symlink(...args);
  });
  setupSkills(root);
  assert.equal(calls[1][0], path.join(root, 'skills'));
  assert.equal(calls[1][2], 'junction');
  assertLinked(root);
  const moved = path.join(path.dirname(root), '联接迁移');
  fs.renameSync(root, moved);
  setupSkills(moved);
  assertLinked(moved);
});

test('非权限错误不得被 Windows 回退掩盖', (t) => {
  const { root } = fixture(t);
  t.mock.method(fs, 'symlinkSync', () => {
    throw Object.assign(new Error('无可用空间'), { code: 'ENOSPC' });
  });
  assert.throws(() => setupSkills(root), { code: 'ENOSPC' });
});

test('命令从任意工作目录执行仍定位到脚本所在仓库', (t) => {
  const { root, base } = fixture(t);
  const script = path.join(root, 'skills', 'setup-skills.mjs');
  fs.copyFileSync(fileURLToPath(new URL('../../skills/setup-skills.mjs', import.meta.url)), script);
  const output = execFileSync(process.execPath, [script], { cwd: base, encoding: 'utf8' });
  assert.match(output, /技能链接已就绪/);
  assertLinked(root);
  assert.equal(fs.existsSync(path.join(base, '.claude')), false);
});
