// const getUser = new Promise((okey, notOkey)=>{
//   setTimeout(()=> okey('tiempo 5s'), 5000)
// })

// const getUser2 = new Promise((okey, notOkey)=>{
//   setTimeout(()=> okey('tiempo 3s'), 3000)
// })

// getUser
//   .then(()=> console.log('Todo ok!'))
//   .catch(()=> console.log('Todo mal :('))

// Promise.all([getUser, getUser2])
// // Manda then o catch cuando terminen todas las promesas o falle una
//   .then((msg)=> console.log(msg))   // Array con los 2 msgs
//   .catch((msg)=> console.log(msg))

// Promise.race([getUser, getUser2])
// // Carrera! manda el then de la que se ejecute primero  
//   .then((msg)=> console.log(`Ganó ${msg}`))
//   .catch((msg)=> console.log(msg))

// const $home = document.querySelector('#home')
// Buena practica poner $ en el  nombre para denotar selector

// fetch('https://randomuser.me/api/')
//   .then(response => response.json())
//   .then(user => console.log(`${user.results[0].name.first} ${user.results[0].name.last}`))
//   .catch(()=> console.error('Algo falló :('))

async function load() {
  async function getData(url) {
    const response = await fetch(url)
    const data = await response.json()
    if(data.data.movie_count > 0){
      return data
    }
    throw new Error('No se encontró ningún resultado')
  }
  
  function videoItemTemplate(movie, category) {
    return (`<div class="primaryPlaylistItem" data-id="${movie.id}" data-category="${category}">
              <div class="primaryPlaylistItem-image">
                <img src="${movie.medium_cover_image}">
              </div>
              <h4 class="primaryPlaylistItem-title">${movie.title}</h4>
              </div>`)
  }

  function featuringTemplate(peli){
    return (`<div class="featuring">
              <div class="featuring-image">
                <img src="${peli.medium_cover_image}" width="70" height="100" alt="">
              </div>
              <div class="featuring-content">
                <p class="featuring-title">Pelicula encontrada</p>
                <p class="featuring-album">${peli.title}</p>
              </div>
             </div>`)
  }
  
  function createTemplate(HTMLString) {
    const $html = document.implementation.createHTMLDocument()
    $html.body.innerHTML = HTMLString
    return $html.body.children[0]
  }

  function findById(list, id){
    return list.find(movie => movie.id === parseInt(id, 10))
  }

  function findMovie(id, category){
    switch(category){
      case 'action':
        return findById(actionList, id)
      case 'horror':
        return findById(horrorList, id)
      case 'animation':
        return findById(animationList, id)
    }
  }

  function showModal($element){
    $overlay.classList.add('active')
    $modal.style.animation = 'modalIn .8s forwards'
    const id = $element.dataset.id
    const category = $element.dataset.category
    const dataMovie = findMovie(id, category)
    $modalTitle.textContent = dataMovie.title
    $modalDescription.textContent = dataMovie.description_full
    $modalImage.setAttribute('src', dataMovie.medium_cover_image)
  }

  function hideModal(){
      $overlay.classList.remove('active')
      $modal.style.animation = 'modalOut .8s forwards'
  }
  
  function addEventClick(element) {
    element.addEventListener('click', () => {
      showModal(element)
    })
  }
  
  function renderMovieList(list, container, category) {
    list.forEach(movie => {
      const HTMLString = videoItemTemplate(movie, category)
      const movieElement = createTemplate(HTMLString)
      container.append(movieElement)
      movieElement.classList.add('fadeIn')
      const image = movieElement.querySelector('img')

      addEventClick(movieElement)
    })
    container.children[0].remove()
  }
  
  function setAttributes(element, attributes){
    for(let attribute in attributes){
      element.setAttribute(attribute, attributes[attribute])
    }
  }

  const BASE_API = `https://yts.mx/api/v2/`

  const $home = document.querySelector('#home')
  const $featuringContainer = document.querySelector('#featuring')
  const $form = document.querySelector('#form')
  
  $form.addEventListener('submit', async (event) => {
    event.preventDefault()
    $home.classList.add('search-active')
    $loader = document.createElement('img')
    setAttributes($loader, {
      src: '../src/images/loader.gif',
      height: 50,
      width: 50
    })
    $featuringContainer.append($loader)
    const data = new FormData($form)

    try{
      const {data: {movies}} = await getData(`${BASE_API}list_movies.json?limit=1&query_term=${data.get('name')}`)
      const HTMLString = featuringTemplate(movies[0])
      $featuringContainer.innerHTML = HTMLString
    } catch(error){
      swal('Error', error.message, 'error')
      $loader.remove()
      $home.classList.remove('search-active')
    }
  })

  async function cacheExist(category){
    const listName = `${category}List`
    const cacheList = window.localStorage.getItem(listName)
    if(cacheList){
      return JSON.parse(cacheList)
    }
    const {data: {movies: dataMovies}} = await getData(`${BASE_API}list_movies.json?genre=${category}`)
    window.localStorage.setItem(listName, JSON.stringify(dataMovies))
    return dataMovies
  }
  
  const actionList = await cacheExist('action')
  const $actionContainer = document.querySelector('#action')
  renderMovieList(actionList, $actionContainer, 'action')

  const horrorList = await cacheExist('horror')
  const $horrorContainer = document.querySelector('#horror')
  renderMovieList(horrorList, $horrorContainer, 'horror')

  const animationList = await cacheExist('animation')
  const $animationContainer = document.querySelector('#animation')
  renderMovieList(animationList, $animationContainer, 'animation')
  
  const $modal = document.querySelector('#modal')
  const $overlay = document.querySelector('#overlay')
  const $hideModal = document.querySelector('#hide-modal')
  
  const $modalTitle = $modal.querySelector('h1')
  const $modalDescription = $modal.querySelector('p')
  const $modalImage = $modal.querySelector('img')
  
  $hideModal.addEventListener('click', hideModal)
}

load()

