var through2 = require('through2');
var fs = require('fs');

module.exports = function(options){
	
	return through2.obj(function (file, enc, done) {
		
		// 如果文件为空，不做任何操作，转入下一个操作，即下一个 .pipe()
		if (file.isNull()) {
			this.push(file);
			return done();
		}
		
		// 插件不支持对 Stream 对直接操作，跑出异常
		if (file.isStream()) {
			this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
			return cb();
		}
		
		var content = file.contents.toString();
		
		content = processHtmlForString(content, options)
		
		file.contents = new Buffer(content);
		this.push(file);
		done();
	});
}

function processHtmlForString(content, options){
	/*
	<!-- tpl {"parent": "index.tmp.html", "css": "/styles/user.css, /style/default.css", 
		"title": "this is user profile page", "js": "/script/config.js, /scripts/user.js", 
		//other variable
	} -->
	
	variable: #{title}
	
	*/
	
	/*
	index.tmp.html
	
	<!doctype html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<title>#{title}</title>
		
		<link rel="stylesheet" href="../styles/main.css">
		<link rel="stylesheet" href="../styles/style.css">
		
		#{css}
		
	</head>
	<body>
		<!--build {"type":"tpl", "ref":"template/header.html"}-->
		<!--endbuild-->
		
		#{content}
		
		<!--build {"type":"tpl", "ref":"template/footer.html"}-->
		<!--endbuild-->
		
		<!-- build {"type":"bower" }-->
		<!-- endbuild -->
		
	</body>
	</html>
	
	user.html
	<!-- tpl {"parent": "index.tmp.html", "css": "/styles/user.css, /style/default.css", 
		"title": "this is user profile page", "js": "/script/config.js, /scripts/user.js", 
		//other variable
	} -->
	<!--begin user page -->
	<div class="container">
		<h1>my profile</h1>
		<span>github.com/tuxming</span>
		.....
	</div><!--end user page-->
	
	result user.html
	<!doctype html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<title>this is user profile page</title>
		
		<link rel="stylesheet" href="../styles/main.css">
		<link rel="stylesheet" href="../styles/style.css">
		<link rel="stylesheet" href="/styles/user.css">
		<link rel="stylesheet" href="/styles/default.css">
		
		
	</head>
	<body>
		<!--build {"type":"tpl", "ref":"template/header.html"}-->
		<!--endbuild-->
		
		<!--begin user page -->
		<div class="container">
			<h1>my profile</h1>
			<span>github.com/tuxming</span>
			.....
		</div><!--end user page-->
		
		<!--build {"type":"tpl", "ref":"template/footer.html"}-->
		<!--endbuild-->
		
		<!-- build {"type":"bower" }-->
		<!-- endbuild -->
		
		<script type="text/javascript" src="/scripts/config.js"></script>
		<script type="text/javascript" src="/scripts/user.js"></script>
		
	</body>
	</html>
	
	*/
	
	/*
	<!-- tpl {"parent": "index.tmp.html", "css": "/styles/user.css, /style/default.css", 
		"title": "this is user profile page", "js": "/script/config.js, /scripts/user.js", 
		//other variable
	} -->
	*/
	var tplReg = /(<!--\s*tpl)[\s\S]*?(-->)/g;
	
	//{"type": "script", "ref":"style/main.js"}
	var jsonReg = /\{[\s\S]*\}/;
	
	var matchElems = content.match(tplReg);
	if(matchElems && matchElems.length>0){
		var tpl = matchElems[0];
		var jsonStr = tpl.match(jsonReg);
		
		if(jsonStr && jsonStr.length>0){
			
			jsonStr[0] = jsonStr[0].replace(/\r?\n|\r|\t/g, "");
			console.log("12312::"+jsonStr[0]);
			var info = JSON.parse(jsonStr[0]);
			
			//load template
			var template = fs.readFileSync(info.parent);
			if(template){
				
				//process template
				var source = template.toString();
				
				if(options.tplProcess){
					source = options.tplProcess(template);
				}
				
				content = source.replace("#{content}", content);
				
				for(var variable in info){
					
					if(variable=='parent')
						continue;
					
					if(variable=='css'){
						var csss = info.css.split(/,\s*/).map(function(item, i){
							return "<link rel='stylesheet' href='"+item+"'></link>"
						}).reduce(function(a, b){
							return a+b; 
						});
						content = content.replace("#{css}", csss);
					}else if(variable == 'js'){
						var jss = info.js.split(/,\s*/).map(function(item, i){
							return "<script type='text/javascript' src='"+item+"'></script>"
						}).reduce(function(a, b){
							return a+b; 
						});
						content = content.replace("#{js}", jss);
					}else {
						content = content.replace("#{"+variable+"}", info[variable]);
					}
					
				}
				
				content = content.replace("#{css}", "");
				content = content.replace("#{js}", "");
				
			}
			
		}
	
	}
	return content;
}
