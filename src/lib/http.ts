import axios from "axios";

export const http = axios.create({
  timeout: 15_000,
});

export default http;
