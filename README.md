# ConCodeIt!

A block-based visual programming system for authoring interactive programs.

ConCodeIt stands for "concurrent" [CodeIt](https://github.com/hcrlab/code_it) and aims to make creating reactive, interactive robot programs easy for novice programmers.
ConCodeIt! is built with [Blockly](https://developers.google.com/blockly/) and is integrated with [cycle-robot-drivers](https://github.com/mjyc/cycle-robot-drivers). Currently, the system can be used to program a [tablet face robot](https://github.com/mjyc/tablet-robot-face), an idealized social robot.

## Demo

The three ConCodeIt interfaces discussed in ["ConCodeIt! A Comparison of Concurrency Interfaces in Block-based Visual Robot Programming"](https://www.researchgate.net/publication/342717357_ConCodeIt_A_Comparison_of_Concurrency_Interfaces_in_Block-Based_Visual_Robot_Programming):

1. [async](https://codesandbox.io/s/github/mjyc/concodeit/tree/master/pkgs/async)
1. [callback](https://codesandbox.io/s/github/mjyc/concodeit/tree/master/pkgs/callback)
1. [waitfor](https://codesandbox.io/s/github/mjyc/concodeit/tree/master/pkgs/waitfor)


## Getting Started

First, build packages by running

```
npm build
```

There are three versions of ConCodeIt. To run the the first version, do

```
cd pkgs/waitfor  # or callback or async
npm install
npm run
```
