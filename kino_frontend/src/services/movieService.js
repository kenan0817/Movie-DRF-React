import api from "../api/axios";
export const getMovies = async (page = 1, pageSize = 10) => {
    const response = await api.get("movie-list/", {
        params: {
            page,
            page_size: pageSize,
        },
    });
    return response.data;
};

export const getMovieDetail = async (id) => {
    const response = await api.get(`movie-list/${id}/`);
    return response.data;
};
