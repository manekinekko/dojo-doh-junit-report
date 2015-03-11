define("doh/runner-junit", ["doh/runner"], function(doh) {

	// http://windyroad.org/dl/Open%20Source/JUnit.xsd
	doh._oXmlOutput = [];
	doh._oXml = {};
	doh._hashes = {};
	doh._totalTime = 0;

	doh.pushComment = function pushComment(){
		var comment = '';
		for(var arg=0; arg<arguments.length; arg++){
			comment += ' ' + arguments[arg];
		}

		doh._oXmlOutput.push({
			type: 'comment',
			value: comment
		});

	};

	doh.openTestSuites = function openTestSuites(){
		doh._oXmlOutput.push({
			type: 'testsuites'
		});
	};

	doh.openTestSuite = function openTestSuite(args){

		var _date = new Date();
		_date = _date.getFullYear()+'-'+_date.getMonth()+'-'+_date.getDay()+'T'+_date.getHours()+':'+_date.getMinutes()+':'+_date.getSeconds();
		
		//reset error counter
		this._errorCount = 0;
		args.id = args.id || 0;
		args.errors = args.errors || this._errorCount;
		args.time = args.time || '0.0';
		args.tests = args.tests || this._testCount;
		args.failures = args.failures || this._failureCount;
		args.timestamp = args.timestamp || _date;
		args.hostname = args.hostname || 'localhost';
		this._tabErrors[args.name] = 0;
		this._tabFailures[args.name] = 0;
		
		doh._oXmlOutput.push({
			type: 'testsuite',
			attributes: {
				'name':args.name,
				'errors':args.errors,
				'failures':args.failures,
				'tests':args.tests,
				'time':args.time,
				'timestamp':args.timestamp,
				'hostname':args.hostname
			}
		});
	};

	doh.pushSystemMessage = function pushSystemMessage(args){

		doh._oXmlOutput.push({
			type: 'system-out',
			hash: args.hash,
			value: '<![CDATA[ '+args.message+' ]]>'
		});
		
	};

	doh.pushSystemError = function pushSystemError(args){

		doh._oXmlOutput.push({
			type: 'system-err',
			hash: args.hash,
			value: '<![CDATA[ '+args.message+' ]]>'
		});

	};

	doh.openTestCase = function openTestCase(args){
		args.time = args.time || '0.0';
		
		doh._oXmlOutput.push({
			type: 'testcase',
			attributes: {
				'classname': args.classname,
				'name': args.name,
				'time': args.time
			}
		});

	};

	doh.pushError = function pushError(args){

		this._tabErrors[args.testsuite]++;
		doh._oXmlOutput.push({
			type: 'error',
			hash: args.hash,
			value: '<![CDATA[ '+args.value+' ]]>',
			attributes: {
				message: args.attributes["stack"]
			}
		});

	};

	doh.pushFailure = function pushFailure(args){
		args.type = args.type || 'junit.framework.AssertionFailedError';
		this._tabFailures[args.testsuite]++;
		doh._oXmlOutput.push({
			type: 'failure',
			hash: args.hash,
			value: args.trace,
			// value: '<![CDATA[ '+args.trace+' ]]>',
			attributes: {
				type: args.type,
				message: args.message
			}
		});

	};

	doh.outputXML = function outputXML(){

		var comment = [];
		var testsuites = [];
		var testsuite = [];
		var testcase = [];
		var failure = [];
		var error = [];
		var systemOut = [];
		var systemErr = [];
		var output = [];
		output.push('<?xml version="1.0" encoding="UTF-8" ?>');
		output.push('<!-- ******************************* -->');
		output.push('<!-- The Dojo Unit Test Harness, $Rev: 23869 $ (Patched version) -->');
		output.push('<!-- Copyright (c) 2011, The Dojo Foundation, All Rights Reserved -->');
		output.push('<!-- Date: '+(new Date())+'              -->');
		output.push('<!-- '+this._testCount+" test"+(this._testCount>1?'s':'')+" to run in "+this._groupCount+" group"+(this._groupCount>2?'s':'') +' -->');
		output.push('<!-- ******************************* -->');

		var indent = function indent(n){
			var _tab = [];
			for(var i=0;i<n;i++){
				_tab.push('\t');
			}
			return _tab.join('');
		};
		var getAttr = function getAttr(o){
			var attr = [];
			if(o.attributes){
				o = o.attributes;
			  for (var p in o) {
			    attr.push( p + '="' + o[p] + '"');
			  }
			}
	  	return attr.join(' ');
		};
		var getObjectFromHash = function getObjectFromHash(o, hash){
			for (var i = o.length - 1; i >= 0; i--) {
				if(o[i].hash && o[i].hash===hash){
					return o[i].data;
				}
			};
			return null;
		}
		
		// filter by type
		for(var i=0; i<doh._oXmlOutput.length; i++){
			var o = doh._oXmlOutput[i];
			var type = o.type;
			
			switch(type){
				case 'comment': 		comment.push(o); break;
				case 'testsuites': 	testsuites.push(o); break;
					case 'testsuite': 	testsuite.push(o); break;
					case 'testcase': 		testcase.push(o); break;
						case 'failure': 		failure.push({ _name: 'failure', hash: o.hash, data: o}); break;
						case 'error': 			error.push({ _name: 'error', hash: o.hash, data: o}); break;
					case 'system-out': 	systemOut.push({ _name: 'system-out', hash: o.hash, data: o}); break;
					case 'system-err': 	systemErr.push({ _name: 'system-err', hash: o.hash, data: o}); break;
			}

		};

		for(var cc=0; cc<comment.length; cc++){
			output.push(indent(3)+comment[cc].value);
		}

		for(var i=0; i<testsuites.length; i++){
			output.push('<testsuites>');
			
			for(var j=0; j<testsuite.length; j++){
				output.push(indent(1)+'<testsuite '+getAttr(testsuite[j])+'>');

				for(var k=0; k<testcase.length; k++){

					if(testcase[k].attributes.classname===testsuite[j].attributes.name){
						output.push(indent(2)+'<testcase '+getAttr(testcase[k])+'>');

						var _hash = doh._generateHash(testcase[k].attributes['classname'], testcase[k].attributes['name']);
						var f, e;
						if(failure.length > 0){
							f = getObjectFromHash(failure, _hash);
							if(f){
								output.push(indent(3)+'<failure '+getAttr(f)+'>');
								output.push(indent(4)+f.value);
								output.push(indent(3)+'</failure>');
							}
						}
						else if(error.length > 0){
							e = getObjectFromHash(error, _hash);
							if(e){
								output.push(indent(3)+'<error '+getAttr(e)+'>');
								output.push(indent(4)+e.value);
								output.push(indent(3)+'</error>');
							}
						}

						output.push(indent(2)+'</testcase>');
					}
					
				}

				var so = getObjectFromHash(systemOut, _hash);
				if(so){
					output.push(indent(2)+'<system-out '+getAttr(so)+'>');
					output.push(indent(3)+so.value);
					output.push(indent(2)+'</system-out>');
				}

				var se = getObjectFromHash(systemErr, _hash);
				if(se){
					output.push(indent(2)+'<system-err '+getAttr(so)+'>');
					output.push(indent(3)+so.value);
					output.push(indent(2)+'</system-err>');
				}

				output.push(indent(1)+'</testsuite>');
			}

			output.push('</testsuites>');
		}

		return output.join('\n');
	};

	doh._generateHash = function _generateHash(){
		var args = [];
		var _h = '';
		for (var i = arguments.length - 1; i >= 0; i--) {
			args.push(arguments[i]);
		};
		_h = args.join('########');

		doh._hashes[_h] = _h;

		return _h;

	};

	doh._updateAttribute = function _updateAttribute(args){

		for(var i=doh._oXmlOutput.length-1; i>=0; i--){

			if(args.type===doh._oXmlOutput[i].type
					&& doh._oXmlOutput[i].attributes
					&& args.groupName===doh._oXmlOutput[i].attributes.name
			){
				doh._oXmlOutput[i].attributes[ args.name ] = args.value;
				return true; 
			}
		}
		return false;
	};

	doh._o = function(o) {
	  var out = '';
	  for (var p in o) {
	    out += p + ': ' + o[p] + '\n';
	  }
	  return out;
	};

	// force the doh.debug method to output as an xml comment (for the whole runner)
	doh.debug = doh.error = (function(doh){
		return function(){
			doh.pushComment.apply(doh, arguments)
		};
	})(doh);

	doh._formatTime = function _formatTime(n){
		n = +n;
		if(n===0){
			return '0.0';
		}

		switch(true){
			case n<1000: //<1s
				return '0.'+n;
			case n<60000: //<1m
				return (n/100)/10;
		}
	};

	// holly crap !!!!!!!!!!!!!!
	// Neither Dojo.Deferred() nor setTimeout() are available is this context
	// so busy wait 
	doh._WTF = function _WTF(callback){

		if(typeof window !== 'undefined' && window.setTimeout) {
			window.setTimeout(callback, 1000);
		}
		else {
			// I'm aware this is so ugly! Please submit fixes :)
			var i=0;while( i<this._groupCounter*10000000 ){i++;};
			(typeof callback == 'function') && callback();
		}

	}

//
// Runner-Wrapper (overriden methods)
//
	doh._init = function _init(){
		this._currentGroup = null;
		this._currentTest = null;
		this._tabErrors = {};
		this._tabFailures = {};
		doh.openTestSuites();
	}

	doh._groupStarted = function _groupStarted(groupName){
		doh._groupTotalTime = 0;
		if(doh._groupCounter){
			doh._groupCounter++;
		}
		else {
			doh._groupCounter = 1;
		}

	}

	doh._groupFinished = function _groupFinished(groupName, success){
		doh._totalTime += doh._groupTotalTime;
		this._updateAttribute({
			type: 'testsuite',
			name: 'time',
			groupName: groupName,
			value: doh._formatTime(doh._groupTotalTime)
		});
		
		this._updateAttribute({
			type: 'testsuite',
			name: 'errors',
			groupName: groupName,
			value:  this._tabErrors[groupName]
		});
		
		this._updateAttribute({
			type: 'testsuite',
			name: 'failures',
			groupName: groupName,
			value: this._tabFailures[groupName]
		});

	}

	doh._testStarted = function _testStarted(groupName, fixture){
		doh.openTestCase({
			classname: groupName,
			name: fixture.name,
			time: fixture.endTime
		});
	}

	doh._testFinished = function _testFinished(groupName, fixture, success){
		var _timeDiff = fixture.endTime-fixture.startTime;
		var testElapsedTime = doh._formatTime(_timeDiff);

		this._updateAttribute({
			type: 'testcase',
			name: 'time',
			groupName: groupName,
			value: testElapsedTime
		});
		doh._printTestFinished();
	}

	doh._printTestFinished = function _printTestFinished() {}
	
	doh._testRegistered = function _testRegistered(groupName, fixture){}

	doh._setupGroupForRun = function _setupGroupForRun(/*String*/ groupName, /*Integer*/ idx){
		var tg = this._groups[groupName];
		doh._groupStarted(groupName);
		doh.openTestSuite({
			name: groupName,
			tests: tg.length
		});
	}

	doh._handleFailure = function _handleFailure(groupName, fixture, e){
		// print('FAILED: '+doh._generateHash(groupName, fixture.name));

		// mostly borrowed from JUM
		//this._groups[groupName].failures++;
		var out = "";
		if(e instanceof this._AssertFailure){
			this._groups[groupName].failures++;
			this._failureCount++;
			if(e["fileName"]){ out += e.fileName + ':'; }
			if(e["lineNumber"]){ out += e.lineNumber + ' '; }
			out += e+": "+e.message;
			
			doh.pushFailure({
				hash: doh._generateHash(groupName, fixture.name),
				testsuite : groupName,
				testcase : fixture.name,
				name: fixture.name,
				message: doh._AssertFailure.prototype.name,
				trace: out
			});

		}else{
			this._groups[groupName].errors++;
			doh.pushError({
				type: 'error',
				testsuite : groupName,
				testcase : fixture.name, 
				hash: doh._generateHash(groupName, fixture.name),
				value: e.message,
				attributes: {
					stack: e.stack
				}
			});

		}

		if(e){
			if(e['rhinoException']){
				doh.pushSystemError({
					hash: doh._generateHash(groupName, fixture.name),
					message: e.rhinoException.getStackTrace().getMessage()
				});
			}else if(e['javaException']){
				doh.pushSystemError({
					hash: doh._generateHash(groupName, fixture.name),
					message: e.javaException.getStackTrace().getMessage()
				});
			}
		}


	};

	doh._onEnd = function _onEnd(){};

	doh._report = function _report(){

		doh._WTF(function _report_WTF(){
			var result = doh.outputXML();
		
			// check if this module is running inside a browser
			if(typeof window !== 'undefined' && window.document) {
				var node = document.getElementById("xml-report");
				if (node.innerText) {
					node.innerText = result;
				}
				else {
					node.textContent = result;
				}
			}
			else {
				// you might want to save the result into a *.xml file.
				// but for now we just output the xml content.
				doh.debug(result);
			}

		});
	};

	doh.extend(doh.Deferred, {
		callback: function(res){
			// this._check();
			this._resback(res);
		}
	});

	return doh;
});