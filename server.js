const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Objeto para guardar as coordenadas de cada usuário conectado
const usuarios = {};

io.on('connection', (socket) => {
    console.log('Um usuário entrou! ID: ' + socket.id);

    // Define uma posição inicial padrão para quem entra
    usuarios[socket.id] = { x: 200, y: 200 };

    // Envia a lista atualizada para todo mundo
    io.emit('atualizar_usuarios', usuarios);

    // Escuta quando um usuário se mexe
    socket.on('mover', (dadosPosicao) => {
        if (usuarios[socket.id]) {
            usuarios[socket.id].x = dadosPosicao.x;
            usuarios[socket.id].y = dadosPosicao.y;
            
            // Avisa todo mundo sobre a nova posição desse boneco
            io.emit('atualizar_usuarios', usuarios);
        }
    });

    // Escuta quando alguém envia mensagem
    socket.on('enviar_mensagem', (msg) => {
        io.emit('usuario_falou', {
            id: socket.id,
            mensagem: msg
        });
    });

    // Quando o usuário desconecta
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