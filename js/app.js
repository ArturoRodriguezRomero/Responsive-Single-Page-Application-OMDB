const searchAPIUrl = (apiKey, title) => { return `http://www.omdbapi.com/?apikey=${apiKey}&s=${title}` };
const IDAPIUrl = (apiKey, id) => { return `http://www.omdbapi.com/?apikey=${apiKey}&i=${id}` };
const apiKey = 'f8cab6bc'; // <- I'll know if you grab it ( ͡° ͜ʖ ͡°)

const sidebarContainer = document.querySelector('.sidebar-container');
const sidebarButtons = document.querySelectorAll('.sidebar-body-item');

const sectionContainer = document.querySelector('.section-container');
const sections = document.querySelectorAll('.section');

const sectionHeaderMenu = document.querySelectorAll('.section-header-menu');
const sectionHeaderSubtitles = document.querySelectorAll('.section-header-subtitle');

const sectionContentSearch = document.querySelector('#sectionContentSearch');
const sectionContentSearchIconContainer = document.querySelector('.section-content-search-icon-container');
const sectionShowSearchHistoryIcon = document.querySelector('.section-show-search-history-icon');
const sectionShowSearchHistoryButton = document.querySelector('.section-show-search-history-button');
const sectionSearchHistory = document.querySelector('.section-search-history');

const sectionContentResultMovieContainer = document.querySelector('.section-content-result-movie-container');

const sectionContentMyMovies = document.querySelector('.section-content-my-movies');
const sectionContentMyMoviesTip = document.querySelector('.section-content-my-movies-tip');
const modalContainer = document.querySelector('.modal-container');

var typeTimer;
const typeWaitMilliseconds = 2000;

var searchHistory = new Array();
var myMovies = new Array();

var myMoviesProxy = new Proxy(myMovies, {
    set: function (target, property, value, receiver) {
        target[property] = value;
        if (property == 'length') {
            localStorage.myMovies = JSON.stringify(myMoviesProxy);
            updateMyMoviesResult();
        }
        return true;
    }
});

sidebarButtons.forEach((element) => {
    element.addEventListener('mousedown', (event) => {
        sections.forEach((element) => {
            element.classList.remove('section-visible');
        });
        sidebarButtons.forEach((element) => {
            element.classList.remove('sidebar-button-selected');
        });
        element.classList.add('sidebar-button-selected');
        document.querySelector(`#${element.dataset.sectionTarget}`).classList.add('section-visible');
        sidebarContainer.classList.remove('sidebar-container-visible');
        sectionContainer.classList.remove('section-container-blurred');
        modalContainer.innerHTML = '';
    });
});

sectionHeaderSubtitles.forEach((element, index) => {
    element.addEventListener('mousedown', (event) => {
        sections.forEach((element) => {
            element.classList.remove('section-visible');
        });
        sidebarButtons.forEach((element) => {
            element.classList.remove('sidebar-button-selected');
        });
        sidebarButtons[index].classList.add('sidebar-button-selected');
        document.querySelector(`#${element.dataset.sectionTarget}`).classList.add('section-visible');
        modalContainer.innerHTML = '';
    });
});

sectionHeaderMenu.forEach((element) => {
    element.addEventListener('click', (event) => {
        sidebarContainer.classList.add('sidebar-container-visible');
        sectionContainer.classList.add('section-container-blurred');
    });
});

sectionContainer.addEventListener('mousedown', (event) => {
    if (sidebarContainer.classList.contains('sidebar-container-visible')) {
        sidebarContainer.classList.remove('sidebar-container-visible');
        sectionContainer.classList.remove('section-container-blurred');
    }
    if (modalContainer.childNodes.length != 0) {
        modalContainer.childNodes.forEach((element) => {
            modalContainer.removeChild(element);
            sectionContainer.classList.remove('section-container-blurred');
        });
    }
    event.stopPropagation();
});

sectionContentSearch.addEventListener('keyup', (event) => {
    if (sectionContentSearch.value.trim() != '') {
        sectionContentSearchIconContainer.childNodes[0].classList.remove('section-content-search-icon-visible');
        sectionContentSearchIconContainer.childNodes[1].classList.add('section-content-search-icon-visible');
    } else {
        sectionContentSearchIconContainer.childNodes[0].classList.remove('section-content-search-icon-visible');
        sectionContentSearchIconContainer.childNodes[1].classList.remove('section-content-search-icon-visible');
    }
    clearTimeout(typeTimer);
    typeTimer = setTimeout(() => {
        if (sectionContentSearch.value.trim() != '') {
            addSearchHistoryItem(sectionContentSearch.value.trim());
            populateSearchResult(sectionContentSearch.value.trim());
        }
    }, typeWaitMilliseconds);
});

sectionContentSearchIconContainer.addEventListener('click', (event) => {
    sectionContentSearch.value = '';
    sectionContentResultMovieContainer.innerHTML = '';
    sectionContentSearchIconContainer.childNodes[0].classList.remove('section-content-search-icon-visible');
    sectionContentSearchIconContainer.childNodes[1].classList.remove('section-content-search-icon-visible');
});

sectionShowSearchHistoryButton.addEventListener('click', (event) => {
    if (sectionSearchHistory.classList.contains('section-search-history-visible')) {
        sectionSearchHistory.classList.remove('section-search-history-visible')
    } else {
        sectionSearchHistory.classList.add('section-search-history-visible')
    }
    if (sectionShowSearchHistoryIcon.classList.contains('fa-caret-down')) {
        sectionShowSearchHistoryIcon.classList.remove('fa-caret-down');
        sectionShowSearchHistoryIcon.classList.add('fa-caret-up');
    } else {
        sectionShowSearchHistoryIcon.classList.add('fa-caret-down');
        sectionShowSearchHistoryIcon.classList.remove('fa-caret-up');
    }
});

sectionContentMyMoviesTip.addEventListener('click', (event) => {
    sections.forEach((element) => {
        element.classList.remove('section-visible');
    });
    sidebarButtons[0].classList.remove('sidebar-button-selected');
    sidebarButtons[1].classList.add('sidebar-button-selected');
    document.querySelector('#sectionSearch').classList.add('section-visible');
});

function populateSearchResult(search) {
    searchMovie(search).then((result => {
        sectionContentResultMovieContainer.innerHTML = '';
        if (result.Search == null) {
            sectionContentSearchIconContainer.childNodes[0].classList.add('section-content-search-icon-visible');
            sectionContentSearchIconContainer.childNodes[1].classList.remove('section-content-search-icon-visible');
            return;
        } else {
            modalContainer.innerHTML = '';
        }
        result.Search.map((element, index) => {
            getMovieData(element.imdbID).then((data) => {
                let movie = new Movie(data);
                sectionContentResultMovieContainer.appendChild(movie.getMovieItem());
            });
        });
        sectionContentSearchIconContainer.childNodes[0].classList.add('section-content-search-icon-visible');
        sectionContentSearchIconContainer.childNodes[1].classList.remove('section-content-search-icon-visible');
    }));
}

function updateMyMoviesResult() {
    sectionContentMyMovies.innerHTML = '';
    myMoviesProxy.forEach((element) => {
        sectionContentMyMovies.appendChild(element.getMovieItem());
    });
}

function addSearchHistoryItem(item) {
    searchHistory.push(item);
    sectionSearchHistory.insertAdjacentHTML('beforeend',
        `<div class="section-search-history-item" onclick="populateSearchResult(\'${item}\')">${item}</div>`);
}

function searchMovie(title) {
    return new Promise((resolve, reject) => {
        fetch(searchAPIUrl(apiKey, title)).then((result) => {
            result.json().then((json) => {
                resolve(json);
            });
        }).catch((error) => {
            reject(error);
        });
    });
}

function getMovieData(imdbID) {
    return new Promise((resolve, reject) => {
        fetch(IDAPIUrl(apiKey, imdbID)).then((result) => {
            result.json().then((json) => {
                resolve(json);
            });
        }).catch((error) => {
            reject(error);
        });
    });
}

class Movie {
    constructor(movie) {
        this.Title = movie.Title;
        this.Year = movie.Year;
        this.Rated = movie.Rated;
        this.Released = movie.Released;
        this.Runtime = movie.Runtime;
        this.Genre = movie.Genre;
        this.Director = movie.Director;
        this.Writer = movie.Writer;
        this.Actors = movie.Actors;
        this.Plot = movie.Plot;
        this.Language = movie.Language;
        this.Country = movie.Country;
        this.Awards = movie.Awards;
        this.Poster = movie.Poster;
        this.Ratings = movie.Ratings;
        this.Metascore = movie.Metascore;
        this.imdbRating = movie.imdbRating;
        this.imdbVotes = movie.imdbVotes;
        this.imdbID = movie.imdbID;
        this.Type = movie.Type;
        this.DVD = movie.DVD;
        this.BoxOffice = movie.BoxOffice;
        this.Production = movie.Production;
        this.Website = movie.Website;
        this.Response = movie.Response;
    }

    getMovieItem() {
        let movieItem = document.createElement('div');
        movieItem.classList = 'movie-item';
        movieItem.innerHTML =
            `<div class="movie-item-poster" style="background-image:url(${this.Poster != 'N/A' ? this.Poster : 'https://renderman.pixar.com/assets/camaleon_cms/image-not-found-4a963b95bf081c3ea02923dceaeb3f8085e1a654fc54840aac61a57a60903fef.png'})">
                <!--div class="movie-item-heart ${myMoviesProxy.includes(this) ? 'movie-item-heart-visible' : ''}"><i class="fa fa-heart" aria-hidden="true"></i></div-->
            </div>
            <div class="movie-item-title">${this.Title}</div>
            <div class="movie-item-year">${this.Year}</div>`

        movieItem.addEventListener('click', (event) => {
            sectionContainer.classList.add('section-container-blurred');
            modalContainer.appendChild(this.getMovieModal());
        });

        this.movieItem = movieItem;
        return movieItem;
    }

    getMovieModal() {
        let movieModal = document.createElement('div');
        movieModal.classList = 'movie-modal-detail scroll-bar-container';
        movieModal.innerHTML =
            `<div class="movie-modal-poster" style="background-image:url(${this.Poster != 'N/A' ? this.Poster : 'https://renderman.pixar.com/assets/camaleon_cms/image-not-found-4a963b95bf081c3ea02923dceaeb3f8085e1a654fc54840aac61a57a60903fef.png'})">    
                <div class="movie-modal-close"><i class="fa fa-arrow-left" aria-hidden="true"></i></div>
                <div class="movie-modal-heart"><i class="fa ${myMoviesProxy.find((element) => { return element.imdbID == this.imdbID }) != undefined ? 'fa-heart' : 'fa-heart-o'}" aria-hidden="true"></i></div>
            </div>
            <div class="movie-modal-body">
                <div class="movie-modal-title">${this.Title}</div>
                <div class="movie-modal-year">${this.Year}</div>
                <div class="movie-modal-director">${this.Director}</div>
                <div class="movie-modal-rating-container">
                    <div class="movie-modal-rating-item">
                        <div class="movie-modal-rating-item-icon" style="background-image: url(https://staticv2-4.rottentomatoes.com/static/images/icons/CF_16x16.png);"></div>
                        <div class="movie-modal-rating-item-score">${this.Ratings[1] != null ? this.Ratings[1].Value : 'N/A'}</div>
                    </div>
                    <div class="movie-modal-rating-item">
                        <div class="movie-modal-rating-item-icon" style="background-image: url(https://cdn4.iconfinder.com/data/icons/socialmediaicons_v120/16/imdb.png);"></div>
                        <div class="movie-modal-rating-item-score">${this.Ratings[0] != null ? this.Ratings[0].Value : 'N/A'}</div>
                    </div>
                    <div class="movie-modal-rating-item">
                        <div class="movie-modal-rating-item-icon" style="background-image: url(http://www.headslinger.com/feed_img/1000565.jpg);"></div>
                        <div class="movie-modal-rating-item-score">${this.Ratings[2] != null ? this.Ratings[2].Value : 'N/A'}</div>
                    </div>
                </div>
                <div class="movie-modal-plot">${this.Plot}</div>
            </div>`;
        movieModal.querySelector('.movie-modal-close').addEventListener('click', (event) => {
            modalContainer.innerHTML = '';
            sectionContainer.classList.remove('section-container-blurred');
        });
        movieModal.querySelector('.movie-modal-heart').addEventListener('click', (event) => {
            this.changeMyMovieItem(event, this, this.movieItem);
        });
        return movieModal;
    }

    changeMyMovieItem(event, movie, movieItem) {
        let movieItemHeart = movieItem.querySelector('.movie-item-heart');
        if (!myMoviesProxy.includes(movie)) {
            myMoviesProxy.push(movie);
            event.target.classList.remove('fa-heart-o');
            event.target.classList.add('fa-heart');
        } else {
            myMoviesProxy.splice(myMovies.indexOf(movie), 1);
            event.target.classList.add('fa-heart-o');
            event.target.classList.remove('fa-heart');
        }
    }
}


if (localStorage.myMovies != undefined) {
    if (localStorage.myMovies.length > 0) {
        JSON.parse(localStorage.myMovies).forEach((element) => {
            myMoviesProxy.push(new Movie(element));
        });
        updateMyMoviesResult();
    }
}

