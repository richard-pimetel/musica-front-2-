var youtubePlayer;
var youtubeVideoId;

function onYouTubeIframeAPIReady() {
  youtubePlayer = new YT.Player('youtube-player', {
    height: '0',
    width: '0',
    videoId: '',
    playerVars: {
      'playsinline': 1
    },
    events: {
      'onReady': onYouTubePlayerReady,
      'onStateChange': onYouTubePlayerStateChange
    }
  });
}

function onYouTubePlayerReady(event) {
  // O player do YouTube está pronto
}

function onYouTubePlayerStateChange(event) {
  // Estado do player do YouTube mudou
  const playPauseButton = document.getElementById('footer-play-pause');
  if (playPauseButton) {
    if (event.data === YT.PlayerState.ENDED) {
      playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
    } else if (event.data === YT.PlayerState.PLAYING) {
      playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
    } else if (event.data === YT.PlayerState.PAUSED) {
      playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
    }
  }
}

function playYouTubeVideo(id) {
  youtubeVideoId = id;
  if (youtubePlayer && youtubePlayer.loadVideoById) {
    youtubePlayer.loadVideoById(id);
    youtubePlayer.playVideo();
    const playPauseButton = document.getElementById('footer-play-pause');
    if (playPauseButton) {
      playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
    }
  }
}

function pauseYouTubeVideo() {
  if (youtubePlayer && youtubePlayer.getPlayerState() === YT.PlayerState.PLAYING) {
    youtubePlayer.pauseVideo();
    const playPauseButton = document.getElementById('footer-play-pause');
    if (playPauseButton) {
      playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
    }
  }
}

// Carrega a API do YouTube IFrame Player
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);