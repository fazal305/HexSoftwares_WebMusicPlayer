// Audio player
const audio = new Audio();

// Playlist
const playlist = [
  {
    id: 1,
    title: 'Midnight Dreams',
    artist: 'Lo-Fi Collective',
    duration: '3:24',
    src: 'assets/audio/track-01.mp3',
    cover: 'assets/covers/cover-01.jpg',
    color: '#00f5ff'
  },
  {
    id: 2,
    title: 'Neon Skyline',
    artist: 'Synth Avenue',
    duration: '2:58',
    src: 'assets/audio/track-02.mp3',
    cover: 'assets/covers/cover-02.jpg',
    color: '#ff4fd8'
  },
  {
    id: 3,
    title: 'Digital Horizon',
    artist: 'Future Pulse',
    duration: '4:12',
    src: 'assets/audio/track-03.mp3',
    cover: 'assets/covers/cover-03.jpg',
    color: '#8b5cf6'
  },
  {
    id: 4,
    title: 'Night Drive',
    artist: 'Cyber Waves',
    duration: '3:47',
    src: 'assets/audio/track-04.mp3',
    cover: 'assets/covers/cover-04.jpg',
    color: '#00ff88'
  },
  {
    id: 5,
    title: 'Cosmic Echoes',
    artist: 'Nova Drift',
    duration: '5:01',
    src: 'assets/audio/track-05.mp3',
    cover: 'assets/covers/cover-05.jpg',
    color: '#ff9f43'
  }
];

let currentIndex = 0;
let isPlaying = false;
let isMuted = false;
let previousVolume = 0.75;
let isShuffled = false;
let repeatMode = 'none';

// Load song
function loadSong(index) {
  const song = playlist[index];

  audio.src = song.src;

  $('#song-title').text(song.title);
  $('#song-artist').text(song.artist);

  document.documentElement.style.setProperty('--song-color', song.color);

  $('#album-cover').css({
    backgroundImage: `url(${song.cover})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  });

  highlightActiveRow(index);
}

// Play
function playSong() {
  audio.play();
  isPlaying = true;
  $('#play-btn').text('⏸');
  $('#album-cover').addClass('playing');
}

// Pause
function pauseSong() {
  audio.pause();
  isPlaying = false;
  $('#play-btn').text('▶');
  $('#album-cover').removeClass('playing');
}

// Toggle play
function togglePlayPause() {
  isPlaying ? pauseSong() : playSong();
}

// Next
function nextSong() {
  currentIndex = (currentIndex + 1) % playlist.length;
  loadSong(currentIndex);
  playSong();
}

// Previous
function prevSong() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }

  currentIndex =
    (currentIndex - 1 + playlist.length) % playlist.length;

  loadSong(currentIndex);
  playSong();
}

// Playlist render
function renderPlaylist() {
  let html = '';

  playlist.forEach((song, index) => {
    html += `
      <div class="playlist-item" data-index="${index}">
        <div class="d-flex justify-content-between align-items-center">

          <div>
            <div class="playlist-title">
              ${song.id}. ${song.title}
            </div>
            <div class="playlist-artist">
              ${song.artist}
            </div>
          </div>

          <div class="playlist-duration">
            ${song.duration}
          </div>

        </div>
      </div>
    `;
  });

  $('#playlist-container').html(html);
}

// Highlight active song
function highlightActiveRow(index) {
  $('.playlist-item').removeClass('active');
  $(`.playlist-item[data-index="${index}"]`).addClass('active');
}

// Format time
function formatTime(seconds) {
  if (isNaN(seconds)) return "00:00";

  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);

  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

// Progress update
function updateProgressBar() {
  if (!audio.duration) return;

  const progress = (audio.currentTime / audio.duration) * 100;

  $('#progress-bar').val(progress);

  $('#current-time').text(formatTime(audio.currentTime));
  $('#total-duration').text(formatTime(audio.duration));

  $('#progress-bar').css('--progress', `${progress}%`);
}

// Seek
function seekTo(value) {
  if (!audio.duration) return;

  audio.currentTime = (value / 100) * audio.duration;
}

// End song
function handleSongEnd() {
  nextSong();
}

/* =========================
   VOLUME CONTROLS
========================= */

// Update volume
function updateVolume(value) {
  audio.volume = value / 100;

  $('#volume-value').text(`${value}%`);

  localStorage.setItem('volume', value);

  updateMuteIcon(value);
}

// Toggle mute
function toggleMute() {
  if (isMuted) {
    audio.volume = previousVolume;
    $('#volume-slider').val(previousVolume * 100);
    updateVolume(previousVolume * 100);
    isMuted = false;
  } else {
    previousVolume = audio.volume;
    audio.volume = 0;
    $('#volume-slider').val(0);
    $('#volume-value').text('0%');
    $('#mute-btn').text('🔇');
    isMuted = true;
  }
}

// Update speaker icon
function updateMuteIcon(value) {
  if (value == 0) {
    $('#mute-btn').text('🔇');
    isMuted = true;
  } else if (value < 50) {
    $('#mute-btn').text('🔉');
    isMuted = false;
  } else {
    $('#mute-btn').text('🔊');
    isMuted = false;
  }
}

// Load saved volume
function loadVolume() {
  const saved = localStorage.getItem('volume');

  if (saved !== null) {
    $('#volume-slider').val(saved);
    updateVolume(saved);
  } else {
    $('#volume-slider').val(75);
    updateVolume(75);
  }
}

/* =========================
   INIT
========================= */

$(document).ready(function () {

  renderPlaylist();
  loadSong(currentIndex);
  loadVolume();

  // Playback controls
  $('#play-btn').on('click', togglePlayPause);
  $('#next-btn').on('click', nextSong);
  $('#prev-btn').on('click', prevSong);

  // Playlist click
  $(document).on('click', '.playlist-item', function () {
    currentIndex = Number($(this).data('index'));
    loadSong(currentIndex);
    playSong();
  });

  // Progress bar
  $('#progress-bar').on('input', function () {
    seekTo($(this).val());
  });

  // Volume control
  $('#volume-slider').on('input', function () {
    updateVolume($(this).val());
  });

  // Mute button
  $('#mute-btn').on('click', toggleMute);

  // Audio events
  audio.addEventListener('timeupdate', updateProgressBar);
  audio.addEventListener('ended', handleSongEnd);
  audio.addEventListener('loadedmetadata', updateProgressBar);

});