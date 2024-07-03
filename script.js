
console.log("lets write js");

let currentSong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUl = document.querySelector(".songList ul");
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML += `<li><img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Hardik</div>
                            </div>
                            <div class="playNow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div></li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
    return songs;
}


const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        document.getElementById('play').src = "img/pause.svg";
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let a = await fetch(`songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");

    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        const href = e.href;
        console.log(href);
        if (href.endsWith('/cs') || href.endsWith('/ncs') || href.endsWith('/dinner') || href.endsWith('/party') || href.endsWith('/big') || href.endsWith('/bolly') || href.endsWith('/holly') || href.endsWith('/chill') || href.endsWith('/diljit') || href.endsWith('/pop') || href.endsWith('/rap')) {
            const parts = href.split("/");
            const folderName = parts[parts.length - 1];
            let folder = folderName;

            let a = await fetch(`songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);
            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="4,2 20,12 4,22" style="fill:black;" />
                </svg>
            </div>
            <img src="songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`;
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}


async function main() {
    const play = document.getElementById('play');
    const next = document.getElementById('next');
    const prev = document.getElementById('prev');
    const volumeIcon = document.querySelector(".volume > img");
    const volumeSlider = document.querySelector(".range input");

    console.log("Elements:", { play, next, prev, volumeIcon, volumeSlider });

    await getSongs("songs/ncs");
    playMusic(songs[0], true);
    displayAlbums();

    if (play) {
        play.addEventListener("click", () => {
            if (currentSong.paused) {
                currentSong.play();
                play.src = "img/pause.svg";
            } else {
                currentSong.pause();
                play.src = "img/play.svg";
            }
        });
    } else {
        console.error("Play button not found");
    }

    if (prev) {
        prev.addEventListener("click", () => {
            console.log("Prev Clicked");
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
            console.log("Prev index:", index);
            if ((index - 1) >= 0) {
                playMusic(songs[index - 1]);
            }
        });
    } else {
        console.error("Prev button not found");
    }

    if (next) {
        next.addEventListener("click", () => {
            currentSong.pause();
            console.log("Next Clicked");
            let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
            console.log("Next index:", index);
            if ((index + 1) < songs.length) {
                playMusic(songs[index + 1]);
            }
        });
    } else {
        console.error("Next button not found");
    }

    if (volumeSlider) {
        volumeSlider.addEventListener("change", (e) => {
            console.log("Setting volume to:", e.target.value, "/100");
            currentSong.volume = parseInt(e.target.value) / 100;
        });
    } else {
        console.error("Volume slider not found");
    }

    if (volumeIcon) {
        volumeIcon.addEventListener("click", e => {
            if (e.target.src.includes("volume.svg")) {
                e.target.src = e.target.src.replace("volume.svg", "mute.svg");
                currentSong.volume = 0;
                volumeSlider.value = 0;
            } else {
                e.target.src = e.target.src.replace("mute.svg", "volume.svg");
                currentSong.volume = 0.1;
                volumeSlider.value = 10;
            }
        });
    } else {
        console.error("Volume icon not found");
    }

    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songTime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });
}

main();

