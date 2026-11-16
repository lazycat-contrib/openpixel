#!/bin/sh
set -eu
# OpenPixel 需要运行的全部文件：首页 + 目录/逻辑脚本 + 全部作品目录 + 使用说明。
# docs/、.github/ 等仓库元数据不进入 LPK。
rm -rf site
mkdir -p site
cp index.html style.css catalog.js app.js manifest.json README.md site/
cp -r works site/works
