import axios from "axios";
import history from "../history";

//action types
const GET_USER = "GET_USER";
const REMOVE_USER = "REMOVE_USER";

//initial state
const defaultUser = {};

//action creators
const getUser = (user) => ({ type: GET_USER, user });
const removeUser = () => ({ type: REMOVE_USER });

//thunk creators
export const me = () => async (dispatch) => {
	try {
		const { data } = await axios.get("/auth/me");
		dispatch(getUser(data) || defaultUser);
	} catch (error) {
		console.error(error);
	}
};

export const auth = (email, password, method) => async (dispatch) => {
	let res;
	try {
		res = await axios.post(`/auth/${method}`, { email, password });
	} catch (error) {
		return dispatch(getUser({ error: error }));
	}
	//reason for two try/catch blocks is because two things can go wrong
	try {
		dispatch(getUser(res.data));
		history.pushState("/main");
	} catch (error) {
		console.error(error);
	}
};

export const logout = () => async (dispatch) => {
	try {
		await axios.post("/auth/log-out");
		dispatch(removeUser);
		history.push("/log-in");
	} catch (error) {
		console.error(error);
	}
};

//reducer
export default (state = defaultUser, action) => {
	switch (action.type) {
		case GET_USER:
			return action.user;
		case REMOVE_USER:
			return defaultUser;
		default:
			return state;
	}
};