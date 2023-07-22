#!/usr/bin/env node

import {
	cancel,
	confirm,
	intro,
	isCancel,
	outro,
	spinner,
	text,
} from '@clack/prompts'
import fs from 'node:fs'
import path from 'node:path'
import { exec } from 'node:child_process'
import util from 'node:util'

const execSync = util.promisify(exec)

async function copy(from, to) {
	const template = path.join(process.cwd(), from)
	const destination = path.join(process.cwd(), to)
	await fs.cpSync(template, destination, { recursive: true })
}

async function main() {
	console.log()

	intro('Welcome to Animotion!')

	// create the project step
	const dir = await text({
		message: 'Where should I create your project?',
		placeholder: '(press Enter to use the current directory)',
	})

	if (isCancel(dir)) {
		cancel('Operation cancelled.')
		return process.exit(0)
	}

	let cwd = dir || '.'

	// check if directory is empty
	if (fs.existsSync(cwd)) {
		if (fs.readdirSync(cwd).length > 0) {
			const wantToContinue = await confirm({
				message: 'Directory not empty. Continue?',
			})

			if (isCancel(wantToContinue)) {
				cancel('Operation cancelled.')
				return process.exit(0)
			}

			if (!wantToContinue) {
				return process.exit(1)
			}
		}
	}

	// copy the template
	copy('template', cwd)

	// dependencies step
	const dependencies = await confirm({
		message: 'Install dependencies? (requires pnpm)',
	})

	if (isCancel(dependencies)) {
		cancel('Operation cancelled.')
		return process.exit(0)
	}

	if (dependencies) {
		const s = spinner()

		s.start('Installing dependencies...')

		// try {
		// 	await execSync('pnpm i')
		// } catch (e) {
		// 	console.log()
		// 	console.log('pnpm is required.')
		// 	console.log('You can run `npm i -g pnpm.`')
		// 	return process.exit(0)
		// }

		s.stop('Installed dependencies.')
	}

	outro('Done. 🪄')

	console.log('Start the development server:')
	console.log('pnpm run dev')
	console.log()
	console.log('To close the dev server, press `Ctrl + C`.')
	console.log('💬 Discord: https://joyofcode.xyz/invite')
}

main().catch(console.error)
