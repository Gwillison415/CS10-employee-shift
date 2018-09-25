import axios from "axios";

// Returns the user of the token that is sent in as an authorization check
export const getUser = () => (dispatch, getState) => {
  dispatch({ type: "FETCHING_USER" });

  const token = getState().user.token;
  if (token) {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    // TODO: GET ACCOUNT ID
    // TODO: Redo with correct endpoint to get user (not list of users)
    axios
      .get(`${process.env.REACT_APP_ROOT_URL}/api/users/`, {
        headers,
      })
      .then(res => {
        if (res.status === 200) {
          console.log(res.data);
          dispatch({ type: "FETCHED_USER", data: res.data });
          return res.data;
        }
      })
      .catch(err => {
        dispatch({ type: "AUTH_ERROR" });
      });
  } else dispatch({ type: "AUTH_ERROR" });
};

// TODO: Encrypt everything
export const signin = (username, password) => dispatch => {
  const body = JSON.stringify({
    grant_type: "password",
    username,
    password,
    client_id: `${process.env.REACT_APP_CLIENT_ID}`,
    client_secret: `${process.env.REACT_APP_CLIENT_SECRET}`,
  });

  axios({
    method: "post",
    url: `${process.env.REACT_APP_ROOT_URL}/o/token/`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cache-Control": "no-cache",
    },
    data: body,
  })
    .then(res => {
      if (res.status === 200) {
        dispatch({ type: "SIGNIN_SUCCESS", data: res.data });
        return res.data;
      }
    })
    .catch(err => {
      if (err.status < 500) {
        console.log("Server Error!");
        return { status: err.status, data: err.data };
      } else if (err.status === 403 || err.status === 401) {
        dispatch({ type: "ERROR", data: err.data });
        throw err.data;
      }
    });
};

export const signout = () => dispatch => {
  const token = localStorage.getItem("token");

  if (token) {
    const body = JSON.stringify({
      token,
      client_id: `${process.env.REACT_APP_CLIENT_ID}`,
      client_secret: `${process.env.REACT_APP_CLIENT_SECRET}`,
    });

    axios({
      method: "post",
      url: `${process.env.REACT_APP_ROOT_URL}/o/revoke_token/`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: body,
    })
      .then(res => {
        if (res.status === 200) {
          dispatch({ type: "SIGNOUT_SUCCESS", data: res.data });
          return res.data;
        }
      })
      .catch(err => {
        if (err.status < 500) {
          console.log("Server Error!");
          return { status: err.status, data: err.data };
        } else if (err.status === 403 || err.status === 401) {
          dispatch({ type: "ERROR", data: err.data });
          throw err.data;
        }
      });
  } else dispatch({ type: "SIGNOUT_SUCCESS" });
};

// TODO: Encrypt everything
// Sign up for a business account
export const signup = (
  username,
  password,
  re_password,
  email,
  first_name,
  last_name
) => dispatch => {
  const body = JSON.stringify({
    username,
    password,
    re_password,
    email,
    first_name,
    last_name,
    is_staff: "true",
  });

  axios({
    method: "post",
    url: `${process.env.REACT_APP_ROOT_URL}/api/sign_up/`,
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
  })
    .then(res => {
      if (res.status === 201) {
        dispatch({ type: "SIGNUP_SUCCESS", data: res.data });
        return res.data;
      }
    })
    .catch(err => {
      // TODO: Render error message
      if (err.status < 500) {
        console.log("Server Error!");
        return { status: err.status, data: err.data };
      } else if (err.status === 403 || err.status === 401) {
        dispatch({ type: "ERROR", data: err.data });
        throw err.data;
      }
    });
};

// CURRENTLY TESTING
// BACK END TO HANDLE OLD VS NEW PASSWORD
// Can only change their own information
export const updateUser = (
  email,
  phone,
  text_enabled,
  email_enabled,
  old_password,
  new_password
) => (dispatch, getState) => {
  const token = getState().user.token;
  // Implemented once getOwnUser works
  // const id = getState().user.currentUser.id;
  const id = 1;

  // username, email, password, re_password, firstname, lastname
  if (token) {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // More form items for validation

    const body = {
      // username: "admin", 500 error when you send "username" and "password"
      email,
    };
    axios({
      method: "patch",
      url: `${process.env.REACT_APP_ROOT_URL}/api/users/${id}/`,
      headers,
      data: body,
    })
      .then(res => {
        if (res.status === 200) {
          dispatch({ type: "UPDATE_SUCCESS", data: res.data });
          return res.data;
        }
      })
      .catch(err => {
        if (err.status < 500) {
          console.log("Server Error!");
          return { status: err.status, data: err.data };
        } else if (err.status === 403 || err.status === 401) {
          dispatch({ type: "ERROR", data: err.data });
          throw err.data;
        }
      });
  } else dispatch({ type: "ERROR", data: "no auth!" });
};
