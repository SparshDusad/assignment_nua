import axios from 'axios';

const API_URL = 'https://openlibrary.org';

export const fetchBooks = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const response = await axios.get(`${API_URL}/search.json?q=the&limit=${limit}&offset=${offset}`);
  return response.data.docs;
};

export const fetchAuthorDetails = async (authorKey) => {
  const response = await axios.get(`${API_URL}/authors/${authorKey}.json`);
  console.log('Author Details Response:', response.data); // Log the response to debug
  return response.data;
};
// className="flex justify-center space-x-2"
