import { join } from 'path'
import { spawn, ChildProcess, exec } from 'child_process'
import { watch, rollup, OutputOptions } from 'rollup'
const minimist = require('minimist')
import chalk from 'chalk'
const ora = require('ora')
import electron from 'electron'
import { config } from 'dotenv'
import { waitOn } from './utils'
import options from './rollup.config'
import { main } from '../package.json'

console.log(111, options, process.argv, __dirname)

config({ path: join(__dirname, '../.env') })

const argv = minimist(process.argv.slice(2))
console.log(222, argv)
const opts = options(argv.env)
const TAG = '[build-main.ts]'
const spinner = ora(`${TAG} Electron build...`)

if (argv.watch) {
    waitOn({ port: process.env.PORT as string }).then(msg => {
        const watcher = watch(opts)
        let child: ChildProcess
        watcher.on('change', filename => {
            const log = chalk.green(`change -- ${filename}`)
            console.log(TAG, log)
        })
        watcher.on('event', ev => {
            if (ev.code === 'END') {
                console.log(12345, ev)
                if (child) child.kill()
                // child = spawn(electron as any, [join(__dirname, `../${main}`)], { stdio: 'inherit' })
                child = exec("electron .", {})
            } else if (ev.code === 'ERROR') {
                console.error(2335, ev, ev.error)
            }
        })
    })
} else {
    spinner.start()
    rollup(opts)
        .then(build => {
            spinner.stop()
            console.log(TAG, chalk.green('Electron build successed.'))
            build.write(opts.output as OutputOptions)
        })
        .catch(error => {
            spinner.stop()
            console.error(`\n${TAG} ${chalk.red('构建报错')}\n`, error, '\n')
        })
}