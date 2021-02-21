#!/usr/bin/env node
const chalk = require("chalk");
const readline = require("readline");
const os = require("os");
const path = require("path");
const fs = require("fs-extra");
const packageDependencies = require("../template/package/dependence.json");
const packageJson = require("../template/package/package.json");
const { exec } = require("child_process");
const webpackTemplate = require("../template/webpack/webpack.config");


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * 安装配置
 */
const createOptions = {
    rootDir: '',  // 程序目录
    workDir: '', // 工作目录
    name: '',
    cssLoader: "sass",
    packageFile: {},
    typescript: false,
};

const greeting = chalk.white.bold("Welcome to apusic app create application!");

const warning = chalk.white.bold("(we only support react temporarily.)");

console.log(greeting, warning);

start();

async function start() {
    initEnvironment();
    await setCss();
    setDependencies();
    createWebpackConfig();
    copyFiles();

    exec(`cd ${createOptions.workDir} && git init`, (err, stdout, stderr) => {
        if (err) {
            console.log(chalk.red("git init failed"));
            return;
        }

        console.log(chalk.greenBright.bold("Success, please run npm or yarn install in your project."));
    });
}


function initEnvironment() {
    if (process.argv.length < 3 || !process.argv[2]) {
        console.log(chalk.red("need project name"));
        process.exit(-1);
    }

    packageJson.name = createOptions.name = process.argv[2];
    createOptions.rootDir = path.resolve(__dirname, '../');
    createOptions.workDir = path.resolve(process.cwd(), createOptions.name);

    //check typescript
    if(process.argv.includes("--typescript")){
        createOptions.typescript = true;
    }

    if (fs.existsSync(createOptions.workDir)) {
        console.log(chalk.red("project directory is already exist!"));
        process.exit(-1);
    }
}

/**
 * css编译器选择
 */
async function setCss() {
    // check css loaders
    const cssLoaders = ["less", "sass"];
    const cssText = cssLoaders.join(",");

    const inputCssCompileText = chalk.white.bold(`please input css loader: (${cssText}) ${os.EOL}`);

    return await new Promise(resolve => {
        rl.question(inputCssCompileText, answer => {
            if (cssLoaders.includes(answer)) {
                createOptions.cssLoader = answer;
            } else {
                const invalid = chalk.red("invalid css compile!");
                console.log(invalid);
                rl.close();
                process.exit(-1);
            }

            rl.close();

            resolve(answer);
        })
    });
}

/**
 * 设置依赖
 */
function setDependencies() {
    let merge = {
        dependencies: packageDependencies.dependencies,
        devDependencies: {}
    };

    if (createOptions.cssLoader === 'sass') {
        merge.devDependencies = Object.assign({}, packageDependencies.devDependencies, packageDependencies.sass);
    }

    if (createOptions.cssLoader === 'less') {
        merge.devDependencies = Object.assign({}, packageDependencies.devDependencies, packageDependencies.less);
    }

    createOptions.packageFile = Object.assign(packageJson, merge);

    //  after check css then we create dir
    fs.mkdirSync(createOptions.workDir, {recursive: true});

    const packageFile = path.resolve(createOptions.workDir, 'package.json');
    let writer = fs.createWriteStream(packageFile);
    writer.write(JSON.stringify(createOptions.packageFile, null, 2));
    writer.close();
}

function createWebpackConfig(){
    let template = webpackTemplate.template;
    const outputFile =  path.resolve(createOptions.workDir, 'webpack.config.js');

    if(createOptions.cssLoader === 'less'){
        template = template.replace(/sass-loader/g, "less-loader");
        template = template.replace(/scss/g, "less");
    }

    if(createOptions.typescript){
        template = template.replace(/index.jsx/g, "index.tsx");
    }

    // copy sass webpack.config.js
    let writer = fs.createWriteStream(outputFile);
    writer.write(template);
    writer.close();
}

/**
 * 拷贝关键模板
 */
function copyFiles(){
    const src = {
        tsConfig: path.resolve(createOptions.rootDir, 'template/tsconfig.json'),
        babelConfig:  path.resolve(createOptions.rootDir, 'template/.babelrc'),
        typeConfig:  path.resolve(createOptions.rootDir, 'template/declaration.d.ts'),
        publicDir: path.resolve(createOptions.rootDir, 'template/public'),
        eslintConfig: path.resolve(createOptions.rootDir, 'template/.eslintrc'),
        gitIgnoreConfig: path.resolve(createOptions.rootDir, 'template/gitignore.tpl'),
    };

    if(createOptions.typescript){
        src.sourceDir = path.resolve(createOptions.rootDir, 'template/ts')
    } else {
        src.sourceDir = path.resolve(createOptions.rootDir, 'template/js')
    }

    const des = {
        tsConfig: path.resolve(createOptions.workDir, 'tsconfig.json'),
        babelConfig:  path.resolve(createOptions.workDir, '.babelrc'),
        typeConfig:  path.resolve(createOptions.workDir, 'declaration.d.ts'),
        sourceDir: path.resolve(createOptions.workDir, 'src'),
        publicDir: path.resolve(createOptions.workDir, 'public'),
        eslintConfig: path.resolve(createOptions.workDir, '.eslintrc'),
        gitIgnoreConfig: path.resolve(createOptions.workDir, '.gitignore'),
    };

    if(createOptions.typescript){
        // copy tsconfig.json
        fs.copySync(src.tsConfig, des.tsConfig);

        //copy types file
        fs.copySync(src.typeConfig, des.typeConfig);
    }

    // copy git ignore
    fs.copySync(src.gitIgnoreConfig, des.gitIgnoreConfig);

    // copy babelrc
    fs.copySync(src.babelConfig, des.babelConfig);

    //copy eslint file
    fs.copySync(src.eslintConfig, des.eslintConfig);

    // copy source files
    if (!fs.existsSync(des.sourceDir)){
        fs.mkdirSync(des.sourceDir, {recursive: true});
        fs.copySync(src.sourceDir, des.sourceDir);
    }

    // copy public dir
    if (!fs.existsSync(des.publicDir)){
        fs.mkdirSync(des.publicDir, {recursive: true});
        fs.copySync(src.publicDir, des.publicDir);
    }
}
