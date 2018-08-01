function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
	bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
function ab2str(buf) {
  var str = "";
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=bufView.length; i<strLen; i++) {
	str+=String.fromCharCode( bufView[ i ] );
  }
  return str;
}
function cr2str(ab) {
	var bytes = new Uint8Array( ab );
	s="";
	for (var i = 0; i < bytes.byteLength; i++) {
		s += String.fromCharCode( bytes[ i ] );
	}
	return window.btoa(s);
}
var sal=str2ab("avemorte");
function str2cr(s) {
	s = window.atob(s);
	var buf = new ArrayBuffer(s.length); // 2 bytes for each char
	var bufView = new Uint8Array(buf);
	for (var i=0, strLen=s.length; i<strLen; i++) {
		bufView[i] = s.charCodeAt(i);
	}
	return buf;
}

function genkey(pass,cb){
	window.crypto.subtle.importKey(
		"raw",
		str2ab(pass),
		{"name": "PBKDF2"},
		false,
		["deriveKey"]
	).then(function(pbk){
		window.crypto.subtle.deriveKey(
			{
				"name": "PBKDF2",
				"salt": sal,
				"iterations": 500,
				"hash": "SHA-256"
			},
			pbk,
			{
				"name": "AES-CBC",
				"length": 128
			},
			false,
			["encrypt", "decrypt"]
		).then(function(key){
			cb(key);
		});
	});
}

function str_encrypt(str, pass,cb){
	
	genkey(pass,function(key){
		window.crypto.subtle.encrypt(
			{
				name: "AES-CBC",
				//Don't re-use initialization vectors!
				//Always generate a new iv every time your encrypt!
				iv: sal,
			},
			key, //from generateKey or importKey above
			str2ab(str) //ArrayBuffer of data you want to encrypt
		)
		.then(function(encrypted){
			//returns an ArrayBuffer containing the encrypted data
			cb(cr2str(encrypted));
			//console.log(cr2str(encrypted));//new Uint8Array(encrypted));
		})
		.catch(function(err){
			console.error(err);
		});
		
	});	
}

function str_decrypt(str, pass,cb){
	
	genkey(pass,function(key){
		window.crypto.subtle.decrypt(
			{
				name: "AES-CBC",
				iv: sal, //The initialization vector you used to encrypt
			},
			key, //from generateKey or importKey above
			str2cr(str) //ArrayBuffer of the data
		)
		.then(function(decrypted){
			//returns an ArrayBuffer containing the decrypted data
			cb(ab2str(decrypted));
		})
		.catch(function(err){
			console.error(err);
		});
	});		
}

function b_encrypt(bs, pass,cb){
	if(pass=="")
		pass = "666";
		
	genkey(pass,function(key){
		window.crypto.subtle.encrypt(
			{
				name: "AES-CBC",
				//Don't re-use initialization vectors!
				//Always generate a new iv every time your encrypt!
				iv: sal,
			},
			key, //from generateKey or importKey above
			bs //ArrayBuffer of data you want to encrypt
		)
		.then(function(encrypted){
			//returns an ArrayBuffer containing the encrypted data
			cb(encrypted);
			//console.log(cr2str(encrypted));//new Uint8Array(encrypted));
		})
		.catch(function(err){
			console.error(err);
		});
		
	});	
}

function b_decrypt(buffer, pass,cb){
	if(pass=="")
		pass = "666";
		
	genkey(pass,function(key){
		console.log(buffer);
		console.log(typeof(buffer));
		window.crypto.subtle.decrypt(
			{
				name: "AES-CBC",
				iv: sal, //The initialization vector you used to encrypt
			},
			key, //from generateKey or importKey above
			buffer //ArrayBuffer of the data
		)
		.then(function(decrypted){
			//returns an ArrayBuffer containing the decrypted data
			cb(decrypted);
		})
		.catch(function(err){
			console.error(err);
		});
	});		
}

