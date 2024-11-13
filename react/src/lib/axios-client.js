import axios from "axios";
// import { useStateContext } from "./context/ContextProvider.jsx";
import moment from 'moment'

// eslint-disable-next-line no-extend-native
Date.prototype.toJSON = function () {
  return moment(this).format();
}

const axiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`
})

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ACCESS_TOKEN');
  config.headers.Authorization = `Bearer ${token}`
  return config;
})

axiosClient.interceptors.response.use((response) => {
  return response
}, (error) => {
  const { response } = error;
  if (response.status === 401 && localStorage.getItem('ACCESS_TOKEN')) {
    localStorage.removeItem('ACCESS_TOKEN')
    alert("Session expired, please login.");
    window.location.href = "/login";
  } else if (response.status === 404) {
    alert('Invalid request');
  }

  throw error;
})

export const axiosClientDev = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL_DEV}/api`
})

axiosClientDev.interceptors.request.use((config) => {
  const token = localStorage.getItem('ACCESS_TOKEN');
  config.headers.Authorization = `Bearer ${token}`
  return config;
})

axiosClientDev.interceptors.response.use((response) => {
  return response
}, (error) => {
  const { response } = error;
  if (response.status === 401 && localStorage.getItem('ACCESS_TOKEN')) {
    localStorage.removeItem('ACCESS_TOKEN')
    alert("Session expired, please login.");
    window.location.href = "/login";
  } else if (response.status === 404) {
    alert('Invalid request');
  }

  throw error;
})

export default axiosClient
