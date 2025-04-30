'use strict'

// Elementos DOM
const container = document.getElementById('container');
const pesquisaInput = document.getElementById('pesquisa');
const btnNovaMusica = document.getElementById('btn-nova-musica');
const modal = document.getElementById('modal-musica');
const closeBtn = document.querySelector('.close');
const formMusica = document.getElementById('form-musica');
const modalTitulo = document.getElementById('modal-titulo');
const footerAudio = document.getElementById('footer-audio');
const footerSongTitle = document.getElementById('footer-song-title');
const footerArtistName = document.getElementById('footer-artist-name');
const footerPlayPauseButton = document.getElementById('footer-play-pause');
const progressBar = document.getElementById('progress-bar');
const footerAlbumCover = document.getElementById('footer-album-cover');
const footerPrevButton = document.getElementById('footer-prev');
const footerNextButton = document.getElementById('footer-next');

// Variáveis de estado
let musicas = carregarMusicasLocalmente();
let musicaEditando = null;
const imagemCapaPadrao = 'https://img3.stockfresh.com/files/b/butenkow/m/97/7010299_stock-vector-vector-logo-music.jpg';
const linksMusicaPadrao = [
    'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
];
const titulosMusicaPadrao = {
    'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3': 'Rugido do T-Rex',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3': 'SoundHelix Song 1',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3': 'SoundHelix Song 10',
};
let musicaTocando = null;
let tipoReproducao = 'audio'; // 'audio' ou 'youtube'
let currentYouTubeId = null;
let currentIndex = 0; // Para controlar a reprodução da lista de músicas

// Função para obter um link de música padrão aleatório
function obterLinkMusicaPadrao() {
    const indice = Math.floor(Math.random() * linksMusicaPadrao.length);
    return linksMusicaPadrao[indice];
}

// Função para carregar músicas do armazenamento local
function carregarMusicasLocalmente() {
    const storedMusicas = localStorage.getItem('soundstream_musicas');
    return storedMusicas ? JSON.parse(storedMusicas) : [];
}

// Função para salvar músicas no armazenamento local
function salvarMusicasLocalmente() {
    localStorage.setItem('soundstream_musicas', JSON.stringify(musicas));
}

function extrairIdYouTube(url) {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function tocarMusica(musica, index) {
    currentIndex = index;
    const link = musica.link;
    const nomeMusica = musica.nome || titulosMusicaPadrao[link] || 'Música';
    const youtubeId = extrairIdYouTube(link);

    // Interrompe qualquer reprodução anterior
    if (tipoReproducao === 'audio' && footerAudio && !footerAudio.paused) {
        footerAudio.pause();
        footerAudio.currentTime = 0;
    } else if (tipoReproducao === 'youtube' && youtubePlayer && youtubePlayer.getPlayerState() === YT.PlayerState.PLAYING) {
        pauseYouTubeVideo();
    }

    if (youtubeId) {
        tipoReproducao = 'youtube';
        currentYouTubeId = youtubeId;
        playYouTubeVideo(youtubeId);
        footerSongTitle.textContent = nomeMusica;
        footerArtistName.textContent = 'YouTube';
        footerAlbumCover.src = `https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`;
    } else if (link) {
        tipoReproducao = 'audio';
        footerAudio.src = link;
        footerSongTitle.textContent = nomeMusica;
        footerArtistName.textContent = musica.artista || 'Artista Desconhecido'; // Se você tiver essa informação
        footerAlbumCover.src = musica.foto_capa || imagemCapaPadrao;
        footerAudio.play();
    } else {
        alert('Link da música não disponível.');
        resetFooterPlayer();
        return;
    }
    musicaTocando = musica;
    atualizarBotaoPlayPause();
}

function resetFooterPlayer() {
    if (footerAudio) {
        footerAudio.pause();
        footerAudio.currentTime = 0;
    }
    if (youtubePlayer && youtubePlayer.stopVideo) {
        youtubePlayer.stopVideo();
    }
    footerSongTitle.textContent = 'Nenhuma música tocando';
    footerArtistName.textContent = '';
    footerAlbumCover.src = imagemCapaPadrao;
    progressBar.value = 0;
    musicaTocando = null;
    tipoReproducao = 'audio';
    currentYouTubeId = null;
    atualizarBotaoPlayPause();
}

// Função para exibir músicas no container
function exibirMusicas(listaMusicas) {
    container.innerHTML = '';
    if (listaMusicas.length === 0) {
        container.innerHTML = `
            <div class="empty-library">
                <i class="fas fa-music-slash fa-4x"></i>
                <p>Sua biblioteca está vazia. Adicione novas melodias!</p>
            </div>
        `;
        resetFooterPlayer();
        return;
    }
    listaMusicas.forEach((musica, index) => {
        console.log('Dados da música:', musica); // Certifique-se de que este log ainda está aqui e funcionando

        const card = document.createElement('div');
        card.className = 'music-card';
        card.innerHTML = `
            <div class="card-header">
                <img src="${musica.foto_capa || imagemCapaPadrao}" alt="${musica.nome}">
                <div class="overlay">
                    <button class="play-btn" data-index="${index}">
                        <i class="fas fa-play-circle fa-2x"></i>
                        Ouvir
                    </button>
                </div>
            </div>
            <div class="card-body">
                <h3 class="song-title">${musica.nome || 'Título Desconhecido'}</h3>
                <p class="song-duration"><i class="fas fa-hourglass-half"></i> ${musica.duracao || '--:--'}</p>
                <p class="song-release"><i class="fas fa-calendar-alt"></i> ${musica.data_lancamento ? new Date(musica.data_lancamento).toLocaleDateString() : 'Data Desconhecida'}</p>
            </div>
            <div class="card-actions">
                <button class="edit-btn" data-id="${musica.id}" aria-label="Editar"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" data-id="${musica.id}" aria-label="Excluir"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        container.appendChild(card);
    });

    // Adiciona eventos aos botões
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', editarMusica);
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', excluirMusica);
    });
    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', (event) => {
            const index = parseInt(event.currentTarget.dataset.index);
            tocarMusica(listaMusicas[index], index);
        });
    });
}

// Função para atualizar o ícone do botão de play/pause do rodapé
function atualizarBotaoPlayPause() {
    if (tipoReproducao === 'audio') {
        footerPlayPauseButton.innerHTML = footerAudio && !footerAudio.paused ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    } else if (tipoReproducao === 'youtube') {
        const playerState = youtubePlayer ? youtubePlayer.getPlayerState() : -1;
        footerPlayPauseButton.innerHTML = playerState === YT.PlayerState.PLAYING ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    } else {
        footerPlayPauseButton.innerHTML = '<i class="fas fa-play"></i>';
    }
}

// Event listeners para os controles do rodapé
footerPlayPauseButton.addEventListener('click', () => {
    if (tipoReproducao === 'audio') {
        if (footerAudio) {
            footerAudio.paused ? footerAudio.play() : footerAudio.pause();
            atualizarBotaoPlayPause();
        }
    } else if (tipoReproducao === 'youtube' && currentYouTubeId && youtubePlayer) {
        const playerState = youtubePlayer.getPlayerState();
        if (playerState === YT.PlayerState.PLAYING) {
            pauseYouTubeVideo();
        } else if (playerState !== YT.PlayerState.PLAYING && playerState !== YT.PlayerState.ENDED && playerState !== -1) {
            playYouTubeVideo(currentYouTubeId);
        } else if (playerState === YT.PlayerState.ENDED) {
            playYouTubeVideo(currentYouTubeId); // Recomeça se terminou
        } else if (playerState === -1) {
            playYouTubeVideo(currentYouTubeId); // Tenta iniciar se não estiver pronto
        }
        atualizarBotaoPlayPause();
    }
});

footerAudio.addEventListener('ended', () => {
    if (tipoReproducao === 'audio') {
        if (musicas.length > 0 && currentIndex < musicas.length - 1) {
            tocarMusica(musicas[currentIndex + 1], currentIndex + 1);
        } else {
            resetFooterPlayer();
        }
    }
    // Não precisa de lógica específica para YouTube 'ended' aqui,
    // pois o onYouTubePlayerStateChange já cuida da atualização do botão.
});

footerAudio.addEventListener('timeupdate', () => {
    if (tipoReproducao === 'audio' && footerAudio.duration) {
        const duration = footerAudio.duration;
        const currentTime = footerAudio.currentTime;
        const progress = (currentTime / duration) * 100;
        progressBar.value = progress;
    } else {
        progressBar.value = 0;
    }
});

progressBar.addEventListener('input', () => {
    if (tipoReproducao === 'audio' && footerAudio.duration) {
        const seekTime = (progressBar.value / 100) * footerAudio.duration;
        footerAudio.currentTime = seekTime;
    }
});

footerPrevButton.addEventListener('click', () => {
    if (musicas.length > 0 && currentIndex > 0) {
        tocarMusica(musicas[currentIndex - 1], currentIndex - 1);
    }
});

footerNextButton.addEventListener('click', () => {
    if (musicas.length > 0 && currentIndex < musicas.length - 1) {
        tocarMusica(musicas[currentIndex + 1], currentIndex + 1);
    }
});

// Função para abrir o modal de música
function abrirModal(edicao = false, musica = null) {
    musicaEditando = edicao ? musica : null;
    if (edicao && musica) {
        modalTitulo.innerHTML = '<i class="fas fa-edit"></i> Editar Melodia';
        document.getElementById('musica-id').value = musica.id;
        document.getElementById('nome').value = musica.nome || '';
        document.getElementById('link').value = musica.link || '';
        document.getElementById('duracao').value = musica.duracao || '00:00';
        document.getElementById('data_lancamento').value = musica.data_lancamento ? formatarDataParaInput(musica.data_lancamento) : '';
        document.getElementById('foto_capa').value = musica.foto_capa || '';
        document.getElementById('letra').value = musica.letra || '';
        document.getElementById('artista').value = musica.artista || '';
    } else {
        modalTitulo.innerHTML = '<i class="fas fa-plus-circle"></i> Adicionar Nova Melodia';
        formMusica.reset();
    }
    modal.style.display = 'block';
}

// Função para formatar a data para o formato de input (YYYY-MM-DD)
function formatarDataParaInput(dataString) {
    const data = new Date(dataString);
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `<span class="math-inline">\{ano\}\-</span>{mes}-${dia}`;
}

// Função para fechar o modal
function fecharModal() {
    modal.style.display = 'none';
    musicaEditando = null;
}

// Função para editar música
function editarMusica(event) {
    const id = event.target.closest('.music-card').querySelector('.edit-btn').dataset.id;
    const musica = musicas.find(m => m.id === id);
    if (musica) {
        abrirModal(true, musica);
    } else {
        console.error('Música não encontrada para edição:', id);
        alert('Erro ao carregar melodia para edição.');
    }
}

// Função para excluir música
function excluirMusica(event) {
    const id = event.target.closest('.music-card').querySelector('.delete-btn').dataset.id;
    const musicaNome = musicas.find(m => m.id === id)?.nome || 'esta melodia';
    if (confirm(`Tem certeza que deseja remover "${musicaNome}" da sua biblioteca?`)) {
        musicas = musicas.filter(musica => musica.id !== id);
        salvarMusicasLocalmente();
        exibirMusicas(musicas);
        alert('Melodia removida com sucesso!');
    }
}

// Função para pesquisar músicas
function pesquisarMusicas() {
    const termo = pesquisaInput.value.toLowerCase();
    const filtradas = musicas.filter(musica =>
        (musica.nome && musica.nome.toLowerCase().includes(termo)) ||
        (musica.letra && musica.letra.toLowerCase().includes(termo)) ||
        (musica.artista && musica.artista.toLowerCase().includes(termo))
    );
    exibirMusicas(filtradas);
}

// Função para gerar um ID único simples
function gerarIdUnico() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
}

// Event Listeners
btnNovaMusica.addEventListener('click', () => abrirModal());
closeBtn.addEventListener('click', fecharModal);
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        fecharModal();
    }
});
pesquisaInput.addEventListener('input', pesquisarMusicas);
formMusica.addEventListener('submit', (event) => {
    event.preventDefault();
    const nome = document.getElementById('nome').value.trim();
    const link = document.getElementById('link').value.trim() || obterLinkMusicaPadrao();
    const duracao = document.getElementById('duracao').value.trim();
    const data_lancamento = document.getElementById('data_lancamento').value;
    const foto_capa = document.getElementById('foto_capa').value.trim() || imagemCapaPadrao;
    const letra = document.getElementById('letra').value.trim();
    const artista = document.getElementById('artista')?.value?.trim();

    if (!nome || !duracao || !data_lancamento) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    const novaMusica = {
        id: musicaEditando ? musicaEditando.id : gerarIdUnico(),
        nome: nome,
        link: link,
        duracao: duracao,
        data_lancamento: data_lancamento,
        foto_capa: foto_capa,
        letra: letra,
        artista: artista
    };

    if (musicaEditando) {
        musicas = musicas.map(musica => musica.id === novaMusica.id ? novaMusica : musica);
        alert(`"${novaMusica.nome}" atualizada com sucesso!`);
    } else {
        musicas.unshift(novaMusica);
        alert(`"${novaMusica.nome}" adicionada à sua biblioteca!`);
    }
    
    salvarMusicasLocalmente();
    exibirMusicas(musicas);
    fecharModal();
    });
    
    // Inicialização
    document.addEventListener('DOMContentLoaded', () => {
    exibirMusicas(musicas);
    });