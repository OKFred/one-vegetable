"use strict";
var ma=(()=>{
    let _data={
        AccessCode:'',
        CToken:'',
        TBToken:'',
        language:'en_US',//'zh_HK'
    };
    
	function languageQuery(language,ctoken){
		let What='国际站语言切换';
		let queryObj=prepareMsg(What);
        queryObj.request.data.language=language;
        queryObj.request.data.ctoken=ctoken;
		return queryObj;
	};
    
	function languageCheck(msg){
        let status,result;
        let data=msg.response.data;
        if (msg.response.net.redirected){
            status=0;
            result='未登录';
        }else if (!data || data.errorMessage){
            status=false;
            result='语言切换失败';
        }else if(data.status){
            status=true;
            result='语言切换成功';
        };
        msg.response.result=result;
        msg.response.status=status;
        return msg;
	};

	function accountMemberIdQuery(ctoken){
		let What='国际站查询账号ID';
        let queryObj = prepareMsg(What);
        queryObj.request.data.ctoken = ctoken;
		return queryObj;
	};

	function accountMemberIdCheck(msg){
        let status, result;
        let { data } = msg.response;
        if (data&&typeof(data)==='object'){
            status = true;
        }else{
            status = false;
        };
        result = data;
        msg.response.result=result;
        msg.response.status=status;
        return msg;
	};

	function accountEmailQuery(){
		let What='国际站查询账号邮箱';
		let queryObj=prepareMsg(What);
		return queryObj;
	};

	function accountEmailCheck(msg){
        if (!msg.response.net.ok){
            msg.response.result='未登录';
            msg.response.status = false;
            return msg;
        };
        let { data } = msg.response;
        let arr=data.split("\n");
        let emailStr=arr.find(str=>str.match(`<span class="J-email label-color-deep">`));
        if (!emailStr) {
            msg.response.result='未找到邮箱';
            msg.response.status = false;
            return msg;
        };
        let email = emailStr.replace(`<span class="J-email label-color-deep">`, "").replace(`:</span>`, "").trim();
        msg.response.result = email;
        msg.response.status = true;
        return msg;
    };

	function aliCRMQuery(memberId,_tb_token_){
		let What='国际站获取额外信息';
		let queryObj=prepareMsg(What);
		queryObj.request.data={
			"buyerLoginId": memberId,
			"_tb_token_": _tb_token_
		};
		return queryObj;
	};
	function aliCRMCheck(msg){
        if (!msg.response.data||!msg.response.data.data||msg.response.data.code=="REDIRECT"){
            msg.response.status=false;
            msg.response.result='MA账号退出登录';
            return msg;
        };
        let data=msg.response.data.data.data;
        if (!data || ! msg.response.data.data.data.buyerInfo){
            msg.response.status=false;
            msg.response.result='没有数据';
            return msg;
        };
        let buyerInfo=msg.response.data.data.data.buyerInfo;
        let { loginDays, registerDate } = buyerInfo;
        buyerInfo.contacts = buyerInfo.firstName + ' ' + buyerInfo.lastName;
        buyerInfo.loginDays=(loginDays=null)?'?':(loginDays==-1)?'?':loginDays; //登录天数
        buyerInfo.registerDate = (registerDate == null) ? '' : (registerDate == -1) ? '' : registerDate * 1000;    //注册时间
        if (buyerInfo.alicrmCustomerInfo) Object.assign(buyerInfo, buyerInfo.alicrmCustomerInfo);
        if (buyerInfo.buyerContactInfo) Object.assign(buyerInfo, buyerInfo.buyerContactInfo);
        buyerInfo.mobileNumber = (buyerInfo.mobileNumber == null) ? '' : buyerInfo.mobileNumber.replace(/-/g, "");
        buyerInfo.phoneNumber = (buyerInfo.phoneNumber == null) ? '' : buyerInfo.phoneNumber.replace(/-/g, "");        let newObj=Object.assign({}, data, buyerInfo);
        delete newObj['buyerInfo'];
        delete newObj['alicrmCustomerInfo'];
        delete newObj['buyerContactInfo'];
        msg.response.result=newObj;
        msg.response.status=true;
        return msg;
	};

	function developerRegisterQuery(userInfo, callbackUrl, _tb_token_){
		let What='国际站开发者注册';
        let queryObj = prepareMsg(What);
        let { userEmail, userName, userTel } = userInfo;
		queryObj.request.data._tb_token_=_tb_token_;
        queryObj.request.data.json={
            "isvName":userName,
            "isvPhone":userTel,
            "isvEmail": userEmail,
            "callbackUrl": callbackUrl,
        };
		return queryObj;
	};
	function developerRegisterCheck(msg){
        let data=msg.response.data;
        let status,result;
        if(data.isSuccess){
            result='已注册';
            status=true;
        }else if(data.errorMessage){
            result = data.errorMessage + data.errorCode;
            status=false;
        };
        msg.response.result=result;
        msg.response.status=status;
        return msg;
	};

	function developerAppKeyQuery(_tb_token_){
		let What='国际站获取AppKey';
		let queryObj=prepareMsg(What);
		queryObj.request.data._tb_token_=_tb_token_;
		return queryObj;
	};
	function developerAppKeyCheck(msg){
        let data=msg.response.data;
        let status,result;
        if(data.isSuccess){
            result=data.data[0].appKey;
            status=true;
        }else if(data.errorMessage){
            result='获取 AppKey 失败，尝试注册后再来';   //developerRegisterQuery
            status=false;
        };
        msg.response.result=result;
        msg.response.status=status;
        return msg;
	};

	function developerAppSecretQuery(appKey, _tb_token_){
		let What='国际站获取AppSecret';
		let queryObj=prepareMsg(What);
		queryObj.request.data._tb_token_=_tb_token_;
		queryObj.request.data.appKey=appKey;
		return queryObj;
	};
	function developerAppSecretCheck(msg){
        let data=msg.response.data;
        let status,result;
        if(data.isSuccess){
            result=data.data;
            status=true;
        }else{
            result='获取 AppSecret 失败，请重试';
            status=false;
        };
        msg.response.result=result;
        msg.response.status=status;
        return msg;
	};

	function developerCodeQuery(appKey){
		let What='国际站获取授权码';
		let queryObj=prepareMsg(What);
		queryObj.request.data.client_id=appKey;
		queryObj.request.data.state=appKey;
		return queryObj;
	};
	function developerCodeCheck(msg){
        let { redirectURL, net } = msg.response;
        if (!redirectURL) {
            msg.response.result="需要重新授权"
            msg.response.status=false;
            return msg;
        };
        let sp = new URL(net.url).searchParams;
        let code = sp.get("code");
        let state = sp.get("state");
        msg.response.result={code, state};
        msg.response.status=true;
        return msg;
	};

	function developerAutoAuthQuery(appKey,html,url){
		let What='国际站自动授权';
		let queryObj=prepareMsg(What);
        let lines=html.split('\n');
        let _csrf_token_, agreementsign, timestamp;
        for (let i=0; i<lines.length; i++){
            if(lines[i].match("_csrf_token_")==null) continue;
            _csrf_token_=lines[i].match("value='.*'")[0].replace("value='","").replace("'","");
            agreementsign=lines[i+6].match("value='.*'")[0].replace("value='","").replace("'","");
            timestamp=lines[i+11].match("value='.*'")[0].replace("value='","").replace("'","");
            break;
        };
        queryObj.request.url=url;
		queryObj.request.data._csrf_token_=_csrf_token_;
		queryObj.request.data.agreementsign=agreementsign;
		queryObj.request.data.state=appKey;
		queryObj.request.data.client_id=appKey;
		queryObj.request.data.timestamp=timestamp;
		return queryObj;
	};
    function developerAutoAuthCheck(msg) {
        if (!msg.response.data) {
            msg.response.result="";
            msg.response.status=false;
            return msg;
        };
        let { redirectURL, net } = msg.response;
        let finalURL;
        if (redirectURL) {
            finalURL = redirectURL;
        } else {
            finalURL = net.url;
        };
        if (!finalURL || typeof (finalURL) !== 'string') {
            msg.response.result="链接错误"
            msg.response.status=false;
            return msg;
        };
        let sp = new URL(finalURL).searchParams;
        let code = sp.get("code");
        let state = sp.get("state");
        msg.response.result={code, state};
        msg.response.status=true;
        return msg;
	};

	function developerTokenQuery(appKey,appSecret,code){
		let What='国际站查询授权令牌';
		let queryObj=prepareMsg(What);
		queryObj.request.data.client_id=appKey;
		queryObj.request.data.client_secret=appSecret;
		queryObj.request.data.code=code;
		return queryObj;
	};
	function developerTokenCheck(msg){
        let data=msg.response.data;
        let status,result;
        if (data.access_token){
            result=data;    //包含 access_token
            status=true;
        }else if(data.error_msg){
            result=data.error_msg;
            status=false;
        };
        msg.response.result=result;
        msg.response.status=status;
        return msg;
    };

	function developerRenewalQuery(appKey, TBToken, CToken, expireTime){
		let What='国际站服务续期';
		let queryObj=prepareMsg(What);
        queryObj.request.data.appKey=appKey;
        queryObj.request.data.ctoken=CToken;
        queryObj.request.data._tb_token_ = TBToken;
        if (expireTime) queryObj.request.data.expireTime = expireTime;
		return queryObj;
	};
	function developerRenewalCheck(msg){
        let {net, data}=msg.response;
        let status,result;
        if(net.ok && data.isSuccess){
            result="续约成功";
            status=true;
        } else {
            result="续约失败"
            status=false;
        };
        msg.response.result=result;
        msg.response.status=status;
        return msg;
	};

	function developerAPIQuery(authObj, paramObj){
		let What='国际站调用API';
		let queryObj=prepareMsg(What);
        let {app_key,app_secret,method,access_token}=authObj;
        let arr=[];
        arr[0]=app_secret;
        let timeStamp=new Date(new Date().valueOf()-new Date().getTimezoneOffset()*60*1000).toISOString().replace(/T/, ' ').replace(/\..*$/, '');
        let unordered={
            'app_key': app_key,
            'format': 'json',
            'method': method,
            'session': access_token,
            'sign_method': 'md5',
            'timestamp': timeStamp,
            'v': '2.0'
        };
        if (paramObj) Object.assign(unordered, paramObj);	//组装业务参数
        let o = {}; //最终的数据📌
        Object.keys(unordered).sort().forEach((k)=>{
          o[k] = unordered[k];		//按key排序
        });
        for (let k in o){
            let str=k+o[k];
            arr.push(str);
        };
        arr.push(app_secret);
        let md5Data=arr.join('');
        let sign=hex_md5(md5Data).toUpperCase();	//MD5加密，外部引入
        Object.assign(o, {sign});
        queryObj.request.data=o;
		return queryObj;
	};
	function developerAPICheck(msg){
        let data=msg.response.data;
        let status,result;
        if(data.error_response){
            result=data.error_response.msg;
            status=false;
        }else{
            let key=Object.keys(data)[0];
            result=data[key];
            result.key=key;
            status=true;
        };
        msg.response.result=result;
        msg.response.status=status;
        return msg;
	};
    
    return {
        languageQuery,
        languageCheck,
        accountMemberIdQuery,
        accountMemberIdCheck,
        accountEmailQuery,
        accountEmailCheck,
        aliCRMQuery,
        aliCRMCheck,
        developerRegisterQuery,
        developerRegisterCheck,
        developerAppKeyQuery,
        developerAppKeyCheck,
        developerAppSecretQuery,
        developerAppSecretCheck,
        developerCodeQuery,
        developerCodeCheck,
        developerAutoAuthQuery,
        developerAutoAuthCheck,
        developerTokenQuery,
        developerTokenCheck,
        developerRenewalQuery,
        developerRenewalCheck,
        developerAPIQuery,
        developerAPICheck,
    };
})();

if (typeof(exports)!=='undefined') exports.main = ma;