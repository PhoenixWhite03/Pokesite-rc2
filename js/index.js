import { buildCard, getPokecardDataByName, loadPokecards } from "./pokecards.js";

const pokedex = document.querySelector('#pokecards-container');
const dropdown = document.querySelector('#pokemon-select');

let offset = 0;
let limit = 15;
let language = 'es'; // Default language
let totalPages = 0;

document.addEventListener('DOMContentLoaded', async () => {
    // Obtener el número total de pokemones
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon`);
    const data = await response.json();

    const totalPokemons = data.count;
    totalPages = Math.ceil(totalPokemons / limit);

    // Seleccion de idioma
    const languageSelect = document.querySelector('#language-select');
    languageSelect.addEventListener('change', (event) => {
        language = event.target.value;
        loadPokecards(pokedex, offset, limit, language);
    });

    // Eventos de paginación
    document.querySelector('#prev').addEventListener('click', () => {
        if (offset > 0) {
            offset -= limit;
            loadPokecards(pokedex, offset, limit, language);
        }
    })
    
    document.querySelector('#next').addEventListener('click', () => {
        if (offset < totalPokemons - limit) {
            offset += limit;
            loadPokecards(pokedex, offset, limit, language);
        }
    })

    // Eventos del dropdown
    dropdown.addEventListener('change', async (event) => {
        const selectedPokemon = event.target.value;

        const pokecardData = await getPokecardDataByName(selectedPokemon, language);

        pokedex.innerHTML = ''; // Limpiar el contenedor de pokecards
        pokedex.classList.remove('loading'); // Remover loading class

        buildCard(pokecardData, pokedex);
    })

    dropdown.addEventListener('onloadpokecards', (event => {
        dropdown.innerHTML = '<option value="">Selecciona un Pokémon</option>';
        // Limpiar el dropdown antes de agregar nuevas opciones

        const pokecards = event.detail.pokecards;
        pokecards.forEach(pokecard => {
            const option = document.createElement('option');
            option.value = pokecard.name;
            option.innerText = pokecard.name;
            dropdown.appendChild(option);
        });
    }))

    document.querySelector('#reload-button').addEventListener('click', async () => {
        pokedex.innerHTML = '';
        pokedex.classList.remove('loading');

        loadPokecards(pokedex, offset, limit, language);
    })

    // Carga inicial de pokecards
    pokedex.classList.add('loading'); // Agregar loading class
    await loadPokecards(pokedex, offset, limit, language);
})