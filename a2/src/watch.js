/***************************************************
* CSC428/2514 - St. George, Fall 2018
*
* File: watch.js
* Summary: Watch Component
*
* The code is commented, and the comments provide information
* about what each js file is doing.
*
* Written by: Seyong Ha, Mingming Fan, Sep. 2018
*				Assignment2: Quantitative Analysis
*				Updated at: NA
****************************************************/

/**
 * Libraries
 */
import React from 'react';
import './index.css';
import TextArea from './textarea'
import KeyboardNormal from './keyboard.normal'
import KeyboardZoom from './keyboard.wip'

/**
 * Functions
 */

/**
 * @Deprecated.
 * Calculate watch size (width and height) in pixels.
 * 	if you decide to use exact AppleWatch size, use this function to get width and height.
 * @param: ppi , your device independent pixel per inch. Can be acheived from the web.
 * @param: watchSize, default apple watch size, 38mm or 42mm.
 * 			other size value will be return zero in size.
 */
const deviceIndependenceSize = (ppi,watchSize) => {
	var width,height,deviceWidthInPixel,deviceHeightInPixel;
	if(watchSize === 42){
		// AppleWatch Series 3 + size 42mm has a resolution of 312x390 px, 302 ppi
		//	DeviceSize: {Width:33.3, Height: 38.6mm}
		//	ScreenSize: {Width: 26mm , Height: 33mm}
		width = 26; height = 33;
		deviceWidthInPixel = width/25.4*ppi;
		deviceHeightInPixel = height/25.4*ppi;
		return {width: deviceWidthInPixel, height:deviceHeightInPixel};
	}else if(watchSize === 38){
		// AppleWatch Series 3 + size 38mm has a resolution of 272x340 px, 290 ppi
		// 	DeviceSize: {Width: 33.3mm, Height:42.5mm}
		//	ScreenSize: {Width: 24mm, Height: 30mm}
		width = 24; height = 30;
		deviceWidthInPixel = width/25.4*ppi;
		deviceHeightInPixel = height/25.4*ppi;
		return {width: deviceWidthInPixel, height:deviceHeightInPixel};
	}else{
		return {width:0, height:0}
	}
}

/**
 * Download user typed content and target phrases
 * you can and should add more measurements
 * that you recorded in your study into the text parameter
 * so that you can save them into a file
 * @param {*} text:
 * @param {*} name:
 * @param {*} type:
 */
function download(text, name, type) {
	// console.log(JSON.parse(text));
	var a = document.createElement("a");
	var file = new Blob([text], {type: type});
	a.href = URL.createObjectURL(file);
	a.download = name;
	a.click();
}

// returns the number of mismatched words from the targetPhrase and inputPhrase
// i.e. number of incorrect words
function numIncorrect(str1, str2) {
    var arr1 = str1.split(" ");
    var arr2 = str2.split(" "); 
    return arr1.diff(arr2).length;
}

// find diff between 2 arrays
Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

/**
 * Watch Class
 * This class extends React.Component
 */
class Watch extends React.Component {

	/**
	 * Constructor
	 * @param {} props: a paramater which enables you to access
	 * 			values passed from parent Component(or Node).
	 * 			e.g., if you pass 'value' as 5 in Watch component
	 * 				<Watch value={5}/>
	 * 				you can access by calling 'this.props.value'
	 * 				props are immutable.
	 */
	constructor(props){
		super(props);

		//Your URL parameter can be accessed with following syntax.
		console.log(this.props.type);
		console.log(this.props.type===undefined);
		this.type = (this.props.type === undefined) ? this.props.match.params.type : this.props.type;
		this.originalScale = (this.props.originalScale === undefined)?this.props.match.params.scaleVal : this.props.originalScale;
        
        // get phraseNum from URL [0-23]
        this.phraseNum = (this.props.phraseNum === undefined) ? this.props.match.params.phraseNum : this.props.phraseNum;

		//this.type = this.props.match.params.type;
		//this.originalScale = this.props.match.params.scaleVal;
		console.log("[Watch] type: "+this.type);
		console.log("[Watch] originalScale: "+this.originalScale);
		// React Component States.
		// inputPhrase: a variable containing all characters typed by users.
		// inputChar: a variable containing your current input character from the Keyboard.
		// if 'inputPhrase' or 'inputChar' value has changed by onKeyCharReceived(),
		// Watch Component will re-render the interface if the state has changed by calling
		// 	setState({});
		this.state = {
			inputPhrase: "",
			inputChar: ""
		};
        
        // set new variables if phraseNum = 0, otherwise get saved variables from sessionStorage
        if (this.phraseNum == 0) {
            this.configCounter = -1; // counter for config array
            this.trialList = [] // array of all trial data
        } else {
            this.configCounter = sessionStorage.getItem("configCounter")
            this.trialList = JSON.parse(sessionStorage.getItem("trialList"))
        }

		// array of target phrases [0-24]
        // selected 24 phrases from phrases2.txt that did not contain any capitals
        // first phrase (index 0) is a test run, actual experiment begins at phrase index 1
		this.targetPhrase = ["my watch fell in the water", 
                             "life is but a dream",
                             "breathing is difficult",
                             "physics and chemistry are hard",
                             "all work and no play",
                             "elections bring out the best",
                             "join us on the patio",
                             "time to go shopping",
                             "a problem with the engine",
                             "elephants are afraid of mice",
                             "my favorite place to visit",
                             "three two one zero blast off",
                             "fish are jumping",
                             "if at first you do not succeed",
                             "the cotton is high",
                             "we run the risk of failure",
                             "prayer in schools offends some",
                             "he is just like everyone else",
                             "the living is easy",
                             "love means many things",
                             "you must be getting old",
                             "peek out the window",
                             "the world is a stage",
                             "the sum of the parts",
                             "do not worry about this"
                            ];
        
        // randomized watch configs for each user (makes the experiment easier)
        // 3 phrases per condition (3 x 8 = 24 total trials per participant)
        // each user gets 
        this.user1 = ["/normal/0.112/",
                      "/normal/0.103/",
                      "/normal/0.112/",
                      "/zoom/0.112/",
                      "/zoom/0.112/",
                      "/zoom/0.103/",
                      "/zoom/0.103/",
                      "/normal/0.103/"
                     ];

        this.user2 = ["/zoom/0.112/",
                      "/zoom/0.112/",
                      "/zoom/0.103/",
                      "/normal/0.103/",
                      "/normal/0.112/",
                      "/normal/0.103/",
                      "/normal/0.112/",
                      "/zoom/0.103/"
                     ];
   
        this.user3 = ["/normal/0.112/",
                      "/zoom/0.103/",
                      "/zoom/0.112/",
                      "/normal/0.112/",
                      "/normal/0.103/",
                      "/zoom/0.112/",
                      "/normal/0.103/",
                      "/zoom/0.103/"
                     ];
        
        this.user4 = ["/zoom/0.103/",
                      "/zoom/0.112/",
                      "/normal/0.103/",
                      "/zoom/0.103/",
                      "/zoom/0.112/",
                      "/normal/0.112/",
                      "/normal/0.103/",
                      "/normal/0.112/",
                      ""
                     ];

        // data to collect
        this.inputPhrase = ""
        this.msElapsed = 0
        this.numIncorrect = 0
        this.numDeletes = 0
        this.WPM = 0
        this.accuracy = 0
        
        // timing vars
        this.timerOn = false
        this.startTime = 0
        this.endTime = 0
        
		// For Debug, uncomment only if you want to measure exact width and height in pixels.
		// Following codes won't be affected on any of your code. 
		/*
		var size42 = deviceIndependenceSize(112,42);
		console.log("AppleWatch 42mm => "+size42.width +"/"+size42.height);
		var size38 = deviceIndependenceSize(112,38);
		console.log("AppleWatch 38mm => "+size38.width +"/"+size38.height);
		*/
	}

	/**
	 * Callback for input character changes.
	 * @param {} c: changed character
	 *
	 * This callback will be passed to child (Keyboard components, in our case).
	 * when the input character received, it changes inputPhrase state.
     * 
     * On deletes, the 'delete' text will be passed in as c
	 */
	onKeyCharReceived = (c) => {
        // if first character entered, set flag on and start timer (timer ends in nextPhrase)
        if (this.timerOn == false) {
            this.timerOn = true
            this.startTime = new Date().getTime()
        }
        
        // handle deletes
        if (c == "delete") {
            this.setState({inputChar : c});
            // remove last char from inputPhrase
            this.state.inputPhrase = this.state.inputPhrase.substring(0, this.state.inputPhrase.length - 1);
            // increment numDeletes
            this.numDeletes++
        } else { // normal char
            this.setState({inputChar : c});
            // add char to inputPhrase
            this.state.inputPhrase += c;
        }
	};

	/** 
     * Log data to files:
     *
	 * keyboardType : normal or zoom
     * originalScale: 0.103 (38mm) or 0.112 (42mm)
     * targetPhrase : phrase to type
     * inputPhrase  : actual phrase typed
     * msElapsed    : time from first char entered to 'Next' pressed (in ms)
     * numIncorrect : number of incorrect words from the targetPhrase
     * WPM          : words per minute
     * numDeletes   : number of deletes pressed
     * accuracy     : how accurate the was user was able to type the phrase, incorrect words and deletes lower accuracy
     */
	saveData = () => {
        let log_file = JSON.stringify(this.trialList)
		download(log_file, "results.txt", "text/plain");
	}

    // do calculations, save, reload page and go to next phrase
    nextPhrase = () => {
        // increment configCounter every 3 phrases, end at index 7
        if ((this.phraseNum % 3 == 0) && (this.configCounter < 7)) {
            this.configCounter++
        }
        
        // get the endTime and turn off timer
        this.endTime = new Date().getTime()
        this.timerOn = false
        
        
        // save the msElapsed time for this phrase
        this.msElapsed = this.endTime - this.startTime
        //console.log(this.endTime - this.startTime)
        
        // save the inputPhrase
        this.inputPhrase = this.state.inputPhrase
        
        // get difference between the targetPhrase and inputPhrase
        this.numIncorrect = numIncorrect(this.targetPhrase[this.phraseNum], this.inputPhrase)
            
        // calculate WPM to 2 decimal places (divide ms by 60000 to get mins)
        // (number of characters typed / 5) / time (mins)
        this.WPM = ((this.state.inputPhrase.length / 5) / (this.msElapsed / 60000)).toFixed(2)
        
        // calculate accuracy (based on words, so char = number of words x 5)
        
        // num chars user entered minus numIncorrect * 5 (positive)
        this.numCharsCorrect = Math.max(this.inputPhrase.length - (this.numIncorrect * 5), 0)
        
        // accuracy % = correct chars / (total chars of phrase + numDeletes) * 100
        this.accuracy = ((this.numCharsCorrect / (this.targetPhrase[this.phraseNum].length + this.numDeletes)) * 100).toFixed(2)
        
        // save all data as a 'trial' object (since this is one trial)
        var trial = {
            keyboardType: this.type,
            originalScale: this.originalScale,
			targetPhrase: this.targetPhrase[this.phraseNum],
			inputPhrase: this.inputPhrase,
            msElapsed: this.msElapsed,
            numIncorrect: this.numIncorrect,
            numDeletes: this.numDeletes,
            WPM: this.WPM,
            accuracy: this.accuracy
        };
        
        console.log(this.trialList)
        this.trialList.push(trial) // save to array of all trials
        sessionStorage.setItem("trialList", JSON.stringify(this.trialList))
        
        // save to file after all 24 phrases are done
        if (this.phraseNum == 24) {
            this.saveData() // save to file
        }
        
        console.log(this.configCounter)
        sessionStorage.setItem("configCounter", this.configCounter)
        // increment phraseNum and refresh the page with new phrase
        this.phraseNum = parseInt(this.phraseNum) + 1
        // manually change this.user<id> between participants
        window.location.href = window.location.href.split('/').slice(0,3).join('/') + this.user1[this.configCounter] + this.phraseNum
    }
    

	/**
	 * Render function()
	 * This function will return UI of the system.
	 *	It will return different text-entry system, depending on which
	 *	type property you did pass from index.js
	 */
	render(){
		// style={{}} is an inline styling with calculated screen size
		if(this.type === 'normal'){
			return(
				<div className="watch">
					 <label>{this.targetPhrase[this.phraseNum]}</label>
					<TextArea inputChar={this.state.inputChar}/>
					<KeyboardNormal originalScale={this.originalScale} onKeyCharReceived ={this.onKeyCharReceived}/>
					<button onClick={this.nextPhrase}>NEXT</button>
				</div>
			);
		}else if(this.type === 'zoom'){
			//the save button below is only to demonstrate to you how to save data
			// to files.
			// call this.saveData function to save user's data
			return(
				<div className="watch">
				  <label>{this.targetPhrase[this.phraseNum]}</label>
					<TextArea inputChar={this.state.inputChar}/>
					<KeyboardZoom originalScale={this.originalScale} onKeyCharReceived ={this.onKeyCharReceived}/>
					<button onClick={this.nextPhrase}>NEXT</button>
				</div>
			);
		}else{
			// exception
			return(
				<div>
					<p> [Rendering Failed] You have got wrong parameters. Check your 'type' property </p>
				</div>
			)
		}
	}
}

export default Watch
