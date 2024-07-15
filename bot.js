const venom = require('venom-bot');
const CharacterAI = require('node_characterai');

const characterAIClient = new CharacterAI();

const CHARACTER_ID = 'awbtz.....'; // Ganti dengan karakter ID Anda
const ACCESS_TOKEN = 'cc2cd.....'; // Ganti dengan access token Anda

let chat;

async function initializeCharacterAI() {
    console.log('Mengotentikasi Character AI...');
    await characterAIClient.authenticateWithToken(ACCESS_TOKEN);
    chat = await characterAIClient.createOrContinueChat(CHARACTER_ID);
    console.log('Character AI berhasil diinisialisasi:', chat);
}

async function getCharacterResponse(message) {
    console.log('Memulai atau melanjutkan chat dengan Character AI...');
    let response;
    try {
        response = await chat.sendAndAwaitResponse(message);
        console.log('Objek respon dari Character AI:', response);  // Cetak seluruh objek respon
        // Periksa apakah respons adalah array
        if (Array.isArray(response) && response.length > 0) {
            response = response[0];  // Ambil elemen pertama jika respons adalah array
        }
        if (!response || !response.text) {
            throw new Error('Character AI tidak memberikan respons yang valid.');
        }
    } catch (error) {
        console.error('Gagal mendapatkan respon dari Character AI:', error);
        response = { text: 'kesensor wak, lu ngobrolin apaan kocak' };
    }
    return response.text;
}

venom.create('sessionName', undefined, undefined, {
    headless: true,
    folderName: 'sessions'  // pastikan folder sessions ada di direktori kerja
})
    .then(client => start(client))
    .catch(error => {
        console.error(error);
    });

async function start(client) {
    console.log('Client berhasil dibuat');
    await initializeCharacterAI();

    client.onMessage(async message => {
        try {
            if (message.body.startsWith('! ')) {
                const msgContent = message.body.slice(5);
                const response = await getCharacterResponse(msgContent);
                await client.sendText(message.from, response);
            }
        } catch (error) {
            console.error('Gagal mengirim pesan balasan:', error);
        }
    });    
}
