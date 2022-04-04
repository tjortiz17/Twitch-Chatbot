import tmiJs from 'tmi.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

//Require node modules and make .env variables available to project
dotenv.config();

//set up connection configs
const client = new tmiJs.Client({
    options: {debug: true, messagesLogLevel: "info" },
    connection: {
        reconnect: true,
        secure: true
    },
    identity: {
        username: `${process.env.TWITCH_USERNAME}`,
        password: `${process.env.TWITCH_OAUTH}`
    },
    channels: [`${process.env.TWITCH_CHANNEL}`]
});

//connects to specified channel
client.connect().catch(console.error);

//performs api call to get JSON object of the record run in this category and outputs it in chat
async function getRecord(channel) {
    const response = await fetch("https://www.speedrun.com/api/v1/leaderboards/sly1/category/all_keys?top=1");
    let data = await response.json();
    let recordString = buildRecord(data);
    client.say(channel, recordString);
    return data;
}

//builds and returns the string that will be returned by the bot on !wr
//should know/get game name, category queried, and runner who got record
function buildRecord(data){
    let timeInSec = data.data.runs[0].run.times.primary_t;
    let hours = Math.floor(timeInSec / 60 / 60);
    let minutes = Math.floor(timeInSec / 60) - (hours * 60);
    let seconds = timeInSec % 60;
    
    let minuteString = '';
    let secondString = '';
    if(minutes <= 9) minuteString = '0';
    if(seconds <= 9) secondString = '0';

    let record = 'World Record is ' + hours + ':' + minuteString + minutes + ':' + secondString + seconds;
    return record;
}

//pass required params
client.on('message', (channel, tags, message, self) => {
    if(self) return;

    //switch statement to catch commands in chat
    switch(message.toLowerCase()){
        //use tags to obtain username of person who made message
        case 'commands':
            client.say(channel, `$@${tags.username}, available commands are:
                Commands Help Greetings Hi !name
                
                For more help, just type "Help"`);
            break;
        case 'greetings':
            client.say(channel, `Why so formal @${tags.username}?`);
            break;
        case 'hi':
            client.say(channel, `@${tags.username} peepoHappy`);
            break;
        case '!wr':
            getRecord(channel);
            break;
        default:
            //able to convert message to string to check for first word for other future commands like:
            let myMessage = message.toString();
            if((myMessage.split(' ')[0]).toLowerCase() === '!test'){
                client.say(channel, `Test message is obviously: "${myMessage.substring(6)}"`);
            }
            break;
    }
})