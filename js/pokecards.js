export const getPokecardData = async (id, language = 'en') => {
    const url = 'https://pokeapi.co/api/v2/pokemon/' + id;
    const response = await fetch(url);
    const data = await response.json();

    const types = await Promise.all(
        data.types.map(async (type) => {
            const typeResponse = await fetch(type.type.url);
            const typeData = await typeResponse.json();
            const translatedName = typeData.names.find(name => name.language.name === language);
            return { translated: translatedName.name, original: type.type.name};
        })
    );

    const abilities = await Promise.all(
        data.abilities.map(async (ability) => {
            const abilityResponse = await fetch(ability.ability.url);
            const abilityData = await abilityResponse.json();
            const spanishName = abilityData.names.find(name => name.language.name === language);
            return spanishName ? spanishName.name : ability.ability.name;
        })
    );

    const pokecard = {
        id: data.id,
        name: data.name,
        types: types,
        ability: abilities,
        imageUrl: data.sprites.other['official-artwork'].front_default,
    };

    return pokecard;
}

export const getPokecardDataByName = async (name, language = 'en') => {
    const url = 'https://pokeapi.co/api/v2/pokemon/' + name.toLowerCase();
    const response = await fetch(url);
    const data = await response.json();

    const types = await Promise.all(
        data.types.map(async (type) => {
            const typeResponse = await fetch(type.type.url);
            const typeData = await typeResponse.json();
            const translatedName = typeData.names.find(name => name.language.name === language);
            return { translated: translatedName.name, original: type.type.name};
        })
    );


    const abilities = await Promise.all(
        data.abilities.map(async (ability) => {
            const abilityResponse = await fetch(ability.ability.url);
            const abilityData = await abilityResponse.json();
            const translatedName = abilityData.names.find(name => name.language.name === language);
            return translatedName ? translatedName.name : ability.ability.name;
        })
    );

    const pokecard = {
        id: data.id,
        name: data.name,
        types: types,
        ability: abilities,
        imageUrl: data.sprites.other['official-artwork'].front_default
    };

    return pokecard;
}

export const getPokecardsData = async (offset, limit=15, language = 'en') => {
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;
    const response = await fetch(url);
    const data = await response.json();

    const pokecards = await Promise.all(
        data.results.map(async (pokemon) => {
            const name = pokemon.name;
            return await getPokecardDataByName(name, language);
        })
    );

    return pokecards;
}

export const buildCard = (pokecardData, container) => {
    const card = document.createElement('div');
    card.className = 'pokecard';
    
    card.innerHTML = `
        <h3 class="p-name">${pokecardData.name}</h3>
        <img class="p-img" src=${pokecardData.imageUrl} alt=${pokecardData.name}>
        <ul class="p-type-list">
        </ul>
        <p class="p-ability">Habilidades</p>
        <ul class="p-ability-list">
        </ul>`;

    const typeList = card.querySelector('.p-type-list');
    pokecardData.types.forEach((type) => {
        const typeItem = document.createElement('li');
        typeItem.classList.add(type.original);
        typeItem.setAttribute("id", "idtipo")
        typeItem.innerText = type.translated;
        typeList.appendChild(typeItem);
    });

    const abilityList = card.querySelector('.p-ability-list');
    pokecardData.ability.forEach(ability => {
        const abilityItem = document.createElement('li');
        abilityItem.innerText = ability;
        abilityList.appendChild(abilityItem);
    });

    container.appendChild(card);
    return card;
}

export const loadPokecards = async (container, offset, limit, language = 'en') => {
    container.classList.add('loading');

    const pokecards = await getPokecardsData(offset, limit, language);
    container.innerHTML = '';

    container.classList.remove('loading');

    pokecards.forEach((pokecardData) => {
        buildCard(pokecardData, container);
    });

    const event = new CustomEvent('onloadpokecards', {
        detail: {
            pokecards: pokecards
        }
    })
    document.querySelector('#pokemon-select').dispatchEvent(event)
}