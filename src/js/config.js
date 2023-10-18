import axios from 'axios';
import 'dotenv/config';

const URL = 'https://pixabay.com/api';
const key = process.env.API_KEY;

const defaultImgType = 'photo';
const defaultCategory = 'nature';
const defaultHitsPerPage = 10;

const axiosInstance = axios.create();
axiosInstance.defaults.headers.common['Content-Type'] = 'application / json';
axiosInstance.defaults.headers.common['Accept'] = 'application / json';

export { axiosInstance, URL, key, defaultImgType, defaultCategory, defaultHitsPerPage };
