import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { axiosInstance, apiKey, defaultImgType, defaultCategory, defaultHitsPerPage } from './js/config';

// Define custom error class for a case of incorrect input

class NotFoundError {
  constructor() {
    this.name = 'Not found';
    this.message = 'Sorry, there are no images matching your search query. Please try again.';
    this.stack = new Error().stack;
  }
}

NotFoundError.prototype = Object.create(Error.prototype);

// Dom elements

const form = document.querySelector('.search-form');
const inputField = document.querySelector('.input-field');
const inputHistory = document.querySelector('.input-history');
const galleryContainer = document.querySelector('.gallery-container');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more-btn');

const INPUT_HISTORY_KEY = 'inputHistory';
const MAX_HISTORY_LEN = 10;
let currentHistory;

form.addEventListener('submit', getImages);
loadMoreBtn.addEventListener('click', loadMore);
inputHistory.addEventListener('mousedown', chooseInput);
inputField.addEventListener('focus', showInputHistory);
inputField.addEventListener('blur', hideInputHistory);

let currentPage = 1;
let maxImages;
let searchInput;

// Supplementary functions

const onLoad = () => {
  currentHistory = JSON.parse(localStorage.getItem(INPUT_HISTORY_KEY));
  if (!currentHistory) {
    currentHistory = [];
    localStorage.setItem(INPUT_HISTORY_KEY, JSON.stringify(currentHistory));
  } else {
    createInputHistory();
  }
};

const resetCurrentPage = () => {
  currentPage = 1;
};

const incrementCurrentPage = () => {
  currentPage += 1;
};

const resetContent = () => {
  gallery.innerHTML = '';
};

const addHidden = (elem) => {
  elem.classList.add('hidden');
};

const removeHidden = (elem) => {
  elem.classList.remove('hidden');
};

const styleNumbers = (num) => {
  return num.toLocaleString('en-US', {
    style: 'decimal',
    useGrouping: true,
  });
};

onLoad();

// Main functions

function getImages(evt) {
  evt.preventDefault();

  const { target: form } = evt;
  searchInput = form.elements.searchQuery.value;

  resetContent();
  resetCurrentPage();
  addHidden(loadMoreBtn);
  Notiflix.Loading.dots();

  setTimeout(async () => {
    try {
      await handleFetch();
      Notiflix.Loading.remove();
      Notiflix.Notify.success(`You loaded page ${currentPage} of total ${Math.ceil(maxImages / defaultHitsPerPage)} pages`);
      removeHidden(loadMoreBtn);
      currentHistory = JSON.parse(localStorage.getItem(INPUT_HISTORY_KEY));
      if (!currentHistory.includes(searchInput)) {
        if (currentHistory.length === MAX_HISTORY_LEN) {
          currentHistory.shift();
        }
        currentHistory.push(searchInput);
        localStorage.setItem(INPUT_HISTORY_KEY, JSON.stringify(currentHistory));
        createInputHistory();
      }
    } catch (err) {
      addHidden(loadMoreBtn);
      Notiflix.Loading.remove();
      Notiflix.Notify.failure(`${err.name}: ${err.message}`);
    } finally {
      removeHidden(galleryContainer);
    }

    initLightbox();
    lightboxConfig();
  }, 1000);
}

function loadMore() {
  incrementCurrentPage();
  Notiflix.Loading.dots();

  setTimeout(async () => {
    try {
      await handleFetch();
      Notiflix.Loading.remove();
      Notiflix.Notify.success(`You loaded page ${currentPage} of total ${Math.ceil(maxImages / defaultHitsPerPage)} pages`);
      if (defaultHitsPerPage * currentPage >= maxImages) {
        Notiflix.Notify.warning(`You loaded all the ${maxImages} images!`);
        addHidden(loadMoreBtn);
      }
    } catch (err) {
      addHidden(loadMoreBtn);
      Notiflix.Loading.remove();
      Notiflix.Notify.failure(`${err.name}: ${err.message}`);
    }

    lightbox.refresh();
  }, 1000);
}

async function handleFetch() {
  try {
    const images = await fetchImages();
    const markup = createMarkup(images);
    gallery.insertAdjacentHTML('beforeend', markup);
  } catch (err) {
    throw err;
  }
}

async function fetchImages() {
  const requestParams = {
    params: {
      key: apiKey,
      q: searchInput,
      image_type: defaultImgType,
      category: defaultCategory,
      per_page: defaultHitsPerPage,
      page: currentPage,
    },
    validateStatus: (status) => status === 200,
  };

  try {
    const result = await axiosInstance.get('/api/', requestParams);
    if (!maxImages) {
      maxImages = result.data.totalHits;
    }
    return result.data.hits;
  } catch (err) {
    throw err;
  }
}

function createMarkup(data) {
  if (data.length > 0) {
    const markup = data
      .map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
        return `
      <div class="photo-card">
        <div class="photo">
          <a href="${largeImageURL}">
            <img src="${webformatURL}" alt="${tags}" loading="lazy" />
          </a>
        </div>
        <div class="info">
          <div class="info-item">
            <span class="info-item-cat">Likes</span>
            <p class="info-item-value">${styleNumbers(likes)}</p>
          </div>
          <div class="info-item">
            <span class="info-item-cat">Views</span>
            <p class="info-item-value">${styleNumbers(views)}</p>
          </div>
          <div class="info-item">
            <span class="info-item-cat">Comments</span>
            <p class="info-item-value">${styleNumbers(comments)}</p>
          </div>
          <div class="info-item">
            <span class="info-item-cat">Downloads</span>
            <p class="info-item-value">${styleNumbers(downloads)}</p>
          </div>
        </div>
      </div>`;
      })
      .join('');

    return markup;
  } else {
    throw new NotFoundError();
  }
}

function createInputHistory() {
  const markup = currentHistory
    .map((item) => {
      return `
        <div class="history-item-container">
            <span class="history-item">${item}</span>
        </div>`;
    })
    .join('');

  inputHistory.innerHTML = markup;
}

function chooseInput(evt) {
  if (evt.target.classList.contains('history-item')) {
    inputField.value = evt.target.textContent;
  }
}

function showInputHistory() {
  currentHistory = JSON.parse(localStorage.getItem(INPUT_HISTORY_KEY));
  if (currentHistory.length > 0) {
    removeHidden(inputHistory);
  }
}

function hideInputHistory(evt) {
  setTimeout(() => {
    addHidden(inputHistory);
  }, 50);
}

// Simple Lightbox

let lightbox;
let lightboxImg;

function initLightbox() {
  lightbox = new SimpleLightbox('.photo-card a', {
    captionsData: 'alt',
    captionDelay: 150,
    animationSpeed: 300,
    enableKeyboard: false,
  });
}

function lightboxConfig() {
  lightbox.on('shown.simplelightbox', function () {
    lightboxImg = document.querySelector('.sl-image');
    lightboxImg.addEventListener('click', nextOnClick);
    document.addEventListener('keydown', nextOnKey);
    document.addEventListener('keydown', prevOnKey);
    document.addEventListener('keydown', closeOnKey);
  });

  lightbox.on('closed.simplelightbox', function () {
    lightboxImg.removeEventListener('click', nextOnClick);
    document.removeEventListener('keydown', nextOnKey);
    document.removeEventListener('keydown', prevOnKey);
    document.removeEventListener('keydown', closeOnKey);
  });
}

function nextOnClick() {
  lightbox.next();
}

function nextOnKey(evt) {
  if (evt.code === 'Space') {
    lightbox.next();
  }
}

function prevOnKey(evt) {
  if (evt.code === 'Backspace') {
    lightbox.prev();
  }
}

function closeOnKey(evt) {
  if (evt.code === 'Enter') {
    lightbox.close();
  }
}