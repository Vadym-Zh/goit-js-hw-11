import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadMore: document.querySelector('.load-more'),
};

refs.form.addEventListener('submit', onSearch);
refs.loadMore.addEventListener('click', onLoadMore);

refs.loadMore.style.display = 'none';
let shownImg = 0;
let page = 1;

//  Запит пошуку
function onSearch(e) {
  e.preventDefault();
  // відображено картинок
  shownImg = 0;
  // Очищення галереї
  refs.gallery.innerHTML = '';

  const name = refs.form.querySelector('input').value.trim();

  if (name !== '') {
    GetAPI(name);
  } else {
    refs.loadMore.style.display = 'none';
    return Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}

// Запит на API;

async function GetAPI(name, page) {
  const BASE_URL = 'https://pixabay.com/api/';

  const options = {
    params: {
      key: '31311372-7a32d736a6b9fd9c5281051f5',
      q: name,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      page: page,
      per_page: 40,
    },
  };

  try {
    const response = await axios.get(BASE_URL, options);
    shownImg += response.data.hits.length;
    message(
      response.data.hits.length,
      shownImg,
      options.params.per_page,
      response.data.total
    );

    renderGallery(response.data);
  } catch (error) {
    console.log(error);
  }
}
//  Дозавантаження картинок
function onLoadMore() {
  refs.loadMore.style.display = 'none';
  page += 1;
  let name = refs.form.querySelector('input').value.trim();
  GetAPI(name, page);
  refs.loadMore.style.display = 'flex';
}
//  Рендер галереї
function renderGallery(picture) {
  const markup = picture.hits
    .map(
      hit => `<a class="gallery__link" href="${hit.largeImageURL}">
        <div class="photo-card">
    <img src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" />
    <div class="info">
      <p class="info-item">
        <b>Likes</b>
        ${hit.likes}
      </p>
      <p class="info-item">
        <b>Views</b>
        ${hit.views}
      </p>
      <p class="info-item">
        <b>Comments</b>
        ${hit.comments}
      </p>
      <p class="info-item">
        <b>Downloads</b>
        ${hit.downloads}
      </p>
    </div>
  </div>
  </a>`
    )
    .join('');
  refs.gallery.insertAdjacentHTML('beforeend', markup);
  simpleLightBox.refresh();
}

const simpleLightBox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

function message(length, shownImg, per_page, total) {
  if (!length) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
  if (length >= shownImg) {
    refs.loadMore.style.display = 'flex';
    Notify.info(`Hooray! We found ${total} images.`);
  }
  if (shownImg >= total) {
    refs.loadMore.style.display = 'none';
    Notify.info("We're sorry, but you've reached the end of search results.");
  }
}
