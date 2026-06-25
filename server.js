const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Guarda as coordenadas, nick e cor de cada usuário
const usuarios = {};

io.on('connection', (socket) => {
    console.log('Um usuário entrou! ID: ' + socket.id);

    // Cria o registro, mas deixa desativado até fazer login
    usuarios[socket.id] = { 
        x: 400, 
        y: 300, 
        nick: '', 
        cor: '#e67e22',
        ativo: false 
    };

    // Escuta quando o usuário escolhe o Nick e a Cor e clica em Entrar
    socket.on('entrar_na_sala', (dadosLogin) => {
        if (usuarios[socket.id]) {
            usuarios[socket.id].nick = dadosLogin.nick;
            usuarios[socket.id].cor = dadosLogin.cor;
            usuarios[socket.id].ativo = true; // Agora ele ganha vida!

            // Envia a lista para todo mundo
            io.emit('atualizar_usuarios', usuarios);
        }
    });

    socket.on('mover', (dadosPosicao) => {
        if (usuarios[socket.id] && usuarios[socket.id].ativo) {
            usuarios[socket.id].x = dadosPosicao.x;
            usuarios[socket.id].y = dadosPosicao.y;
            io.emit('atualizar_usuarios', usuarios);
        }
    });

    socket.on('enviar_mensagem', (msg) => {
        if (usuarios[socket.id] && usuarios[socket.id].ativo) {
            io.emit('usuario_falou', {
                id: socket.id,
                mensagem: msg
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('Um usuário saiu do chat.');
        delete usuarios[socket.id];
        io.emit('atualizar_usuarios', usuarios);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log('SERVIDOR RODANDO! Porta: ' + PORT);
});