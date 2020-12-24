#!/usr/bin/env node

import fse from 'fs-extra'
import chalk from 'chalk'



const cmd = async () => {
  const __cwd = process.cwd()
  const { scripts } = await fse.readJSON(`${__cwd}/package.json`)
  const rows = Object.entries(scripts).map(([ name, value ]) => TableLogger.row(name, value))
  const lines = TableLogger.lines(rows)
  for (const { key, value, pad } of lines) {
    console.log(`${chalk.red(`${key}:`)}${pad}${chalk.cyan(value)}`)
  }
}

const TableLogger = {
  row: (key, value) => ({
    key, value, length: key?.length ?? 0
  }),
  lines: (rows) => {
    const maxLength = rows.slice().sort((a, b) => b.length - a.length)[0].length + 1
    const pad = (str) => TableLogger._pad(maxLength, str)
    return rows.map(({ key, value }) => ({
      pad: pad(key),
      key,
      value
    }))
  },
  _pad: (requiredLength, string) => {
    const missingLength = requiredLength - string.length
    const missingSpaces = Array(missingLength).fill(' ').join('')
    return missingSpaces
  }
}

cmd().then(() => {
  process.exit(0)
}).catch((err) => {
  console.error(err)
  process.exit(1)
})
