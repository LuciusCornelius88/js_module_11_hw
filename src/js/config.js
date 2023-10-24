import axios from 'axios';
// import 'dotenv/config';

const URL = 'https://pixabay.com';
// const apiKey = process.env.API_KEY;
const apiKey = '40111569-727bf841ed3239fc17d74198a';

const defaultImgType = 'photo';
const defaultCategory = 'nature';
const defaultHitsPerPage = 40;

const axiosInstance = axios.create();
axiosInstance.defaults.baseURL = URL;
axiosInstance.defaults.headers.common['Content-Type'] = 'application / json';

export { axiosInstance, apiKey, defaultImgType, defaultCategory, defaultHitsPerPage };
