export {};

import Vue from 'vue';
import axios from 'axios';

Vue.component("vod-request", {
  template: `
    <div>
      <input v-model="searchQuery" placeholder="Search for movies...">
      <button @click="searchMovies">Search</button>
      <div v-if="movies.length">
        <div v-for="movie in movies" :key="movie.name" class="movie">
          <img :src="movie.poster" alt="Movie Poster">
          <h3>{{ movie.name }}</h3>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      searchQuery: '', // Declare searchQuery
      movies: [] // Declare movies
    };
  },
  methods: {
    async searchMovies() {
      try {
        const response = await axios.post('http://localhost:3000/api/scrape-movies', { query: this.searchQuery });
        this.movies = response.data.movies;
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    }
  },
});