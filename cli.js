#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const program = require('commander')
const npm = require('npm')
const extend = require('extend')
const ini = require('ini')
const echo = require('node-echo')
const open = require('open')
const async = require('async')
const only = require('only')
const request = require('request')
const ora = require('ora')

const PKG = require('./package.json')
const registries = require('./registries.json')
const YARNRC = path.join(process.env.HOME, '.yarnrc')
const NPMRMRC = path.join(process.env.HOME, '.npmrmrc')

program
	.version(PKG.version)

program
	.command('ls')	
	.description('List all the registries')
	.action(onList)

program
	.command('current')	
	.description('Show current registry name')
	.action(showCurrent)

program
	.command('add <registry> <url> [home]')
	.description('Add one custom registry')
	.action(onAdd)

program
	.command('use <registry>')	
	.description('Change registry to registry')
	.action(onUse)

program
	.command('del <registry>')
	.description('Delete one custom registry')
	.action(onDel)

program
	.command('home <registry> [browser]')
	.description('Open the homepage of registry with optional browser')
	.action(onHome)

program
	.command('test [registry]')	
	.description('Show response time for specific or all registries')
	.action(onTest)

program
	.command('help')	
	.description('Print this help')
	.action(program.help)

program
	.parse(process.argv)

/*//////////////// cmd methods /////////////////*/
function onList() {
	getCurrentRegistry(cur => {
		const allRegistry = getAllRegistry()
		
		const arr = []
		Object.keys(allRegistry).forEach(key => {
			const item = allRegistry[key]
			const prefix = item.registry === cur ? '* ' : '  '

			arr.push(prefix + key + line(key, 8) + item.registry)
		});

		printMsg(['', ...arr, ''])
	})
}
function showCurrent() {
	getCurrentRegistry(cur => {
		const allRegistries = getAllRegistry()

		Object.keys(allRegistries).forEach(key => {
			const item = allRegistries[key]
			if (item.registry === cur) {
				printMsg([key])
				return
			}
		})
	})
}
function onAdd(name, url, home) {
	const customRegistries = getCustomRegistry()
	if (customRegistries.hasOwnProperty(name)) return

	const config = customRegistries[name] = {}
	if (url[url.length - 1] !== '/') url += '/'
	config.registry = url

	if (home) {
		config.home = home
	}
	
	setCustomRegistry(customRegistries, (err) => {
		if (err) return exit(err)
		printMsg(['', `  add registry ${name} success`, ''])
	})
}
function onUse(name) {
	const allRegistries = getAllRegistry()
	if (allRegistries.hasOwnProperty(name)) {
		const registry = allRegistries[name]
		fs.writeFile(YARNRC, `registry "${registry.registry}"`, err => {
			if (err) throw err
			printMsg(['', `  YARN Registry has been set to: ${registry.registry}`,''])
		})
	
		npm.load(err => {
			if (err) return exit(err)
			npm.commands.config(['set', 'registry', registry.registry], err => {
				if (err) return exit(err)
				const newR = npm.config.get('registry')
				printMsg(['', `  Npm Registry ha been set to: ${newR}`, ''])
			})
		})
	} else {
		printMsg(['', `  Not find registry: ${name}`, ''])
	}

}
function onDel(name) {
	const customRegistries = getCustomRegistry()

	if (!customRegistries.hasOwnProperty(name)) return

	getCurrentRegistry(cur => {
		if (customRegistries[name].registry == cur) {
			onUse('npm')	
		}

		delete customRegistries[name]
	
		setCustomRegistry(customRegistries, err => {
			if (err) return exit(err)
			printMsg(['', `  Delete Registry ${name} success`, ''])
		})
	})

}
function onHome(name, browser) {
	const allRegistries = getAllRegistry()
	const home = allRegistries[name] && allRegistries[name].home

	if (home) {
		const args = [home]
		if (browser) args.push(browser)
		open.apply(null, args)
	}
}
function onTest(name) {
	const allRegistries = getAllRegistry()
	let toTest
	if (name) {
		if (!allRegistries.hasOwnProperty(name)) return
		toTest = only(allRegistries, name)
	} else {
		toTest = allRegistries
	}
	
	const spinner = ora('Loading').start()

	async.map(Object.keys(toTest), (name, cbk) => {
		const registry = allRegistries[name]

		const sTime = +new Date()
		request(registry.registry + 'pedding', err => {
			const eTime = +new Date()
			cbk(null, {
				name,
				registry: registry.registry,
				time: eTime - sTime,
				error: err ? true : false
			})
		})
	}, (err, results) => {
		getCurrentRegistry(cur => {
			const msg = []
			results.forEach(result => {
				const prefix = result.registry === cur ? '* ' : '  '
				const suffix = result.error ? 'Fetch Error' : result.time + 'ms'
				msg.push(prefix + result.name + line(result.name, 8) + suffix)
			})

			spinner.stop()
			printMsg(['', ...msg, ''])
		})
	})
}

/*//////////////// helper methods /////////////////*/
function getCurrentRegistry(cbk) {
	npm.load(function(err) {
		if (err) exit(err)
		const current = npm.config.get('registry')
		cbk(current)
	})
}
function getAllRegistry() {
	return extend({}, registries, getCustomRegistry())
}
function getCustomRegistry() {
	const obj = fs.existsSync(NPMRMRC) ? ini.parse(fs.readFileSync(NPMRMRC, 'utf-8')) : {}
	return extend({}, obj)
}
function setCustomRegistry(config, cbk) {
	echo(ini.stringify(config), '>', NPMRMRC, cbk)
}

/*//////////////// tools /////////////////*/
function line(str, len) {
	const line = new Array(Math.max(1, len - str.length)).join('-')
	return ' ' + line + ' '
}
function printMsg(infos) {
	infos.forEach(info => {
		console.log(info)
	})
}
function printErr(err) {
	console.error(`an error occured: ${err}`)
}
function exit(err) {
	printErr(err)
	process.exit(1)
}
