// Constantes e Var globais:

const api_url = "https://api.punkapi.com/v2/beers?per_page=24";
const catalogDom = document.getElementById('beersCatalog');
const currentPageDOM = document.getElementById('current-page');
const nextPageDom = document.getElementById('next-page');
const previusPageDom = document.getElementById('previus-page');
const searchArea = document.getElementById('search-area');
const searchBtn = document.getElementById('search-btn');
let currentPage = 1;
const shadowDom = document.querySelector('.shadow');
const moreOptionsDOM = document.getElementById('more-options');
const optionsDOM = document.getElementById('options');
let isMoreOptionsVisible = false;


let focusedEle = undefined;

// busca em 'options' as informações para a busca
const getMoreOptions = () => {
    return {
        abv_gt : optionsDOM.abvMin.value,
        abv_lt : optionsDOM.abvMax.value,
        ibu_gt : optionsDOM.ibuMin.value,
        ibu_lt : optionsDOM.ibuMax.value,
        ebc_gt : optionsDOM.ebcMin.value,
        ebc_lt : optionsDOM.ebcMax.value,
    }
}

// renderiza lista dada no DOM
const beerCardsRender = (beerCards) => {
    beerCards.forEach(card => {
        catalogDom.append(card)
    })
}

// dado objeto 'beer', cria um elemento DOM
const createBeerCard = ({name , description , image_url}) => {

    let beerCard = document.createElement("div");
    beerCard.classList.add("beer-card__container");
    beerCard.addEventListener('click' , moreInfo);

    let beerName = document.createElement('h3');
    beerName.textContent = name;
    beerName.classList.add("beer-card__name");

    let beerDescription = document.createElement('p');
    beerDescription.textContent = description;
    beerDescription.classList.add("beer-card__description")

    let beerPic = document.createElement('img');
    beerPic.src = image_url;
    beerPic.classList.add("beer-card__img")

    beerCard.append(beerName , beerPic , beerDescription)

    return beerCard
}

// retorna lista de cards DOM
const loadBeersInfo = async (page = 1 , name="" , options = {}) => {
    let fetch_url = api_url;
    fetch_url += page != 1 ? `&page=${page}` : "";
    fetch_url += name != '' ? `&beer_name=${name}` : "";

    Object.keys(options).forEach( key => {
        let value = parseInt(options[key])
        if (! isNaN(value)){
            fetch_url += (`&${key}=${value}`)
        }
    } )

    const beers_list = await (await fetch(fetch_url)).json();
    return beers_list.map( beer => createBeerCard(beer) )
}

// troca de página (muda var 'current page', carrega dados da api, renderiza)
// tbm controla se usuário pode mudar de página (não tentar acessar pg 0)
const changePage = async page => {
    if (page == 0){
        return
    }

    currentPage = page;
    currentPageDOM.innerText = page;
    catalogDom.innerHTML = "";
    if (currentPage == 1){
        previusPageDom.classList.add('btn-invalid')
    } else {
        previusPageDom.classList.remove('btn-invalid')
    }

    let beers = await loadBeersInfo(page , name="" , getMoreOptions())
    beerCardsRender(beers)
}

changePage(1);

// funcionamento dos botões de navegação:
nextPageDom.addEventListener("click" , () => {
    changePage(currentPage + 1)
})

previusPageDom.addEventListener("click" , () => {
    changePage(currentPage - 1)
})

// funcionamento busca por nome/mais opções
searchBtn.addEventListener('click' , async () => {
    searchText = searchArea.value;
    searchArea.value = "";

    // api precisa que espaços vazios virem "_"
    searchText = searchText.replace(' ','_');
    let cards = await loadBeersInfo(1 , searchText , getMoreOptions());
    catalogDom.innerHTML = "";

    beerCardsRender(cards)
})

// funcionamento mais-info

// sempre que uma carta é criada, moreInfo é associada ao evento click
// coloca a carta clicada como 'focusedEle'
// passa a mostrar shadow
const moreInfo = (e) => {
    focusedEle = e.target;

    // click pode ter sido em filho de container:
    while (! focusedEle.classList.contains('beer-card__container')){
        focusedEle = focusedEle.parentElement
    }

    focusedEle.classList.add('beer-card__more-info')
    shadowDom.classList.remove('hidden')
    
}

// associa a shadowDom func para desfazer moreInfo
shadowDom.addEventListener('click' , () => {
    focusedEle.classList.remove('beer-card__more-info')
    shadowDom.classList.add('hidden')
    focusedEle = undefined
})

// funcionalidade do botão 'mais opções'
moreOptionsDOM.addEventListener('click' , () => {
    // toggle visibilidade dos inputs de "mais opção"
    if (isMoreOptionsVisible){
        optionsDOM.classList.add('hidden')


        isMoreOptionsVisible = false
    }else {
        optionsDOM.classList.remove('hidden')

        isMoreOptionsVisible = true
    }
})

