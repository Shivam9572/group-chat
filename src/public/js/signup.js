
document.getElementById("signupForm").addEventListener("submit", handleSubmit);


async function handleSubmit(e) {
    e.preventDefault();
    const name= document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone= document.getElementById("phone").value;
    const password = document.getElementById("password").value;

    try {
        const res = await axios.post("/user/signup", {
            name,
            phone,
            email,
            password,
        });
        if(res.data.success !== true){
            alert(res.data.message || "signup failed ❌");
            window.location.href = "/user/signup";
            return;
        }
        alert("signup successful ✅");

        window.location.href = "/user/login";

    } catch (err) {
        if (err.response) {
            alert(err.response.data.message || "signup failed ❌");
        } else {
            alert("Server error ❌");
        }
    }
}
