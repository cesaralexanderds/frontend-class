// === Configuración ===
const OPENWEATHER_API_KEY = "590193a6f21cd9f68ea8dcc97c55cb43";
const OPENWEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";
const JSONPLACEHOLDER_API_URL = "https://jsonplaceholder.typicode.com/posts";

// DOM weather
const cityInputEl = document.getElementById("cityInput");
const searchButtonEl = document.getElementById("searchButton");
const weatherResultEl = document.getElementById("weatherResult");
const errorResultEl = document.getElementById("errorResult");

// DOM posts
const postsTableBodyEl = document.getElementById("postsTableBody");
const postFormEl = document.getElementById("postForm");
const postTitleEl = document.getElementById("postTitle");
const postBodyEl = document.getElementById("postBody");
const postStatusEl = document.getElementById("postStatus");


async function getWeather(city) {
    weatherResultEl.style.display = "none";
    errorResultEl.style.display = "none";
    const url = `${OPENWEATHER_API_URL}?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=es`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log("OpenWeather Response:", data);

        if (response.ok) {
            displayWeatherData(data); // ciudad encontrada true
        } else {
            displayError(`Error ${data.cod}: ${data.message}`);
        }
    } catch (error) {
        console.error("Fetch error:", error);
        displayError("No se pudo conectar al servicio del clima.");
    }
}

function displayWeatherData(data) {
    const description = data.weather[0].description;
    const temp = data.main.temp;
    const city = data.name;

    weatherResultEl.innerHTML = `
        El clima en <strong>${city}</strong> es: ${description}.<br>
        Temperatura actual: <strong>${temp}°C</strong>.
    `;
    weatherResultEl.style.display = "block";
}

function displayError(message) {
    errorResultEl.textContent = message;
    errorResultEl.style.display = "block";
}


async function fetchPosts() {
    try {
        const response = await fetch(JSONPLACEHOLDER_API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const posts = await response.json();
        displayPosts(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
    }
}

function displayPosts(posts) {
    postsTableBodyEl.innerHTML = ""; // limpiar tabla
    posts.forEach(post => {
        const row = postsTableBodyEl.insertRow();
        row.setAttribute("data-post-id", post.id);
        row.innerHTML = `
            <td>${post.title}</td>
            <td><button class="delete-btn" data-post-id="${post.id}">Eliminar</button></td>
        `;
    });
}

async function deletePost(postId) {
    const url = `${JSONPLACEHOLDER_API_URL}/${postId}`;
    try {
        const response = await fetch(url, {
            method: "DELETE"
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log("Post ${postId} eliminado");
        // elimiar entry de la tabla
        const rowToDelete = postsTableBodyEl.querySelector(`tr[data-post-id="${postId}"]`);
        if (rowToDelete) {
            rowToDelete.remove();
        }
    } catch (error) {
        console.error(`Error deleting post ${postId}:`, error);
        alert("Error al eliminar el post.");
    }
}

async function createPost(title, body) {
    postStatusEl.textContent = "Creando post";
    try {
        const response = await fetch(JSONPLACEHOLDER_API_URL, {
            method: "POST",
            body: JSON.stringify({
                title: title,
                body: body,
                userId: 1, 
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        });

        if (!response.ok || response.status !== 201) { 
             throw new Error(`HTTP error! status: ${response.status}`);
        }

        const newPost = await response.json();
        console.log("Nuevo post creado:", newPost);
        postStatusEl.textContent = `Post creado con ID: ${newPost.id}`;
         const row = postsTableBodyEl.insertRow(0); // añadir post al principio
        row.setAttribute("data-post-id", newPost.id);
        row.innerHTML = `
             <td>${newPost.title}</td>
             <td><button class="delete-btn" data-post-id="${newPost.id}">Eliminar</button></td>
        `;
        postFormEl.reset(); // limpiar formulario

    } catch (error) {
        console.error("Error creating post:", error);
        postStatusEl.textContent = "Error al crear el post.";
    }
}


document.addEventListener("DOMContentLoaded", () => {
    // cargar clima de Monterrey al inicio
    getWeather("Monterrey").then(data => {
        if (data) { 
             if (weatherResultEl.style.display === "block" && weatherResultEl.innerHTML.includes("Monterrey")) {
                 monterreyResultEl.innerHTML = weatherResultEl.innerHTML;
                 
             } else if (errorResultEl.style.display === "block"){
                 monterreyResultEl.textContent = errorResultEl.textContent;
                 
             }
         }
    });

    // cargar posts al inicio
    fetchPosts();

    // listener para buscar ciudad
    searchButtonEl.addEventListener("click", () => {
        const city = cityInputEl.value.trim();
        if (city) {
            getWeather(city);
        } else {
            displayError("Por favor, ingresa el nombre de una ciudad.");
        }
    });



    // listener para eliminar posts
    postsTableBodyEl.addEventListener("click", (event) => {
        if (event.target.classList.contains("delete-btn")) {
            const postId = event.target.getAttribute("data-post-id");
            if (confirm(`¿Estás seguro de que deseas eliminar el post ${postId}?`)) {
                deletePost(postId);
            }
        }
    });

    // listener para crear post
    postFormEl.addEventListener("submit", (event) => {
        
        event.preventDefault();
        const title = postTitleEl.value.trim();
        const body = postBodyEl.value.trim();
        if (title && body) {
            createPost(title, body);
        }
    });
}); 