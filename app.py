import requests
import openai
import pymysql
from flask import Flask,render_template,request,jsonify,session


app=Flask(__name__)
app.secret_key = 'fauihfaiefjalieuhfkj'

#导航网页
@app.route("/")
def index():
    return render_template("index.html")

#登录路由
@app.route("/index/login",methods=['POST'])
def login():
    data=request.get_json()
    username=data['username']
    password=data['password']
    connect_login = pymysql.connect(
        host='localhost',
        user='root',
        password='ren20090920',
        database='ai_learn',
        charset='utf8mb4',
    )
    cursor = connect_login.cursor()
    cursor.execute(
        "select id,username,password from users where username = %s",
        (username,)
    )
    user = cursor.fetchone()
    cursor.close()
    connect_login.close()
    if user is None:
        return jsonify({
            'success':False,
            'message':'用户不存在',
            'needregister':True
        })
    user_id,db_username,db_password=user
    if password != db_password:
        return jsonify({'success':False,'message':'密码错误'})
    session['user_id'] = user_id
    session['username'] = db_username
    return jsonify({'success':True,'message':'旅行者,欢迎回来!','username':db_username})

#注册路由
@app.route("/index/register", methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    password = data['password']
    if len(password)<6:
        return jsonify({
            'success':False,
            'message':'密码必须大于6个字符'
        })
    connect_register = pymysql.connect(
        host='localhost',
        user='root',
        password='ren20090920',
        database='ai_learn',
        charset='utf8mb4',
    )
    cursor = connect_register.cursor()
    #查询用户名是否已经存在
    cursor.execute('select id from users where username = %s',(username,))
    if cursor.fetchone() is not None:
        cursor.close()
        connect_register.close()
        return jsonify({'success':False,'message':'用户名已存在'})
    #在sql中加入新用户
    cursor.execute(
        'insert into users (username,password) values(%s,%s)',
        (username,password)
    )
    connect_register.commit()
    new_user_id = cursor.lastrowid
    cursor.close()
    connect_register.close()
    session['user_id'] = new_user_id
    session['username'] = username
    return jsonify({'success':True,'message':'注册成功!','username':username})

#检测登录状态路由
@app.route("/index/check_login")
def check_login():
    if 'user_id' in session:
        return jsonify({'loggedin':True,'username':session['username']})
    return jsonify({'loggedin': False})

#退出登录
@app.route("/index/logout")
def logout():
    session.clear()
    return jsonify({'success': True,'message':'已退出'})

#漏洞地图网页
@app.route("/map")
def map_page():
    return render_template("map.html")

if __name__=="__main__":
    app.run(debug=True)