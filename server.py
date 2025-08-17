from flask import Flask, request, jsonify, send_from_directory
import os
import json
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

app = Flask(__name__)

# 数据保存路径
DATA_FILE = "blog_posts.json"

# 加载数据
def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

# 保存数据
def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# 提供静态文件
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('.', filename)

@app.route("/blog_posts.json", methods=["GET"])
def get_posts():
    return jsonify(load_data())

@app.route("/verify_password", methods=["POST"])
def verify_password():
    try:
        data = request.get_json()
        password = data.get('password', '')
        # 从环境变量读取密码
        correct_password = os.getenv('ADMIN_PASSWORD', '123456')
        
        if password == correct_password:
            return jsonify({"success": True})
        else:
            return jsonify({"success": False}), 401
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/save_posts", methods=["POST"])
def save_posts():
    try:
        data = request.get_json()
        # 验证密码
        password = data.get('password', '')
        correct_password = os.getenv('ADMIN_PASSWORD', '123456')
        
        if password != correct_password:
            return "Unauthorized", 401
            
        # 移除密码字段，只保存文章数据
        posts_data = {k: v for k, v in data.items() if k != 'password'}
        save_data(posts_data)
        return "Posts saved successfully"
    except Exception as e:
        return f"Error saving posts: {str(e)}", 500

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
