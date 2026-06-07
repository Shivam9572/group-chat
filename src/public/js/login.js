document.getElementById("loginform").addEventListener("submit", handleSubmit);

async function handleSubmit(e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const phone= document.getElementById("phone").value;
    const password = document.getElementById("password").value;

    try {
        const res = await axios.post("/user/login", {
            phone,
            email,
            password,
        });


        if(res.data.success !== true){
            alert(res.data.message || "Login failed ❌");
            window.location.href = "/user/login";
            return;
        }
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("name", res.data.name);
            localStorage.setItem("email",res.data.email);
            localStorage.setItem("phone",res.data.phone);
        
        alert("Login successful ✅");
        
        
        window.location.href = "/";
        // redirect example
        // window.location.href = "/dashboard";

    } catch (err) {
        if (err.response) {
            alert(err.response.data.message || "Login failed ❌");
        } else {
            alert("Server error ❌");
        }
    }
}
