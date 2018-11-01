# 1.自定义规则

## 1.1先新建js文件
```javascript
$.extend($.idealforms.rules, {
    //account 为自定义规则名 input是标签，value对应输入值
    account: function(input, value) {
        //这里验证account既可以是邮箱也可以是手机
        
        email= /^[^@]+@[^@]+\..{2,6}$/
        phone= /^1[34578]\d{9}$/
        try {
            if (!email.test(value) && !phone.test(value)){
                return false;
            }
        }catch (e) {
            return false;
        }
        return true;
    }
});
//为accout规则定义提示信息
$.extend($.idealforms.errors, {
    account: '请输入邮箱!'
});
```
## 1.2应用自建的规则
添加标签：
```html
<input  name="userName" type="text" data-idealforms-ajax="/user">
```
data-idealforms-ajax可以定义 ajax异步验证的请求url，返回true或false

```javascript
//javascript 初始化组件：
 $('.idealforms').idealforms({
            rules: {
                //input的name属性 ： '多个验证规则'
                'userName': 'required account ajax',
            },
            errors: {
                  //input的name属性 
                'userName': {
                    //可以复写作者提前定义好的提示信息  
                    //规则名 ： 提示信息
                    required:'请输入用户名',
                    //ajax请求中信息
                    ajax: '检查账号是否已注册......',
                    //ajax错误信息
                    ajaxError: '该用户已注册!'
                }
            },
            //点击submit按钮执行此function，invalid为不合法表单字段个数
            onSubmit: function(invalid, e) {
            
                e.preventDefault();
                if (invalid) {
                    alert(invalid +' fields!');
                } else {
                     $.post('/login', this.$form.serialize(), function(response) {
                         // do something with response
                     }, 'json');
                }
            }
        });
 ```
        
