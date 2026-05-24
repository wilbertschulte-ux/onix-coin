import axios from "axios";

const API = axios.create({
  baseURL: "https://onix-coin.onrender.com/api/coins",
});

export default API;