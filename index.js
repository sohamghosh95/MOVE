'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const apiai = require('apiai');

const app = express();
const appapiai = apiai("9bde731cf1804b4aacc079f5033ff981");


app.set('port', (process.env.PORT || 5000));

// Allows us to process the data
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Set up routes for express.js
app.get('/', function(req, res) {
	res.send("chatbot");
});

// Set up webhook for facebook

let token = "EAAFZAyMCPodoBAGW1kQHZAKhHPEQc86pZC9U5XlY4QrK5GlA7TIgSTgIbZAK7cVzqNhjtwKdWlZCjkhZBdA8pnV6Gi6rNGL8OiXBmnGsbn43ZALNvfcP8mambulHnCfSCQaZCZBtKyD6NoZBx28gmXIQdK3jcZBQmOYZBRjIk9VQY5uzRwZDZD";

app.get('/webhook/', function(req, res) {
	if (req.query['hub.verify_token'] === "soham") {
		res.send(req.query['hub.challenge']);
	}
	res.send("Wrong token");
});

//Setup chatbot to send and recieve messages
app.post('/webhook/', function(req, res) {
	let messaging_events = req.body.entry[0].messaging;

	for (let i = 0; i < messaging_events.length; i++) {
		let event = messaging_events[i];
		let sender = event.sender.id;
		//if there is a message and this message has text
		if (event.message && event.message.text) {
			let text = event.message.text;


            var request = appapiai.textRequest(text, {
                sessionId: '3eabcbdc-46e1-4517-8db9-cfe4b2a65d34'
            });

            request.on('response', function(response) {

                var temp = JSON.stringify(response.result.fulfillment.speech);
                temp = temp.replace('"','');
                temp = temp.replace('"','');

                sendText(sender,temp);
                decideMessage(sender,JSON.stringify(response));

            });

			request.end();

		}

		if(event.postback){
		    let text = JSON.stringify(event.postback);
		    decideMessage(sender,text);
            continue;
		}
	}
	res.sendStatus(200);
});


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function decideMessage(sender,inputText){

//    let text = inputText.toLowerCase();

    let x = JSON.parse(inputText);



//    let tokenizer = new natural.WordTokenizer();
//    let text = tokenizer.tokenize(text2);


    if((x.result.fulfillment.speech === "It seems..") || (x.result.fulfillment.speech === "Let me check on that.")){

        var date = x.timestamp;
                date = date.replace('"','');
                date = date.replace('"','');
                date = date.replace('-','');
                date = date.replace('-','');

                date = date.slice(0,8);

        let trainNo = x.result.parameters.trainNo;
        let trainName = x.result.parameters.train_name;

        if(trainNo != undefined){
            getTrainName(sender,trainNo);
            getTrainStatus(sender,trainNo,date);
        }else{
//            let tempTrainNo = getTrainNameNo(sender,trainName);
            getTrainName(sender,trainNo);

//            getTrainStatus(sender,tempTrainNo);
        }



    }else if((x.result.fulfillment.speech === "Here's a list of trains that got canceled today..")||(x.result.fulfillment.speech === "Trains that got canceled today are..")){

        var date = x.timestamp;
                date = date.replace('"','');
                date = date.replace('"','');
                date = date.replace('-','');
                date = date.replace('-','');

                date = date.slice(0,8);

        var yyyy = date;
                yyyy = yyyy.slice(0,4);

        var mm = date;
                mm = mm.slice(4,6);

        var dd = date;
                dd = dd.slice(6,8);


        getCanceledTrains(sender,dd,mm,yyyy);


    }else if(x.result.fulfillment.speech === "Rescheduled Trains are.."){

        var date = x.timestamp;
                date = date.replace('"','');
                date = date.replace('"','');
                date = date.replace('-','');
                date = date.replace('-','');

                date = date.slice(0,8);

        var yyyy = date;
                yyyy = yyyy.slice(0,4);

        var mm = date;
                mm = mm.slice(4,6);

        var dd = date;
                dd = dd.slice(6,8);

        getRescheduledTrains(sender,dd,mm,yyyy);



    }else if(x.result.fulfillment.speech === "Here's the Train Route."){

        let trainNo = x.result.parameters.trainNo;
        getTrainName(sender,trainNo)
        getTrainRoute(sender,trainNo);



    }else if((x.result.fulfillment.speech === "Just 1 sec 😉")||(x.result.fulfillment.speech === "Ok, here you go.. 😊")){


        let trainNo = x.result.parameters.trainNo;
        getTrainName(sender,trainNo);
        getTrainSchedule(sender,trainNo);



    }else if(x.result.fulfillment.speech === "Just a sec 😉"){

        let trainNo = x.result.parameters.trainNo;
        getTrainName(sender,trainNo);
        getTrainClasses(sender,trainNo);


    }else if(x.result.fulfillment.speech === "Let me have a look 🙂"){
            var date = x.timestamp;
                date = date.replace('"','');
                date = date.replace('"','');
                date = date.replace('-','');
                date = date.replace('-','');

                date = date.slice(0,8);

        var yyyy = date;
                yyyy = yyyy.slice(0,4);

        var mm = date;
                mm = mm.slice(4,6);

        var dd = date;
                dd = dd.slice(6,8);

        var source = x.result.parameters.source;
        var destination = x.result.parameters.destination;

        getTrainsBetweenStations(sender,source,destination,dd,mm);


    }else if(x.result.fulfillment.speech === "Checking my sources 😶"){

            var station = x.result.parameters.railway_station;
            var hours = x.result.parameters.hours_for_arrival;

            getTrainArrivalAtStation(sender,station,hours);




    }else if(x.result.fulfillment.speech === "Here are a few things I can help you with..."){
            //sendText(sender,"Rail Enquiry \n\nLive Train Status \n\nPNR Status \n\nTrains B/W Stations \n\nIncoming Trains at a Station  \n\nCancelled Trains \n\nRescheduled Trains");


            list(sender);
    }else if(x.result.fulfillment.speech === "Here you go"){



            Links(sender);


    }else if(x.result.fulfillment.speech === "Here you go,"){

            sendText(sender,"Customer Care Helpline No : 139"
                    +"\n\n"+"All India Security Helpline No : 182"
                     +"\n\n"+"All India Medical Helpline No : 138"
                    +"\n\n"+"Cleaning Coach : Clean<space><pnrno> to 58888");





    }else if(x.result.fulfillment.speech === "Here you go."){

            let pnrNo = x.result.parameters.pnr_no;


            getPNRStatus(sender,pnrNo);

    }



//    else if(text.includes("cancel") && text.includes("train")){
//
//        cancelledTrains(sender);
//
//        sendButtonMessage(sender);
//
//    }else if(text.includes("position")|| text.includes("status")||text.includes("pos")){
//        sendText(sender,"It seems..");
//
//
//    }else if(text.includes("thanks")|| (text.includes("thank")&& text.includes("you"))){
//        sendText(sender,"You're welcome.");
//        sendText(sender,"Have a safe and happy journey :)");
//
//
//    }


}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function sendText(sender,text){
    let messageData = {text: text}
    sendRequest(sender,messageData);
}


function sendImageMessage(sender){
    let messageData = {
        "attachment":{
            "type":"image",
            "payload":{

                "url":"https://www.w3schools.com/css/img_lights.jpg"
            }
        }

    }
    sendRequest(sender,messageData);
}



function Links(sender){
    let messageData = {
         "attachment":{
            "type":"template",
            "payload":{
                "template_type":"button",
                "text":"List of Important Websites.",
                "buttons":[
                    {
                        "type":"web_url",
                        "url":"www.irctc.co.in",
                        "title":"IRCTC Website"

                    },
                    {
                        "type":"web_url",
                        "url":"http://www.indianrailways.gov.in/",
                        "title":"Indian Railways Website"

                    }
                  ,{
                        "type":"web_url",
                        "url":"http://enquiry.indianrail.gov.in/ntes",
                        "title":"National Train Enquiry"

                    }
                    //,{
//                        "type":"web_url",
//                        "url":"www.air.irctc.co.in/IndianRailways",
//                        "title":"IRCTC Flight Ticket Booking"
//
//                    }
                ]
            }
        }
    }
    sendRequest(sender,messageData);
}

function sendListMessage(sender){
    let messageData = {
         "attachment":{
            "type":"template",
            "payload":{
                "template_type":"button",
                "text":"Show me what can you answer?",
                "buttons":[
                    {
                        "type":"postback",
                        "title":"Status",
                        "payload":"status"
                    },
                    {
                        "type":"postback",
                        "title":"Cancelled Trains",
                        "payload":"cancel"
                    }
                ]
            }
        }
    }
sendRequest(sender,messageData);
}

function list(sender){
    let messageData={
        "attachment": {
        "type": "template",
        "payload": {
            "template_type": "list",
            "top_element_style": "compact",
            "elements": [
                {
                    "title": "Classic White T-Shirt",
                    "image_url": "https://peterssendreceiveapp.ngrok.io/img/white-t-shirt.png",
                    "subtitle": "100% Cotton, 200% Comfortable",
                    "default_action": {
                        "type": "web_url",
                        "url": "https://peterssendreceiveapp.ngrok.io/view?item=100",
                        "messenger_extensions": true,
                        "webview_height_ratio": "tall",
                        "fallback_url": "https://peterssendreceiveapp.ngrok.io/"
                    },
                    "buttons": [
                        {
                            "title": "Buy",
                            "type": "web_url",
                            "url": "https://peterssendreceiveapp.ngrok.io/shop?item=100",
                            "messenger_extensions": true,
                            "webview_height_ratio": "tall",
                            "fallback_url": "https://peterssendreceiveapp.ngrok.io/"
                        }
                    ]
                }
            ]

        }
    }
}
sendRequest(sender,messageData);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Make an API request

//let apiKey = "sxfdq19a";
//let apiKey = "khjc7usb";
//let apiKey = "bb14y9h6";
let apiKey = "7b0k6loj";


//Get Train Name
function getTrainName(sender,trainNo){
    request('http://api.railwayapi.com/name_number/train/'+ trainNo +'/apikey/'+ apiKey, (err, response, body) => {
	  if(JSON.parse(body).error === "Quota exhausted for day"){
	        sendText(sender,JSON.parse(body).error);
	  }else{
        if(JSON.parse(body).train.name != ""){
            sendText(sender,JSON.parse(body).train.number + " " + JSON.parse(body).train.name);
        }else{
            sendText(sender,"Hey I think no such train exists.");
        }

	  }
	});
}

//Get Train Live Status
function getTrainStatus(sender,trainNo,date){

	request('http://api.railwayapi.com/live/train/'+ trainNo +'/doj/'+ date +'/apikey/'+ apiKey, (err, response, body) => {
	  if(JSON.parse(body).error === "Quota exhausted for day"){
	    sendText(sender,JSON.parse(body).error);
	  }else if(JSON.parse(body).error == 510){
        sendText(sender,"Train not scheduled to run on the given date.");

	  }else{
        var string = JSON.stringify(JSON.parse(body).position);

	    if(JSON.parse(body).position != "-"){
            if(string.includes("reached Destination")){
                sendText(sender,JSON.parse(body).position);
            }else{
                sendText(sender,JSON.parse(body).position);

                var routeLength = JSON.parse(body).route;
                for(var i=0;i<routeLength.length;i++){
                    if(!JSON.parse(body).route[i].has_arived && !JSON.parse(body).route[i].has_departed){
                        sendText(sender,"Next Station is "+ JSON.parse(body).route[i].station_.name +"\nExpected Arrival is "+ JSON.parse(body).route[i].actarr +" Hrs");
                        break;
                    }
                }

                for(var i=0;i<routeLength.length;i++){
                    if(JSON.parse(body).route[i].schdep === "Destination"){

                        if(JSON.parse(body).route[i].latemin != 0){
                            sendText(sender,"Train will reach it's destination "+ JSON.parse(body).route[i].station_.name + ", "+ JSON.parse(body).route[i].latemin
                            + " Mins from it's scheduled time "+ JSON.parse(body).route[i].scharr +" Hrs. That is " + JSON.parse(body).route[i].actarr + " Hrs.");
                            break;
                        }else{
                            sendText(sender,"Train will reach it's destination "+ JSON.parse(body).route[i].station_.name +" in it's scheduled time "+ JSON.parse(body).route[i].scharr + " Hrs");
                            break;
                        }

                    }
                }

            }

        }else{
            sendText(sender,"I don't think it's running today.")
        }


	  }
	});
}


//Get Train Route
function getTrainRoute(sender,trainNo){
    request('http://api.railwayapi.com/route/train/'+ trainNo +'/apikey/'+ apiKey, (err, response, body) => {
	  if(JSON.parse(body).error === "Quota exhausted for day"){
	        sendText(sender,JSON.parse(body).error);
	  }else{
            var TrainRoute = JSON.parse(body).route;
            for(var i=0;i<TrainRoute.length;i++){
                sendText(sender,JSON.parse(body).route[i].no + ": "+ JSON.parse(body).route[i].fullname + "(" + JSON.parse(body).route[i].code + ") "+ JSON.parse(body).route[i].scharr + "(A) "
	            + JSON.parse(body).route[i].schdep +"(D)");
            }
	  }
	});
}

//Get Train Schedule
function getTrainSchedule(sender,trainNo){
    request('http://api.railwayapi.com/route/train/'+ trainNo +'/apikey/'+ apiKey, (err, response, body) => {
	  if(JSON.parse(body).error === "Quota exhausted for day"){
	        sendText(sender,JSON.parse(body).error);
	  }else{
	        var string = "";
	        var result = ""
	        var count =0;
	        for(var i=0;i<7;i++){
	            if(JSON.parse(body).train.days[i].runs == "Y"){
	                string = string.concat(JSON.stringify(JSON.parse(body).train.days[i]));
	            }
	        }

            if(string.includes("SUN")){
                result = result.concat("SUN - ");
                count++;
            }
            if(string.includes("MON")){
                result = result.concat("MON - ");
                count++;
            }
            if(string.includes("TUE")){
                result = result.concat("TUE - ");
                count++;
            }
            if(string.includes("WED")){
                result = result.concat("WED - ");
                count++;
            }
            if(string.includes("THU")){
                result = result.concat("THU - ");
                count++;
            }
            if(string.includes("FRI")){
                result = result.concat("FRI - ");
                count++;
            }
            if(string.includes("SAT")){
                result = result.concat("SAT - ");
                count++;
            }
            result = result.substring(0,result.length-2);
            sendText(sender,"Train runs " +count + " days a week "+result);
	  }
	});

}

//Get Train Classes
function getTrainClasses(sender,trainNo){

     request('http://api.railwayapi.com/route/train/'+ trainNo +'/apikey/'+ apiKey, (err, response, body) => {
	  if(JSON.parse(body).error === "Quota exhausted for day"){
	        sendText(sender,JSON.parse(body).error);
	  }else{
	        var string = "";
	        var result = ""
	        var count =0;
	        var classesList = JSON.parse(body).train.classes;
	        for(var i=0;i<classesList.length;i++){
	            if(JSON.parse(body).train.classes[i].available == "Y"){

	                string = string.concat(JSON.stringify(JSON.parse(body).train.classes[i]));
	            }
	        }

            if(string.includes("1A")){
                result = result.concat("1A - ");
                count++;
            }
            if(string.includes("2A")){
                result = result.concat("2A - ");
                count++;
            }
            if(string.includes("3A")){
                result = result.concat("3A - ");
                count++;
            }
            if(string.includes("SL")){
                result = result.concat("SL - ");
                count++;
            }
            if(string.includes("2S")){
                result = result.concat("2S - ");
                count++;
            }
            if(string.includes("FC")){
                result = result.concat("FC - ");
                count++;
            }
            if(string.includes("CC")){
                result = result.concat("CC - ");
                count++;
            }
              if(string.includes("3E")){
                result = result.concat("3E - ");
                count++;
            }

            result = result.substring(0,result.length-2);
            sendText(sender,"There are " +count + " types of classes "+result);


	  }
	});

}

//Get Canceled Trains
function getCanceledTrains(sender,dd,mm,yyyy){

	request('http://api.railwayapi.com/cancelled/date/'+ dd + '-' + mm + '-' + yyyy + '-' +'/apikey/'+ apiKey, (err, response, body) => {
	  if(JSON.parse(body).error === "Quota exhausted for day"){
	    sendText(sender,JSON.parse(body).error);
	  }else{

            for(var i =0 ;i<15;i++){
                sendText(sender,JSON.parse(body).trains[i].train.number + ' ' + JSON.parse(body).trains[i].train.name + ', at ' + JSON.parse(body).trains[i].train.start_time +' Hrs from '
             + JSON.parse(body).trains[i].source.name+'\n');
            }




	  }
	});
}

//Get Rescheduled Trains
function getRescheduledTrains(sender,dd,mm,yyyy){

	request('http://api.railwayapi.com/rescheduled/date/'+ dd + '-' + mm + '-' + yyyy + '-' +'/apikey/'+ apiKey, (err, response, body) => {
	  if(JSON.parse(body).error === "Quota exhausted for day"){
	    sendText(sender,JSON.parse(body).error);
	  }else{
           var trains = JSON.parse(body).trains;
           for(var i =0 ;i<trains.length;i++){
                sendText(sender,JSON.parse(body).trains[0].number
                + ' ' + JSON.parse(body).trains[i].name + ' From ' + JSON.parse(body).trains[i].from.name +' To  '+JSON.parse(body).trains[i].to.name +"\nResheduled on "
                + JSON.parse(body).trains[i].rescheduled_date + " at "+ JSON.parse(body).trains[i].rescheduled_time+"\n"

                );
            }
	  }
});
}


//Get PNR Status
function getPNRStatus(sender,pnrNo){

	request('http://api.railwayapi.com/pnr_status/pnr/'+ pnrNo +'/apikey/'+ apiKey, (err, response, body) => {
	  if(JSON.parse(body).error === "Quota exhausted for day"){
	    sendText(sender,JSON.parse(body).error);
	  }else{
            sendText(sender,JSON.parse(body).train_num + ' ' + JSON.parse(body).train_name +'\nDOJ : '+ JSON.parse(body).doj + '\n'+ JSON.parse(body).from_station.name +' to '
            + JSON.parse(body).to_station.name + '\nBoarding from '+ JSON.parse(body).boarding_point.name);


            for(var i =0 ;i<JSON.parse(body).total_passengers;i++){
                sendText(sender,JSON.parse(body).class+ ','+ JSON.parse(body).passengers[i].current_status
                +' '+JSON.parse(body).passengers[i].booking_status);
            }

	  }
	});
}

//Get Trains between source and destination
function getTrainsBetweenStations(sender,source,destination,dd,mm){

    request('http://api.railwayapi.com/between/source/'+ source +'/dest/'+ destination +'/date/'+dd +'-'+mm+'/apikey/'+ apiKey, (err, response, body) => {
	  if(JSON.parse(body).error === "Quota exhausted for day"){
	        console.log(JSON.parse(body).error);
	  }else{

            sendText(sender,"There are "+JSON.parse(body).total+" trains availble..");

            var trainList = JSON.parse(body).train
            for (var i=0;i<trainList.length;i++){
                sendText(sender,JSON.parse(body).train[i].number +" "+ JSON.parse(body).train[i].name+", "+
                JSON.parse(body).train[i].from.name +" -> " + JSON.parse(body).train[i].to.name +"\nSch Dep : "+JSON.parse(body).train[i].src_departure_time +" Hrs"
                +"\nSch Arr : "+JSON.parse(body).train[i].dest_arrival_time +" Hrs"+"\nTravel Time : "+ JSON.parse(body).train[i].travel_time +" Hrs\n");


            }


	  }
});


}

function getTrainArrivalAtStation(sender,station,hours){
    request('http://api.railwayapi.com/arrivals/station/'+ station +'/hours/'+ hours +'/apikey/'+ apiKey, (err, response, body) => {
	  if(JSON.parse(body).error === "Quota exhausted for day"){
	        sendText(sender,JSON.parse(body).error);
	  }else{

            sendText(sender,"I found "+ JSON.parse(body).total + " trains within " + hours +" Hours.\n");

            var trainList = JSON.parse(body).train;
            for(var i=0;i<trainList.length;i++){

                  sendText(sender,JSON.parse(body).train[i].number +" "+JSON.parse(body).train[i].name +
                   "\nSTA : "+JSON.parse(body).train[i].scharr+ " ETA : "+JSON.parse(body).train[i].actarr +
                   "\nSTD : "+ JSON.parse(body).train[i].schdep+" ETD : "+JSON.parse(body).train[i].actdep+"\n");

            }

	  }
    });

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Webhook Request
function sendRequest(sender,messageData){
    request({
		url: "https://graph.facebook.com/v2.6/me/messages",
		qs : {access_token: token},
		method: "POST",
		json: {
			recipient: {id: sender},
			message : messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log("sending error");
		} else if (response.body.error) {
			console.log("response body error");
		}
	})

}

//express.js listens to port 5000
app.listen(app.get('port'), function() {
	console.log("running: port");
});
