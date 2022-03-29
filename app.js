//Require node modules and make .env variables available to project
require('dotenv').config();

const tmi = require('tmi.js');

//set up connection configs
const client = new tmi.Client({
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
        default:
            //able to convert message to string to check for first word for other future commands like:
            let myMessage = message.toString();
            if((myMessage.split(' ')[0]).toLowerCase() === '!test'){
                client.say(channel, `Test message is obviously: "${myMessage.substring(6)}"`);
            }
            break;
    }
})