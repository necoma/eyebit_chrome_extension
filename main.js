document.OnLoad = start();
var myname = "CHROME_EXTENSION_BLACKLIST_WARNING";
var dialog_selector = myname + "_DIALOG";

// 視線チェックを行う間隔
var timeout_millisecond = 1 * 1000; // 1秒

// 測定開始時刻
var startTime; // new Date();

// JSON で get request を出し/受け取ります。
function GetJSON(url, data, success_func, error_func){
    $.ajax({url: url,
	    type: "GET",
	    data: data,
	    dataType: 'json',
	    success: success_func,
	    error: error_func
	   });
}

function ShowModalAlert(message){
    alert(message);
}

// $("form *") を受け取って、その disabled アトリビュートの設定を保存したリストにして返します。
function CreateFormAttributeDataList(form_list){
  var data_list = [];
  form_list.each(function(){
    var data = {};
    data['obj'] = this;
    data['disabled'] = $(this).attr('disabled');
    data_list.push(data);
  });
  return data_list;
}

// $("form *") 等で得られたもののリストを使って form を disable にします。
function DisableAttribute(form_data_list){
  for(var i in form_data_list){
    var v = form_data_list[i];
    var obj = v['obj'];
    //var disabled = v['disabled'];
    $(obj).attr('disabled', 'disabled');
  }
}
// $("form *") 等で得られたもののリストを使って form を enable にします。
function EnableAttribute(form_data_list){
  for(var i in form_data_list){
    var v = form_data_list[i];
    var obj = v['obj'];
    var disabled = v['disabled'];
    if(disabled != "disabled"){
      $(obj).removeAttr('disabled');
    }
  }
}

// EyeTrack の情報を取得して、それらしく動作します。
// このバージョンでは、目線が一回でも通ったら form を enable にして終了です。
function CheckEyeTrack(form_data_list){
    GetJSON("https://localhost:8888/check_fixation.json" + "?delta_millisecond=" + (new Date() - startTime)
	    , {}
	    , function(data){
		var hit = false;
		for(var key in data){
		    if(data[key]){
			hit = true;
			break;
		    }
		}
		if(hit){
		    // 視線がそちらに泳いだので、enable にして終了します。
		    console.log(form_data_list);
		    EnableAttribute(form_data_list);
		}else{
		    // hit していないので、もう1秒待って再度視線チェックを行います。
		    setTimeout(function(){CheckEyeTrack(form_data_list);}, timeout_millisecond);
		}
	    }, function(){
		console.log("WARNING: check request failed.");
		// チェッカが失敗したので enable にして終了とします。
		console.log(form_data_list);
		EnableAttribute(form_data_list);
	    }
	   );
}


function start() {
    // 一応 start の呼ばれた時間を初期時間とします。
    startTime = new Date();
    // form の初期状態を拾います。
    var form_data_list = CreateFormAttributeDataList($("form *"));

    // form_data_list の数が 0 ならそもそも何もする必要がありません。
    if(form_data_list.length <= 0){
	return;
    }
    console.log(form_data_list);

    // 何も考えずに全ての form を disable にします。
    DisableAttribute(form_data_list);

    // 視線チェックを開始します。
    setTimeout(function(){ CheckEyeTrack(form_data_list); }, timeout_millisecond);
}

