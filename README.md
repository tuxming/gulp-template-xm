# gulp-template-xm 

> html template

## Usage

First, install `gulp-template-xm` as a development dependency:

```shell
npm install --save-dev gulp-template-xm
```

Then, add it to your `gulpfile.js`:

## Simple Example
### Gulpfile
```javascript
var tplprocesser = require('gulp-template-xm');

gulp.task('html', function() {
	gulp.src(['/**/*.html', "!/template/**/*.html"])
		.pipe(tplprocesser())
		.pipe(gulp.dest(".tmp/"));
});


```
### html 
####index.tpl.html
```html
<!doctype html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>#{title}</title>
	
	#{css}
	
</head>
<body>

	#{content}
	
	#{js}

</body>
</html>

```

#### user.html
```html
<!-- tpl 
	{
		"parent": "template/index.tpl.html", "css": "/styles/user.css, /style/default.css", 
		"title": "this is user profile page", "js": "/script/config.js, /scripts/user.js", 
		"user":"tuxming@sina.com"
		//other variable
	} 
-->
<!--begin user page -->
<div class="container">
	<h1>my profile</h1>
	<span>#{user}</span>
	.....
</div><!--end user page-->
```

### result: user.html
```html
<!doctype html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>this is user profile page</title>

	<link rel="stylesheet" href="/styles/user.css">
	<link rel="stylesheet" href="/styles/default.css">

</head>
<body>
	<!--begin user page -->
	<div class="container">
		<h1>my profile</h1>
		<span>github.com/tuxming</span>
		.....
	</div><!--end user page-->
	
	<script type="text/javascript" src="/scripts/config.js"></script>
	<script type="text/javascript" src="/scripts/user.js"></script>
	
</body>
</html>
```


##Expand Example
### Gulpfile
```javascript
var tplprocesser = require('gulp-template-xm');
var fs = require('fs');
var inject = require('gulp-inject-xm');

var paths = {bowerjs:[
	'./bower_components/jquery/dist/jquery.js',
	'./bower_components/angular/angular.js',
	'./bower_components/bootstrap/dist/js/bootstrap.js'
]}

var processCallback = function (info, isDebug){
	if(info.type == "tpl"){
		var source = fs.readFileSync(config.app+"/"+info.ref);
		if(source)
			return source.toString();
		else 
			return "";
	}else if(info.type=='bower'){
		var bowerjss;
		if(isDebug){
			bowerjss = paths.bowerjs.map(function(item, i){
				var paths = item.split("/");
				var jsName = paths[paths.length-1];
				return "<script type='text/javascript' src='/scripts/public/"+jsName+"'></script>";
			}).reduce(function(a, b){
				return a+b; 
			});	
		}else{
			bowerjss = "<script type='text/javascript' src='scripts/vender.js' ></script>";
		}
		
		return bowerjss;
		
	}else
		return "";
}

gulp.task('html', function() {
	gulp.src(['/**/*.html', '!/template/**/*.html'])
		.pipe(inject.process({  //inject to user.html 
			isDebug : false, //product, true: developer -> can't inject css, js
			callback: processCallback
		}))
		.pipe(tplprocesser({  //add template to user.html
			tplProcess: function(templatefile){  //inject to template {index.tpl.html}
				return inject.processHtmlForString(templatefile.toString(), {
					isDebug: false,  //product, true: developer -> can't inject css, js
					callback: processCallback
				});
			}
		}))
		//.pipe(htmlref(jsprocess, cssprocss));  //see gulp-process-ref
		.pipe(gulp.dest(".tmp/"))
});

```
### html 
```html
user.html

<!-- tpl 
	{	
		"parent": "index.tpl.html", "css": "/styles/user.css, /style/default.css", 
		"title": "this is user profile page"
		"user":"tuxming@sina.com",
		"jsref": "<span class='buildjs' name='main.js' dist='/scripts/' ><script type='text/javascript' class='concat' base='../..' src='../../script/main.js'></script><script type='text/javascript' class='concat' base='../..' src='../../script/config.js'></script>"
	} 
-->
<!--begin user page -->
<div class="container">
	<h1>my profile</h1>
	<span>#{user}</span>
	
	.....
</div><!--end user page-->


index.tpl.html

<!doctype html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>#{title}</title>
	
	<!-- build {"type":"css", "ref":"styles/main.css"} -->
	<link rel="stylesheet" href="../styles/main.css">
	<link rel="stylesheet" href="../styles/style.css">
	<!-- endbuild -->
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
	
	

header.html
<!--page header-->
<div class="header">this is page head</div>

footer.html
<!--page footer-->
<div class="header">this is page footer</div>
	
```

### result user.html(isDubug:false)
```html
<!doctype html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>#{title}</title>
	
	<!-- build {"type":"css", "ref":"styles/main.css"} -->
	<link rel="stylesheet" href="../styles/main.css">
	<link rel="stylesheet" href="../styles/style.css">
	<!-- endbuild -->
	<link rel="stylesheet" href="../styles/user.css">
	<link rel="stylesheet" href="../styles/default.css">
	
</head>
<body>
	<!--page header-->
	<div class="header">this is page head</div>
	
	<!--begin user page -->
	<div class="container">
		<h1>my profile</h1>
		<span>tuxming@sina.com</span>
		
		.....
	</div><!--end user page-->
	
	<!--page footer-->
	<div class="header">this is page footer</div>
	
	<script type='text/javascript' src='/scripts/public/jquery.js'></script>
	<script type='text/javascript' src='/scripts/public/bootstrap.js'></script>
	<script type='text/javascript' src='/scripts/public/angular.js'></script>
	
	<span class='buildjs' name='main.js' dist='/scripts/' >
	<script type='text/javascript' class='concat' base='../..' src='../../script/main.js'></script>
	<script type='text/javascript' class='concat' base='../..' src='../../script/config.js'></script>

</body>
</html>	
```

### result user.html(isDubug:true)
```html
<!doctype html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>#{title}</title>
	
	<link rel="stylesheet" href="styles/main.css">
	
	<link rel="stylesheet" href="../styles/user.css">
	<link rel="stylesheet" href="../styles/default.css">
	
	#{css}
	
</head>
<body>
	<!--page header-->
	<div class="header">this is page head</div>
	
	<!--begin user page -->
	<div class="container">
		<h1>my profile</h1>
		<span>tuxming@sina.com</span>
		
		.....
	</div><!--end user page-->
	
	<!--page footer-->
	<div class="header">this is page footer</div>
	
	<script type='text/javascript' src='scripts/vender.js'></script>
	
	
	// <-- here use gulp-process-ref
	<span class='buildjs' name='main.js' dist='/scripts/' >
	<script type='text/javascript' class='concat' base='../..' src='../../script/main.js'></script>
	<script type='text/javascript' class='concat' base='../..' src='../../script/config.js'></script>

</body>
</html>	
```







