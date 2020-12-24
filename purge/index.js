import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { spawn } from 'child_process'

import fse from 'fs-extra'
import parse from 'minimist'
import chalk from 'chalk'
import { tryit } from 'radash/curry.js'
import { sum } from 'radash/array.js'
import minimatch from 'minimatch'


const ppurge = async ({
  dryrun = true,
  fast = false
}) => {

  const ignoreFile = await fse.readFile(`${process.env.HOME}/projects/.ppurge`, 'utf8')
  const rules = parseIgnoreRules(ignoreFile)

  // Stats
  const start = +new Date()

  const mobj = {}
  const isMatch = (f) => mobj[f] ? true : false

  for await (const f of getFiles(`${process.env.HOME}/projects`, isMatch)) {
    const match = getMatch(f, rules)
    if (match) {
      const size = fast === false ? await getTotalPathSize(f) : 0
      mobj[f] = {
        ...match,
        size
      }
    }
  }

  const end = +new Date()

  const matches = Object.values(mobj)
  const excludes = matches.filter(m => m.exclude)
  const includes = matches.filter(m => m.include)

  for (const ex of excludes) {
    console.log(`${chalk.green('keep:')}  ${ex.filename}`)
  }

  console.log(chalk.gray('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -'))

  for (const inc of includes) {
    console.log(`${chalk.red('purge:')} ${chalk.yellow(`[${bytesToSize(inc.size)}]`)} ${inc.filename}`)
  }

  const totalSize = bytesToSize(sum(includes, i => i.size))

  console.log(`${chalk.cyan('[ppurge]')} found ${chalk.red(totalSize)} purgable files (${includes.length}) in ${end - start}ms`)

  if (dryrun === true) return

  console.log(chalk.red('**PURGING**'))

  for (const inc of includes) {
    const lstat = await fse.lstat(inc.filename)
    if (lstat.isSymbolicLink()) {
      console.log('Skipping symlink: ', inc.filename)
      continue
    }
    await fse.remove(inc.filename)
  }

}

async function* getFiles(dir, isMatch) {
  const dirents = await fse.readdir(dir, { withFileTypes: true })
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name)
    yield res
    // If the file was a match then skip going through
    // the child paths. It will be either deleted or
    // ignored as a match.
    const wasMatch = isMatch && isMatch(res)
    if (wasMatch) continue
    if (dirent.isDirectory()) {
      yield* getFiles(res, isMatch)
    }
  }
}

const getTotalPathSize = async (path) => {
  let size = 0
  const [, stat] = await tryit(fse.stat)(path)
  if (stat.isDirectory()) {
    for await (const f of getFiles(path)) {
      const [err, stats] = await tryit(fse.stat)(f)
      if (err) continue // not very acurate... *shrug*
      size += stats.size
    }
  } else {
    size = stat.size
  }
  return size
}

const bytesToSize = (bytes) => {
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes == 0) return '0 Byte'
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
}

const getMatch = (filename, rules) => {
  const match = rules.find(r => minimatch(filename, r.pattern))
  if (!match) return null
  return {
    ...match,
    filename
  }
}

const parseIgnoreRules = (ignoreFile) => ignoreFile
  .split('\n')
  .map(l => l.trim())
  .filter(l => !l.startsWith('#'))
  .map(l => l.startsWith('!')
      ? { exclude: true, pattern: l.split('!')[1] }
      : { include: true, pattern: l })


ppurge(parse(process.argv)).then(() => {
  process.exit(0)
}).catch((err) => {
  console.error(err)
  process.exit(1)
})