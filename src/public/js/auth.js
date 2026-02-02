if (!localStorage.getItem("token")) {
    window.location.href = "/user/login";
};
let authenticted = async () => {
    try {
        let response = await axios.post('/user/authenticate', {}, {
            headers: {
                authorization: localStorage.getItem("token"),
            }
        });
        if (response.status === 200) {
            return new Promise((resolve, reject) => {
                resolve(true);
            });
        }
        return new Promise((resolve, reject) => {
            resolve(false);
        });

    } catch (error) {
        console.log("Authentication error:", error);
        return new Promise((resolve, reject) => {
            resolve(false);
        });
    }
}
window.onload = async () => {
    let isAuth = await authenticted();
    if (!isAuth) {
        window.location.href = "user/login";
    }

}
const socket = new io("https://group-chat-14df.onrender.com", {
    auth: {
        token: localStorage.getItem("token")
    }
});