#!/bin/bash

# 部署脚本
echo "开始部署..."

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 创建生产环境配置文件
if [ ! -f .env ]; then
    echo "创建生产环境.env文件..."
    cp .env.production .env
    echo "⚠️  请编辑.env文件设置你的安全密码！"
    echo "⚠️  当前密码是默认值，请立即修改！"
fi

# 启动应用
echo "启动应用..."
gunicorn -c gunicorn.conf.py wsgi:app