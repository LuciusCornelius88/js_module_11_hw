import { axiosInstance, URL, key, defaultImgType, defaultCategory, defaultHitsPerPage } from './js/config';

const form = document.querySelector('.search-form');
form.addEventListener('submit', getImages);

let currentPage = 0;

async function getImages(evt) {
  evt.preventDefault();

  const { target: form } = evt;
  const input = form.elements.searchQuery.value;

  const images = await fetchImages(input);
}

async function fetchImages(input) {
  const requestParams = {
    params: {
      key: key,
      q: input,
      image_type: defaultImgType,
      category: defaultCategory,
      per_page: defaultHitsPerPage,
    },
    validateStatus: (status) => status === 200,
  };

  try {
    const result = await axiosInstance.get(URL, requestParams);
    console.log(result.data);
    return await result.data.hits;
  } catch (err) {
    throw err;
  }
}
