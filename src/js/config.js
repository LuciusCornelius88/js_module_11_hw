import axios from 'axios';
import 'dotenv/config';

const URL = 'https://pixabay.com';
const apiKey = process.env.API_KEY;

const defaultImgType = 'photo';
const defaultCategory = 'nature';
const defaultHitsPerPage = 40;

const axiosInstance = axios.create();
axiosInstance.defaults.baseURL = URL;
axiosInstance.defaults.headers.common['Content-Type'] = 'application / json';

export { axiosInstance, apiKey, defaultImgType, defaultCategory, defaultHitsPerPage };
