import axios from 'axios';
const API = process.env.REACT_APP_API_URL || 'http://localhost:4000';
export default axios.create({ baseURL: API });
