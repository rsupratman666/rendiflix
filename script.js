// =====================================================
// RENDIFlix - script.js
// Dipakai di index.html dan halaman watch-*.html.
// Setiap bagian hanya jalan jika elemennya ada di halaman,
// sehingga tidak ada error "null" di halaman lain.
// =====================================================

// =====================================================
// 1. DATA FILM (edit di sini untuk menambah film)
//    link: halaman nonton. Isi null jika belum tersedia.
//    genres: "action", "drama", "comedy"
// =====================================================
const movies = [
    {
        id: "omar",
        title: "Omar",
        year: "2012",
        rating: "8.9",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfjL9jThQiYH94NavJeEVfQQ4OkQJMWGyCX9-942F9G_i0VkfCuFGjdWM&s=10",
        link: "watch-umar.html",
        genres: ["drama"]
    },
    {
        id: "tokyo-revengers",
        title: "Tokyo Revengers",
        year: "2021",
        rating: "6.5",
        image: "https://m.media-amazon.com/images/M/MV5BYWVkNWFlMGMtOWM4OS00ODEyLTg2MDYtZGM2ZDI4M2I1ZTMyXkEyXkFqcGc@._V1_.jpg",
        link: "watch-tr.html",
        genres: ["action"]
    },
    {
        id: "oppenheimer",
        title: "Oppenheimer",
        year: "2023",
        rating: "8.3",
        image: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        link: null, // belum ada halaman nonton
        genres: ["drama"]
    },
    {
        id: "john-wick-4",
        title: "John Wick 4",
        year: "2023",
        rating: "7.6",
        image: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
        link: null, // belum ada halaman nonton
        genres: ["action"]
    }
];

// =====================================================
// 2. UTILITAS
// =====================================================
const STORAGE_KEY = "myFavorites";

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Mengambil daftar id favorit dari localStorage.
// Juga kompatibel dengan format lama (array objek film).
function getFavorites() {
    try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        if (!Array.isArray(raw)) return [];

        const ids = raw.map(item => {
            const id = typeof item === "string" ? item : item && item.id;
            return String(id || "")
                .toLowerCase()
                .replace(/\s+/g, "-");
        });

        return [...new Set(ids.filter(Boolean))];
    } catch (error) {
        return [];
    }
}

function saveFavorites(ids) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch (error) {
        alert("Favorit tidak dapat disimpan di browser ini.");
    }
}

// =====================================================
// 3. MEMBUAT KARTU FILM
// =====================================================
function createMovieCard(movie) {
    const isFav = getFavorites().includes(movie.id);

    const watchButton = movie.link
        ? `<a class="btn" href="${escapeHtml(movie.link)}">Watch Now</a>`
        : `<button type="button" class="btn btn-disabled" disabled>Segera Hadir</button>`;

    return `
    <div class="movie-card" data-id="${escapeHtml(movie.id)}" data-title="${escapeHtml(movie.title)}">
        <img src="${escapeHtml(movie.image)}" alt="${escapeHtml(movie.title)}" loading="lazy" />
        <div class="movie-info">
            <h3>${escapeHtml(movie.title)}</h3>
            <p>${escapeHtml(movie.year)} | ⭐ ${escapeHtml(movie.rating)}</p>
            ${watchButton}
            <button type="button" class="favorite-btn${isFav ? " active" : ""}" data-id="${escapeHtml(movie.id)}">
                ${isFav ? "♥ Hapus dari Favorit" : "♡ Tambahkan ke Favorit"}
            </button>
        </div>
    </div>`;
}

function renderList(container, list, emptyText) {
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = `<p class="empty-msg">${emptyText}</p>`;
        return;
    }

    container.innerHTML = list.map(createMovieCard).join("");
}

// Menampilkan film ke semua kategori di index.html
function renderCategories() {
    document.querySelectorAll("[data-genre]").forEach(container => {
        const genre = container.dataset.genre;

        const list =
            genre === "all"
                ? movies
                : movies.filter(movie => movie.genres.includes(genre));

        renderList(container, list, "Belum ada film di kategori ini.");
    });
}

// Menampilkan film favorit
function renderFavorites() {
    const container = document.getElementById("favorite-container");
    if (!container) return;

    const favIds = getFavorites();
    const list = favIds
        .map(id => movies.find(movie => movie.id === id))
        .filter(Boolean);

    renderList(container, list, "Belum ada film favorit.");
}

// Render ulang semua daftar film (menjaga status tombol favorit)
function renderAll() {
    renderCategories();
    renderFavorites();

    // Jika sedang ada kata pencarian, terapkan lagi
    if (typeof searchMovie === "function" && searchInput) {
        searchMovie();
    }
}

// =====================================================
// 4. TOMBOL FAVORIT (klik = tambah / hapus)
// =====================================================
function toggleFavorite(id) {
    let favorites = getFavorites();

    if (favorites.includes(id)) {
        favorites = favorites.filter(item => item !== id);
    } else {
        favorites.push(id);
    }

    saveFavorites(favorites);
    renderAll();
}

document.addEventListener("click", event => {
    const button = event.target.closest(".favorite-btn[data-id]");
    if (!button) return;

    toggleFavorite(button.dataset.id);
});

// =====================================================
// 5. SEARCH BOX
// =====================================================
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const searchMessage = document.getElementById("searchMessage");
const clearButton = document.getElementById("clearButton");

function searchMovie() {
    if (!searchInput) return;

    const keyword = searchInput.value.toLowerCase().trim();
    let totalFound = 0;

    // Tombol X hanya tampil jika ada teks
    if (clearButton) {
        clearButton.style.display = keyword ? "block" : "none";
    }

    document
        .querySelectorAll(".category[data-searchable]")
        .forEach(category => {
            let categoryFound = 0;

            category.querySelectorAll(".movie-card").forEach(card => {
                const title = (card.dataset.title || "").toLowerCase();
                const match = title.includes(keyword);

                card.style.display = match ? "" : "none";

                if (match) categoryFound++;
            });

            // Sembunyikan kategori yang tidak punya hasil saat mencari
            category.style.display =
                keyword && categoryFound === 0 ? "none" : "";

            totalFound += categoryFound;
        });

    if (searchMessage) {
        if (keyword && totalFound === 0) {
            searchMessage.textContent = "Film tidak ditemukan!";
            searchMessage.style.display = "block";
        } else {
            searchMessage.style.display = "none";
        }
    }
}

if (searchInput) {
    if (searchButton) searchButton.addEventListener("click", searchMovie);

    // Pencarian langsung saat mengetik
    searchInput.addEventListener("input", searchMovie);

    // Pencarian dengan tombol Enter
    searchInput.addEventListener("keydown", event => {
        if (event.key === "Enter") searchMovie();
    });

    // Tombol X untuk menghapus pencarian
    if (clearButton) {
        clearButton.addEventListener("click", () => {
            searchInput.value = "";
            searchMovie();
            searchInput.focus();
        });
    }
}

// =====================================================
// 6. PLAYER EPISODE (hanya untuk halaman dengan #epsContainer)
// =====================================================
// Isi link episode di sini. Episode yang belum ada cukup dikosongkan.
const episodes = {
    1: "https://player.abyssplayer.com/ufcpbUp83",
    2: "https://player.abyssplayer.com/HeL1b9oaM",
    3: "https://player.abyssplayer.com/_62J9azcb",
    4: "https://player.abyssplayer.com/lvZUEB3hk",
    5: "https://player.abyssplayer.com/qUGbPvan5",
    6: "https://player.abyssplayer.com/DqHDZJn_K",
    7: "https://player.abyssplayer.com/aczik0wKr",
    8: "https://player.abyssplayer.com/Frfww6b5Z",
    9: "https://player.abyssplayer.com/XHanvWLLA",
    10: "https://player.abyssplayer.com/VXJJJCTB7",
    11: "https://player.abyssplayer.com/ZLBdYHRKl",
    12: "https://player.abyssplayer.com/yaZ9teJ_f",
    13: "https://player.abyssplayer.com/4rrTvuIfV",
    14: "https://player.abyssplayer.com/0wXvhlcrB",
    15: "https://player.abyssplayer.com/jVMeBKIb3",
    16: "https://player.abyssplayer.com/y9ivZRN8r",
    17: "https://player.abyssplayer.com/hhGm4tgxg",
    18: "https://player.abyssplayer.com/wvYJkqjSA",
    19: "https://player.abyssplayer.com/eX7n-Chty",
    20: "https://player.abyssplayer.com/l7C6A3XsNJ",
    21: "https://player.abyssplayer.com/dmRjVYkjx",
    22: "https://player.abyssplayer.com/KOIRkcVEg",
    23: "https://player.abyssplayer.com/pWYzAd-BB",
    24: "https://player.abyssplayer.com/SCFmYsEfMJ",
    25: "https://player.abyssplayer.com/o1GniTEA7",
    26: "https://player.abyssplayer.com/eCxeGKS_A",
    27: "https://player.abyssplayer.com/tuq1-4lLg",
    28: "https://player.abyssplayer.com/QAmLvOf0j",
    29: "https://player.abyssplayer.com/LRrv0fnYj",
    30: "https://player.abyssplayer.com/r71gQ_xBw"
    // 3: "https://...",
    // 4: "https://...",
};

const TOTAL_EPISODES = 30;

const videoPlayer = document.getElementById("videoPlayer");
const epsContainer = document.getElementById("epsContainer");

function playEpisode(number) {
    if (!videoPlayer) return;

    if (!episodes[number]) {
        alert("Link episode " + number + " belum tersedia!");
        return;
    }

    // Ganti sumber video hanya jika berbeda (hindari reload)
    if (videoPlayer.getAttribute("src") !== episodes[number]) {
        videoPlayer.src = episodes[number];
    }

    // Atur tombol aktif
    document.querySelectorAll("#epsContainer .btn").forEach(button => {
        button.classList.toggle(
            "active",
            Number(button.dataset.episode) === number
        );
    });
}

function setupEpisodes() {
    if (!epsContainer || !videoPlayer) return;

    for (let i = 1; i <= TOTAL_EPISODES; i++) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn";
        button.dataset.episode = i;
        button.textContent = "eps. " + i;
        button.addEventListener("click", () => playEpisode(i));
        epsContainer.appendChild(button);
    }

    playEpisode(1);
}

// =====================================================
// 7. JALANKAN SETELAH HALAMAN SIAP
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
    renderAll();
    setupEpisodes();
});
