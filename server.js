const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Fala para o servidor entregar o arquivo index.html para quem acessar o site
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Quando alguém se conectar ao chat...
io.on('connection', (socket) => {
    console.log('Um usuário entrou no chat! ID: ' + socket.id);

    // Quando o servidor receber uma mensagem de alguém...
    socket.on('mensagem_enviada', (dados) => {
        // Ele repassa essa mensagem para TODO MUNDO na sala
        io.emit('mensagem_recebida', dados);
    });

    // Quando alguém fechar o site...
    socket.on('disconnect', () => {
        console.log('Um usuário saiu do chat.');
    });
});

// O servidor vai rodar na porta 3000
server.listen(3000, () => {
    console.log('SERVIDOR RODANDO! Acesse: http://localhost:3000');
});