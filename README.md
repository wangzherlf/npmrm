npmrm -- NPM/YARN registry manager
===

[![NPM version][npm-image]][npm-url]

`npmrm` can help you easy and fast switch between different npm/yarn registries, now include: `yarn`, `npm`, `cnpm`, `taobao`, `nj(nodejitsu)`, `rednpm`, `npmMirror`, `edunpm`, `tencent`

## Install
```
$ npm install -g npmrm
```

## Example
```
$ npmrm ls

  yarn --- https://registry.yarnpkg.com
  npm ---- https://registry.npmjs.org/
  cnpm --- http://r.cnpmjs.org/
* taobao - https://registry.npm.taobao.org/
  nj ----- https://registry.nodejitsu.com/
  rednpm - http://registry.mirror.cqupt.edu.cn/
  npmMirror  https://skimdb.npmjs.com/registry/
  edunpm - http://registry.enpmjs.org/
  tencent  https://mirrors.cloud.tencent.com/npm/
```

```
$ npmrm use cnpm

    Registry has been set to: http://r.cnpmjs.org/

```

## Usage
```
Usage: npmrm [options] [command]

Options:
  -V, --version                output the version number
  -h, --help                   display help for command

Commands:
  ls                           List all the registries
  current                      Show current registry name
  add <registry> <url> [home]  Add one custom registry
  use <registry>               Change registry to registry
  del <registry>               Delete one custom registry
  home <registry> [browser]    Open the homepage of registry with optional browser
  test [registry]              Show response time for specific or all registries
  help                         Print this help
```

## Registries

* [yarn](https://registry.yarnpkg.com)
* [npm](https://www.npmjs.org)
* [cnpm](http://cnpmjs.org)
* [taobao](http://npm.taobao.org)
* [nj](https://www.nodejitsu.com)
* [rednpm](http://npm.mirror.cqupt.edu.cn)
* [npmMirror](https://skimdb.npmjs.com)
* [edunpm](http://www.enpmjs.org)
* [tencent](https://mirrors.cloud.tencent.com/npm)

## Notice

Forked from [i5ting/yrm](https://github.com/i5ting/yrm) ---> Forked from [Pana/nrm](https://github.com/Pana/nrm)

When you use an other registry, you can not use the `publish` command.

## LICENSE
MIT

[npm-image]: https://img.shields.io/npm/v/npmrm.svg?style=flat-square
[npm-url]: https://npmjs.org/package/npmrm