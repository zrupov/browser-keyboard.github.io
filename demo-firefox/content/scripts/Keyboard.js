var Keyboard;
$(function(){
	Keyboard = function(options){
		this.field = new Field();
		this.logic = new KeyboardLogic(this, this.field, options);
    this.keyCodes = options.keyCodes;
    this.active = true;
		
		
	// create hotkey combinations
		this.hotKeys = [];
  	for (var i = 0; i < options.combos.length; i++){
  		this.hotKeys[i] = new KeyHot(this, options.combos[i]);
  	}
  	
/*****  create keys logic  *****/
		this.keyLetters = [];
		this.keyFunctionals = [];
  	var keyWordCount = 0;
  	var keyFunctionalCount = 0;
		var languageCount =  options.languageSet.length;

  	//keyboardOption.keySet по строкам 
  	for (var i1 = 0; i1 < options.keySet.length; i1++) {

			//keyboardOption.keySet по элементам
			for (var i2 = 0; i2 < options.keySet[i1].length; i2++) {
				if(options.keySet[i1][i2] == 'layout'){
					
					// по колличеству элементов в первой расскладке
					for (var i3 = 0; i3 < options.languageSet[0].letterSet[i1].length; i3++) {
		      	var symbols = [];
						
						// по колличеству расскладок
						for (var i4 = 0; i4 < languageCount; i4++) {
							var keySymbols = options.languageSet[i4].letterSet[i1][i3];
		      		symbols[i4] = {
		            lowerCase: keySymbols[1],
		            upperCase: keySymbols[2],
		            lowerAdd: keySymbols[3],
		            upperAdd: keySymbols[4],
		            options: keySymbols[0]
		      		};
						}
		      	this.keyLetters[keyWordCount] = new KeyLetter(this, this.keyCodes[keyWordCount], symbols, {});
		      	keyWordCount++;						
					}
					
				}else{
					this.keyFunctionals[keyFunctionalCount] = new KeyFunctional(this, options.keySet[i1][i2]);
					keyFunctionalCount++;
				}				
			}
		}
  	this.visual = new KeyboardVisual(this, options);
    //this.visual.setLanguageTitles(0);
  	this.browserFocused = true;
  } 
	

  Keyboard.prototype.setField = function(newField, newWindow, params){
  	params = $.extend({
  		animate: true
  	}, params);
  	this.animate = params.animate;
  	this.field.focus(newField, newWindow);
  };
  
  Keyboard.prototype.reverse = function(){
  	this.active = !this.active;
  	if(this.active){
  		this.visual.show();
  	}else{
  		this.visual.hide();
  	}
  }

  Keyboard.prototype.fieldBlur = function(){
  	this.field.blur();
  };

  Keyboard.prototype.browserFocus = function(){
  	this.browserFocused = true;
  }
  
  Keyboard.prototype.browserBlur = function(){
  	this.browserFocused = false;
  	var that = this;
  	setTimeout(function(){
	  	if(that.browserFocused)
	  		return;
    	if(that.logic.kStatus.shift.physical){
    		that.logic.keyShift({from: "physical", status: "up"});
    		that.visualKeyFunct('keyShift', false);	
    		that.changeSymbols();
    	}
    	if(that.logic.kStatus.addit.physical){
    		that.logic.keyAddit({from: "physical", status: "up"});
    		that.visualKeyFunct('keyAddit', false);
    		that.changeSymbols();
    	}  		
  	}, 12);
  }
  
  Keyboard.prototype.addLetter = function(keyLetter){
  	if(!this.field.active)
  		return;
  	this.logic.addLetter(keyLetter.currentSymbol);
  	if(this.animate)
  		keyLetter.visual.down();
  	if(this.logic.additObserve()){
			this.changeSymbols();
			this.visualKeyFunct('keyAddit', false);	
  	}
  	if(this.logic.shiftObserve()){
			this.changeSymbols();
			this.visualKeyFunct('keyShift', false);	
  	}
  }

  Keyboard.prototype.keyFunctionalAction = function(func, params){
    switch(func){
	    case "keyAddit":
	    	this.logic.keyAddit(params);
  			this.changeSymbols();
  			this.visualKeyFunct('keyAddit', this.logic.kStatus.addit.active);	
	  		break;
	    case "keyAdditLong":
	    	this.logic.keyAdditLong(params);
				this.changeSymbols();
				this.visualKeyFunct('keyAdditLong', this.logic.kStatus.additLong.active);	
	  		break;
	    case "keyBackspace":
				this.logic.keyBackspace();
	  		break;
	    case "keyCaps": 
  			this.logic.keyCaps();
  			this.changeSymbols();
  			this.visualKeyFunct('keyCaps', this.logic.kStatus.caps.active);	
	  		break;
	    case "keyDelete": 
				this.logic.keyDelete();
				break;    
	    case "keyEnter": 
				this.logic.keyEnter();
				break;   
	    case "keyShiftEnter": 
				this.logic.keyShiftEnter();
				break;   
	    case "keyNextLanguage":
  			this.logic.keyNextLanguage();
  			this.changeLanguage();
	  		break;
	    case "keySpace": 
  			this.logic.keySpace();
	  		break;
	    case "keyShift": 
  			this.logic.keyShift(params);
  			this.changeSymbols();
  			this.visualKeyFunct('keyShift', this.logic.kStatus.shift.active);	
	  		break;
    }
  }
  
  Keyboard.prototype.changeLanguage = function(){
  	var value = this.logic.kStatus.language.value;
  	var status = {
    		shift: this.logic.kStatus.shift.active,
    		caps: this.logic.kStatus.caps.active,
    		addit:  this.logic.kStatus.addit.active 			
    	};
  	for(var i = this.keyLetters.length-1; i > -1; i--){
  		this.keyLetters[i].changeLayout(value, status);
  	}
		this.visualKeyFunct('keyNextLanguage', true);
		var that = this;
		setTimeout(function(){
			that.visualKeyFunct('keyNextLanguage', false);
		}, 250);
		this.visual.setLanguageTitles(this.logic.kStatus.language.value);
  }
  
  Keyboard.prototype.changeSymbols = function(){
  	var value = {
  		shift: this.logic.kStatus.shift.active,
  		caps: this.logic.kStatus.caps.active,
  		addit:  (this.logic.kStatus.addit.active ^ this.logic.kStatus.additLong.active) 			
  	};
  	for(var i = this.keyLetters.length-1; i > -1; i--){
  		this.keyLetters[i].changeStatus(value);
  	}  	
  }
  
  Keyboard.prototype.visualKeyFunct = function(func, bool){
  	if(bool){
    	for(var i = this.keyFunctionals.length-1; i > -1 ; i--){
    		if( this.keyFunctionals[i].func == func){
    			this.keyFunctionals[i].visual.down();
    		};
    	}
  	}else{
    	for(var i = this.keyFunctionals.length-1; i > -1 ; i--){
    		if( this.keyFunctionals[i].func == func){
    			this.keyFunctionals[i].visual.up();
    		};
    	}
  	}
  }

//*******Physical Key Actions******************************************************
  Keyboard.prototype.keyDown = function(event){
  	var code = event.originalEvent.code;
  	var isHappened = false;
		for(var i = this.hotKeys.length-1; i > -1 ; i--){
			if(this.checkKeyHot(event, this.hotKeys[i], code, "down")){
				if(!this.hotKeys[i].thisSesson){
					if(this.hotKeys[i].when == 'down')
						this.hotKeys[i].active = !this.hotKeys[i].active;
					else
						this.hotKeys[i].active = true;
					this.hotKeys[i].action("down");
					this.hotKeys[i].thisSesson = true;
				}
				isHappened =  true;
			}
		}
		if(isHappened){ 			
	    event.preventDefault();  //prevent default DOM action
	    event.stopPropagation();   //stop bubbling
	    return;
		}
		
		if(!this.checkIsUsedSCANormal(event))
			return false;

  	if(!this.field.active)
  		return;
  	
  	for(var i = this.keyFunctionals.length-1; i > -1 ; i--){
  		if( this.keyFunctionals[i].code == code ){
  			this.keyFunctionals[i].visual.down();
  		};
  	}
  	
  	for(var i = this.keyCodes.length-1; i > -1 ; i--){    	
  		if( this.keyCodes[i] == code ){
  			this.keyLetters[i].action();
				isHappened =  true;
  		};
  	}

		if(isHappened){ 			
	    event.preventDefault();  //prevent default DOM action
	    event.stopPropagation();   //stop bubbling
	    return;
		}
  	
  };  

  Keyboard.prototype.keyUp = function(event){
		var code = event.originalEvent.code;
		var isHappened = false;
		for(var i = this.hotKeys.length-1; i > -1 ; i--){
			if(this.checkKeyHot(event, this.hotKeys[i], code, "upNoAction")){
				if(this.hotKeys[i].when == 'down'){
					this.hotKeys[i].active = false;
				}
			}
			if(this.checkKeyHot(event, this.hotKeys[i], code, "up")){
					this.hotKeys[i].action("up");
					this.hotKeys[i].active = false;
					isHappened =  true;
			}
			this.hotKeys[i].thisSesson = false;			
		}
		
		
		for(var i = this.keyCodes.length-1; i > -1 ; i--){
			if( this.keyCodes[i] == code ){
				this.keyLetters[i].visual.up();
				isHappened =  true;
			};
		}
  	for(var i = this.keyFunctionals.length-1; i > -1 ; i--){
  		if( this.keyFunctionals[i].code == code ){
  			this.keyFunctionals[i].visual.up();
  		};
  	}
  }
  
  Keyboard.prototype.checkKeyHot = function(event, keyHot, code, downOrUp){
		var ans = false;
		var isShift = (code.indexOf("Shift") > -1);
		var isAlt = (code.indexOf("Alt") > -1);
		var isCtrl = (code.indexOf("Ctrl") > -1);
		switch (downOrUp) {
		case "down":
			if(
					(code == keyHot.code) ||
					((keyHot.code == 0)
					&& (isShift || isCtrl || isAlt))
				)
				{
					var ans = true;
					if (keyHot.alt){
						ans = ans && (event.altKey || isAlt);
					}
					if (keyHot.ctrl){
						ans = ans && (event.ctrlKey || isCtrl);
					}
					if (keyHot.shift){
						ans = ans && (event.shiftKey || isShift);
					}
					
				}
			break;
		case "up":
			if(!keyHot.active)
				return false;
			if(
					(code == keyHot.code) ||
					((keyHot.code == 0)
					&& (isShift || isCtrl || isAlt))
				)
				{
					var ans = false;
					if (keyHot.alt){
						ans = ans ||isAlt;
					}
					if (keyHot.ctrl){
						ans = ans || isCtrl;
					}
					if (keyHot.shift){
						ans = ans || isShift;
					}
				}
		case "upNoAction":
			if(
				(code == keyHot.code) || isShift || isCtrl || isAlt
			)
			{
				var ans = false;
				if (keyHot.alt){
					ans = ans ||isAlt;
				}
				if (keyHot.ctrl){
					ans = ans || isCtrl;
				}
				if (keyHot.shift){
					ans = ans || isShift;
				}
			}
			break;
		}
		return ans;
	};

	Keyboard.prototype.checkIsUsedSCANormal = function(event){
		var ctrl = false;
		var shift = false;
		var alt = false;
		for(var i = this.hotKeys.length-1; i > -1 ; i--){
			if(this.hotKeys[i].active){
				if (this.hotKeys[i].alt){
					alt = true;
				}
				if (this.hotKeys[i].ctrl){
					ctrl = true;
				}
				if (this.hotKeys[i].shift){
					shift = true;
				}
			}
		}
		if(event.ctrlKey && !ctrl)
			return false;
		if(event.altKey && !alt)
			return false;
		if(event.shiftKey && !shift)
			return false;

		return true;
	}
	
});
