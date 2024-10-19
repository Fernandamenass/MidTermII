const express = require('express');
const app = express();
const https = require('https');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.engine("ejs", require("ejs").renderFile);
app.set("view engine", "ejs");

let characters = [];
let currentIndex = 0;

// Cargar personajes desde el link
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

app.get('/', (req, res) => {
    if (characters.length === 0) {
        return res.send('No characters found. Please try again later.');
    }
    const character = characters[currentIndex];
    res.render("home", { character });
});

// Previous
app.get('/character/prev', (req, res) => {
    if (characters.length === 0) {
        return res.send('No characters found.');
    }
    currentIndex = (currentIndex - 1 + characters.length) % characters.length;
    const character = characters[currentIndex];
    res.render("home", { character });
});

// Next
app.get('/character/next', (req, res) => {
    if (characters.length === 0) {
        return res.send('No characters found.');
    }
    currentIndex = (currentIndex + 1) % characters.length;
    const character = characters[currentIndex];
    res.render("home", { character });
});

//Buscar personaje por su id
app.get('/character/:id', (req, res) => {
    const id = parseInt(req.params.id);

    if (id >= 0 && id < characters.length) {
        currentIndex = id; // Actualiza el índice
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

// Busqueda superheroes
app.post('/search', (req, res) => {
    const searchName = req.body.name.toLowerCase();
    const foundCharacters = characters.filter(c => c.name.toLowerCase().includes(searchName));

    const charactersWithIndex = foundCharacters.map((char, index) => {
        return {
            ...char,
            index: characters.findIndex(c => c.id === char.id) // Usa el array para encontrar el index
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
