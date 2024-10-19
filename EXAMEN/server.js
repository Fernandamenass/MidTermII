const express = require('express');
const app = express();
const https = require('https');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.engine("ejs", require("ejs").renderFile);
app.set("view engine", "ejs");

let characters = []; // Aquí se guardan los personajes obtenidos de la API
let currentIndex = 0;

// Función para cargar los personajes de la API
function loadCharacters(callback) {
    const url = 'https://akabab.github.io/superhero-api/api/all.json';
    https.get(url, (response) => {
        let data = '';
        response.on('data', chunk => {
            data += chunk;
        });
        response.on('end', () => {
            try {
                characters = JSON.parse(data);
                console.log('Superheroes loaded successfully!');
                callback();
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        });
    }).on('error', (error) => {
        console.error('Error fetching API:', error);
    });
}

// Ruta principal
app.get('/', (req, res) => {
    if (characters.length === 0) {
        return res.send('No characters found. Please try again later.');
    }
    const character = characters[currentIndex];
    res.render("home", { character });
});

// Navegación (Previous)
app.get('/character/prev', (req, res) => {
    if (characters.length === 0) {
        return res.send('No characters found.');
    }
    currentIndex = (currentIndex - 1 + characters.length) % characters.length; // Retrocede y va al final
    const character = characters[currentIndex];
    res.render("home", { character });
});

// Navegación (Next)
app.get('/character/next', (req, res) => {
    if (characters.length === 0) {
        return res.send('No characters found.');
    }
    currentIndex = (currentIndex + 1) % characters.length; // Avanza y regresa al inicio
    const character = characters[currentIndex];
    res.render("home", { character });
});

// Ruta para ver un personaje por su ID
app.get('/character/:id', (req, res) => {
    const id = parseInt(req.params.id);

    if (id >= 0 && id < characters.length) {
        currentIndex = id; // Actualiza el índice actual al personaje seleccionado
        const character = characters[currentIndex];
        res.render("home", { character });
    } else {
        res.send(`
            <div style="font-size: 24px; color: red; text-align: center; margin-top: 50px; padding: 20px; border: 2px solid red; border-radius: 10px; background-color: #f8d7da;">
                Character not found. <a href="/">Go back</a>
            </div>
        `);
    }
});

// Búsqueda de superhéroe por nombre
app.post('/search', (req, res) => {
    const searchName = req.body.name.toLowerCase();
    const foundCharacters = characters.filter(c => c.name.toLowerCase().includes(searchName));

    // Adding index to found characters
    const charactersWithIndex = foundCharacters.map((char, index) => {
        return {
            ...char,
            index: characters.findIndex(c => c.id === char.id) // Use the original characters array to find the correct index
        };
    });

    if (charactersWithIndex.length > 0) {
        res.render("results", { foundCharacters: charactersWithIndex });
    } else {
        res.send(`
            <div style="font-size: 24px; color: red; text-align: center; margin-top: 50px; padding: 20px; border: 2px solid red; border-radius: 10px; background-color: #f8d7da;">
                Character not found. <a href="/">Go back</a>
            </div>
        `);
    }
});


// Cargar los personajes al iniciar el servidor
loadCharacters(() => {
    app.listen(3000, () => {
        console.log("Application listening on port 3000");
    });
});
