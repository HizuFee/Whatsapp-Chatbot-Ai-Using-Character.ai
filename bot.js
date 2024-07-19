const venom = require('venom-bot');
const CharacterAI = require('node_characterai');

const characterAIClient = new CharacterAI();

const CHARACTER_ID = 'awbtz.....'; // Replace with your Character ID
const ACCESS_TOKEN = 'cc2cd.....'; // Replace with your Access Token
let chat;

async function initializeCharacterAI() {
    console.log('Authenticating Character AI...');
    await characterAIClient.authenticateWithToken(ACCESS_TOKEN);
    chat = await characterAIClient.createOrContinueChat(CHARACTER_ID);
    console.log('Character AI successfully initialized:', chat);
}

async function getCharacterResponse(message) {
    console.log('Starting or continuing chat with Character AI...');
    let response;
    try {
        response = await chat.sendAndAwaitResponse(message);
        console.log('Character AI response object:', response);
        if (Array.isArray(response) && response.length > 0) {
            response = response[0];  // Get the first element if the response is an array
        }
        if (!response || !response.text) {
            throw new Error('Character AI did not provide a valid response.');
        }
    } catch (error) {
        console.error('Failed to get response from Character AI:', error);
        response = { text: 'Failed to get response from Character AI:' };
    }
    return response.text;
}

async function start(client) {
    console.log('Client successfully created');
    await initializeCharacterAI();

    client.onMessage(async message => {
        try {
            if (message.body.startsWith('!')) {
                const command = message.body.slice(2);

                if (command === 'resetChat') {
                    await resetChat();
                    await client.sendText(message.from, 'Chat has been reset.');
                } else {
                    const response = await getCharacterResponse(command);
                    await client.sendText(message.from, response);
                }
            }
        } catch (error) {
            console.error('Failed to send response:', error);
        }
    });
}

async function resetChat() {
    try {
        await chat.saveAndStartNewChat();
        console.log('Chat successfully reset and new chat started.');
    } catch (error) {
        console.error('Failed to reset chat:', error);
    }
}

venom.create('sessionName', undefined, undefined, {
    headless: true,
    folderName: 'sessions'   // Ensure 'sessions' folder exists in working directory
})
    .then(client => start(client))
    .catch(error => {
        console.error(error);
    });
    
