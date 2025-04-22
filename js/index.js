import { buildCard, getPokecardDataByName, getPokecardsData, loadPokecards } from "./pokecards.js";

const pokedex = document.querySelector('#pokecards-container');
const dropdown = document.querySelector('#pokemon-select');

let offset = 0;
let limit = 15;
let language = 'es'; // Default language
let totalPages = 0;

const loadAllDropdownOptions = async () => {
    dropdown.innerHTML = '<option value="">Selecciona un Pokémon</option>';
    const url = `https://pokeapi.co/api/v2/pokemon?offset=0&limit=${totalPokemons}`
    const response = await fetch(url);
    const data = await response.json();
    const pokecards = data.results;

    pokecards.forEach(pokecard => {
        const option = document.createElement('option');
        option.value = pokecard.name;
        option.innerText = pokecard.name;
        dropdown.appendChild(option);
    });

    const option = document.createElement('option');
    option.value = 'all';
    option.innerText = 'Ver todos los Pokémon';
    dropdown.appendChild(option);
    dropdown.value = 'all';
}

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
    const prevButton = document.querySelector('#prev');
    prevButton.addEventListener('click', () => {
        if (offset > 0) {
            offset -= limit;
            loadPokecards(pokedex, offset, limit, language);
        }

        prevButton.scrollIntoView(); // Desplazar hacia arriba al cargar más pokecards
    })
    
    const nextButton = document.querySelector('#next');
    nextButton.addEventListener('click', () => {
        if (offset < totalPokemons - limit) {
            offset += limit;
            loadPokecards(pokedex, offset, limit, language);
        }

        nextButton.scrollIntoView();
    })

    // Eventos del dropdown
    dropdown.addEventListener('change', async (event) => {
        dropdown.scrollIntoView();

        if (event.target.value === 'all') {
            offset = 0; // Reiniciar el offset al seleccionar "Ver todos los Pokémon"
            loadPokecards(pokedex, offset, limit, language);
            return;
        }

        const selectedPokemon = event.target.value;
        if (!selectedPokemon) return;
        pokedex.classList.add('loading');

        const pokecardData = await getPokecardDataByName(selectedPokemon, language);

        pokedex.innerHTML = '';
        setTimeout(() => {
            pokedex.classList.remove('loading');
        }, 300);

        buildCard(pokecardData, pokedex);
    })

    dropdown.addEventListener('onloadpokecards', (event => {
        dropdown.innerHTML = '';
        
        const pokecards = event.detail.pokecards;

        pokecards.forEach(pokecard => {
            const option = document.createElement('option');
            option.value = pokecard.name;
            option.innerText = pokecard.name;
            dropdown.appendChild(option);
        });

        const option = document.createElement('option');
        option.value = 'all';
        option.innerText = 'Ver todos';
        dropdown.appendChild(option);
        dropdown.value = 'all'; // Seleccionar la opción "Ver todos los Pokémon" por defecto
    }))

    document.querySelector('#reload-button').addEventListener('click', async () => {
        pokedex.innerHTML = '';
        offset = 0; // Reiniciar el offset al hacer clic en el botón de recarga
        loadPokecards(pokedex, offset, limit, language);
    })

    // Carga inicial de pokecards
    await loadPokecards(pokedex, offset, limit, language);
})