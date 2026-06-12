let is_register = false
let pending_url = ''
//打开弹窗
document.getElementById('login_button').addEventListener('click',function(e){
	e.preventDefault();
	document.getElementById('Mask_layer').classList.add('show');
	document.getElementById('login_model').classList.add('show');
	document.getElementById('login_model').classList.remove('register')
	is_register = false
});

//关闭弹窗
document.getElementById('close').addEventListener('click',function(e){
	e.preventDefault();
	pending_url = '';
	document.getElementById('Mask_layer').classList.remove('show');
	document.getElementById('login_model').classList.remove('show');
})

//获取输入框中的用户名和密码
document.getElementById('login_submit').addEventListener('click',async function(e){
	const username = document.getElementById('login_username').value.trim();
	const password = document.getElementById('login_password').value.trim();
	if (!username || !password) {
		alert('用户名或密码不能为空!');
		return;
	}
	if (is_register==true){
		const repeat_password = document.getElementById('repeat_password').value.trim();
		if (!repeat_password){alert('请再次输入密码');return;}
		if (repeat_password !== password){
			alert('两次密码不一致');
			document.getElementById('repeat_password').value='';
			return;
			}
		const respon = await fetch('/index/register',{
			method:'POST',
			headers:{'Content-Type':'application/json'},
			body:JSON.stringify({username,password}),
		});
		const result = await respon.json();
		alert(result.message)
		if (result.success){
			document.getElementById('Mask_layer').classList.remove('show');
			document.getElementById('login_model').classList.remove('show');
			user_button(result.username);
			if (pending_url) {
			        window.location.href = pending_url;
			        pending_url = '';
			    }
		}else{
			document.getElementById('login_password').value='';
			document.getElementById('login_password').focus();
			document.getElementById('repeat_password').value='';
		}
		return;
	}
	const respon = await fetch('/index/login',{
		method:'POST',
		headers:{'Content-Type':'application/json'},
		body:JSON.stringify({username:username,password:password})
	});
	const result = await respon.json();
	if (result.success) {
		alert(result.message);
		document.getElementById('Mask_layer').classList.remove('show');
		document.getElementById('login_model').classList.remove('show')
		user_button(result.username);
		if (pending_url) {
		        window.location.href = pending_url;
		        pending_url = '';
		    }
	}else if (result.needregister){
		if (confirm('用户不存在,是否注册')){
			document.getElementById('login_model').classList.add('register')
			is_register=true
			document.getElementById('repeat_password').focus();
		}
	}else{
		alert(result.message);
		document.getElementById('login_password').value='';
		document.getElementById('login_password').focus();
	}
});

// 页面自动检查是否登录
window.addEventListener('DOMContentLoaded', async function() {
	const resp = await fetch('/index/check_login');
	const data = await resp.json();
	if (data.loggedin){
		user_button(data.username);
	}
});

//登录按钮变为用户
function user_button(username) {
	    document.getElementById('login_button').style.display = 'none';
		document.getElementById('user_menu').style.display = 'block';
		document.getElementById('name_button').style.display='inline';
		document.getElementById('name_button').textContent= username;
		document.getElementById('username').textContent = username;
};

//点击用户名打开用户面板
document.getElementById('name_button').addEventListener('click',function(e){
	e.preventDefault();
	e.stopPropagation();
	document.getElementById('main_menu').classList.toggle('show')
})

document.getElementById('avatar_button').addEventListener('click',function(e){
	e.preventDefault();
	e.stopPropagation();
	document.getElementById('main_menu').classList.toggle('show');
});

window.addEventListener('click',function(e){
	const menu = document.getElementById('user_menu');
	if (!menu.contains(e.target)){
		document.getElementById('main_menu').classList.remove('show');
	}
});

//退出登录
document.getElementById('logout_button').addEventListener('click',async function(){
	await fetch('/index/logout');
	window.location.href='/';
})

//跳转链接前先检查登录状态
document.querySelectorAll('.need_login').forEach(function(link) {
	link.addEventListener('click',async function(e) {
		e.preventDefault();
		const resp = await fetch('/index/check_login');
		const data = await resp.json();
		if (data.loggedin) {
			const target = link.getAttribute('href');
			if (target && target !== '#') {
				window.location.href = target;
			}
		} else {
			const target = link.getAttribute('href');
						if (target && target !== '#') {
							pending_url = target;
						}
			document.getElementById('Mask_layer').classList.add('show');
			document.getElementById('login_model').classList.add('show');
		}
	});
});
