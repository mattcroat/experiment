#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import util from 'node:util'
import { exec } from 'node:child_process'
import {
	cancel,
	confirm,
	intro,
	isCancel,
	note,
	outro,
	spinner,
	text,
} from '@clack/prompts'

const execSync = util.promisify(exec)

async function copy(from, to) {
	const template = path.join(__dirname, '../template')
	const destination = path.join(process.cwd(), to)
	await fs.cpSync(template, destination, { recursive: true })
}

async function main() {
	console.log()

	intro('Welcome to Animotion!')

	// create the project
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
			const shouldContinue = await confirm({
				message: 'Directory not empty. Continue?',
			})

			if (isCancel(shouldContinue)) {
				cancel('Operation cancelled.')
				return process.exit(0)
			}

			if (!shouldContinue) {
				return process.exit(1)
			}
		}
	}

	// ask to install dependencies
	const dependencies = await confirm({
		message: 'Install dependencies? (requires pnpm)',
	})

	if (isCancel(dependencies)) {
		cancel('Operation cancelled.')
		return process.exit(0)
	}

	// copy the template
	await copy('template', cwd)

	if (dependencies) {
		const s = spinner()

		s.start('Installing dependencies...')

		try {
			await execSync('pnpm i')
		} catch (e) {
			console.log()
			console.log('📦️ pnpm is required:')
			console.log('npm i -g pnpm')
			return process.exit(0)
		}

		s.stop('Installed dependencies.')
	}

	outro('Done. 🪄')

	console.log('💿️ Start the development server:')
	console.log('pnpm run dev')
	console.log()
	console.log('💬 Discord')
	console.log('https://joyofcode.xyz/invite')
}

main().catch(console.error)
