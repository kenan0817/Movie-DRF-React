import api from "../api/axios";
export const getMovies = async (page = 1, pageSize = 10, filters = {}) => {
    const response = await api.get("movie-list/", {
        params: {
            page,
            page_size: pageSize,
            ...filters,
        },
    });
    return response.data;
};

export const getAllMovies = async (filters = {}) => {
    let page = 1;
    let hasNextPage = true;
    const movies = [];

    while (hasNextPage) {
        const response = await getMovies(page, 100, filters);
        movies.push(...response.results);
        hasNextPage = Boolean(response.next);
        page += 1;
    }

    return movies;
};

export const getMovieDetail = async (id) => {
    const response = await api.get(`movie-list/${id}/`);
    return response.data;
};
