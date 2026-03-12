import api from "../api/axios";
export const getMovies = async () => {
    const response = await api.get("movie-list/");
    return response.data;
}