const cheerio = require('cheerio');
const Crawler = require("crawler");
const fetch = require('node-fetch');
const scrapeIt = require("scrape-it");

const cloudscraper = require('cloudscraper');
const decodeURL = require('urldecode');
const axios = require('axios');
const {MergeRecursive , urlify , decodeZippyURL , imageUrlToBase64} = require('../utils/index');
const {
  BASE_URL         , SEARCH_URL             , BROWSE_URL , 
  FANPELIS_SEARCH  , FANPELIS   , 
  PELISPEDIA_SEARCH    , PELISPEDIA, MEGADEDE, MEGADEDE_SEARCH , 
  CUEVANA_SEARCH_2, CUEVANA_URL, TMDB_SEARCH, TMDB, CUEVANA_SEARCH, CUEVANA_URL_2, TMO__URL
} = require('./urls');

//CUEVANA
const getTrending = async(type) => {
  const promises = [];
  const finalPromises = [];
  await fetch(`https://api.themoviedb.org/3/trending/${type}/day?api_key=22fe8b719ffd3589dc66ce6cbd425ad6&language=es-MX`)
    .then(res => res.json())
    .then(json => promises.push(json.results));
  const prom = promises.flat(1);
  prom.map((movie, index) => {
    if (finalPromises.length > 9) {return false};
    (movie.media_type === 'movie' || movie.media_type === 'tv' && movie.poster_path) && finalPromises.push({index: finalPromises.length + 1,...movie})
  });
  return Promise.all(finalPromises);
};

const getCollection = async(id) => {
  const promises = [];
  await fetch(`https://api.themoviedb.org/3/collection/${id}?api_key=22fe8b719ffd3589dc66ce6cbd425ad6&language=es-MX`)
    .then(res => res.json())
    .then(json => promises.push(json));

  return Promise.all(promises);
};

const getByGenres = async(type, ids) => {
  const promises = [];
  await fetch(`https://api.themoviedb.org/3/discover/${type}?api_key=22fe8b719ffd3589dc66ce6cbd425ad6&language=es-MX&sort_by=popularity.desc&page=1&timezone=America%2FNew_York&with_genres=${ids}&include_null_first_air_dates=false`)
    .then(res => res.json())
    .then(json => promises.push(json));

  return Promise.all(promises);
};

const getByGenresDesktop = async(type, ids) => {
  const promises = [];
  const promisesFinal = [];

  await fetch(`https://api.themoviedb.org/3/discover/${type}?api_key=22fe8b719ffd3589dc66ce6cbd425ad6&language=es-MX&sort_by=popularity.desc&page=1&timezone=America%2FNew_York&with_genres=${ids}&include_null_first_air_dates=false`)
    .then(res => res.json())
    .then(json => promises.push(json.results));

    const prom = promises.flat(1);

    prom.map((m) => promisesFinal.push(getBackdrop(type, m.id).then(async backdrop => ({
      ...m,
      backdrop: backdrop[0]
    })) ))
  
    return Promise.all(promisesFinal);
};

const getGenres = async(type) => {
  const promises = [];
  await fetch(`https://api.themoviedb.org/3/genre/${type}/list?api_key=22fe8b719ffd3589dc66ce6cbd425ad6&language=es-MX`)
    .then(res => res.json())
    .then(json => promises.push(json));

  return Promise.all(promises);
};

const getSeasons= async(id) =>{
  const promises = [];
  await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=22fe8b719ffd3589dc66ce6cbd425ad6&language=es`)
    .then(res => res.json())
    .then(json => promises.push(json.seasons));
    
  return Promise.all(promises.flat(1));
};

const getEpisodes= async(id, season) =>{
  const promises = [];
  await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${season}?api_key=22fe8b719ffd3589dc66ce6cbd425ad6&language=es`)
    .then(res => res.json())
    .then(json => promises.push(json));
    
  return Promise.all(promises);
};

const getCrew= async(type, id) =>{
  const promises = [];
  await fetch(`https://api.themoviedb.org/3/${type}/${id}/credits?api_key=22fe8b719ffd3589dc66ce6cbd425ad6&language=es-MX`)
    .then(res => res.json())
    .then(json => promises.push(json));
    
  return Promise.all(promises);
};

const getTrailer= async(type, id) =>{
  const promises = [];
  await fetch(`https://api.themoviedb.org/3/${type}/${id}/videos?api_key=22fe8b719ffd3589dc66ce6cbd425ad6&language=es-MX`)
    .then(res => res.json())
    .then(json => promises.push(json));
    
  return Promise.all(promises);
};

const getRecommendations= async(type, id) =>{
  const promises = [];
  await fetch(`https://api.themoviedb.org/3/${type}/${id}/recommendations?api_key=22fe8b719ffd3589dc66ce6cbd425ad6&language=es-MX&page=1`)
    .then(res => res.json())
    .then(json => promises.push(json));
    
  return Promise.all(promises);
};

const getSearch= async(query) =>{
  const promises = [];
  await fetch(`https://api.themoviedb.org/3/search/multi?api_key=22fe8b719ffd3589dc66ce6cbd425ad6&language=es-MX&query=${query}&page=1&include_adult=false`)
    .then(res => res.json())
    .then(json => promises.push(json));

  return Promise.all(promises);
};

const getMovie= async(type, id) =>{
  const promises = [];

  await fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=22fe8b719ffd3589dc66ce6cbd425ad6&language=es-MX`)
    .then(res => res.json())
    .then(json => promises.push(json));

  return Promise.all(promises);
};

const getListMovie= async(type, sort, genre, company, director) =>{
  const promises = [];
  let withSort;
  let withCompany;
  let withDirector;

  if(sort === '1'){ withSort='popularity.desc';}
  if(sort === '2'){ withSort='vote_count.desc';}
  if(sort === '3'){ withSort='release_date.desc';}
  if(sort === '4'){ withSort='revenue.desc';}
  if(sort === '5'){ withSort='vote_avegare.desc';}

  if(company === '0'){ withCompany='';}
  if(company === '1'){ withCompany='&with_companies=10342';} //ghibli
  if(company === '2'){ withCompany='&with_companies=3';} //pixar
  if(company === '3'){ withCompany='&with_companies=2';} //disney
  if(company === '4'){ withCompany='&with_companies=521';} // dreamworks
  if(company === '5'){ withCompany='&with_companies=420';} //marvel

  if(director === '0'){ withDirector='';}
  if(director === '1'){ withDirector='&with_crew=138';} //tarantino
  if(director === '2'){ withDirector='&with_crew=488';} //spielberg
  if(director === '3'){ withDirector='&with_crew=525';} //nolan
  if(director === '4'){ withDirector='&with_crew=5655';} // wes anderson

  const withGenre = genre !== '0' ? '&with_genres='+genre : '';

  await fetch(`https://api.themoviedb.org/3/discover/${type}?api_key=22fe8b719ffd3589dc66ce6cbd425ad6&language=es-MX&sort_by=${withSort}&include_adult=false&include_video=false&page=1${withGenre}${withCompany}${withDirector}`)
    .then(res => res.json())
    .then(json => promises.push(json.results));

  return Promise.all(promises);
};

const getListMovieDesktop= async(type, sort, genre, company, director) =>{
  const promises = [];
  const promisesFinal = [];
  let withSort;
  let withCompany;
  let withDirector;

  if(sort === '1'){ withSort='popularity.desc';}
  if(sort === '2'){ withSort='vote_count.desc';}
  if(sort === '3'){ withSort='release_date.desc';}
  if(sort === '4'){ withSort='revenue.desc';}
  if(sort === '5'){ withSort='vote_avegare.desc';}

  if(company === '0'){ withCompany='';}
  if(company === '1'){ withCompany='&with_companies=10342';} //ghibli
  if(company === '2'){ withCompany='&with_companies=3';} //pixar
  if(company === '3'){ withCompany='&with_companies=2';} //disney
  if(company === '4'){ withCompany='&with_companies=521';} // dreamworks
  if(company === '5'){ withCompany='&with_companies=420';} //marvel

  if(director === '0'){ withDirector='';}
  if(director === '1'){ withDirector='&with_crew=138';} //tarantino
  if(director === '2'){ withDirector='&with_crew=488';} //spielberg
  if(director === '3'){ withDirector='&with_crew=525';} //nolan
  if(director === '4'){ withDirector='&with_crew=5655';} // wes anderson

  const withGenre = genre !== '0' ? '&with_genres='+genre : '';

  await fetch(`https://api.themoviedb.org/3/discover/${type}?api_key=22fe8b719ffd3589dc66ce6cbd425ad6&language=es-MX&sort_by=${withSort}&include_adult=false&include_video=false&page=1${withGenre}${withCompany}${withDirector}`)
    .then(res => res.json())
    .then(json => promises.push(json.results));

  const prom = promises.flat(1);

  prom.map((m) => promisesFinal.push(getBackdrop(type, m.id).then(async backdrop => ({
    ...m,
    backdrop: backdrop[0]
  })) ))

  return Promise.all(promisesFinal);
};

const getBackdrop= async(type, id) =>{
  const promises = [];

  await fetch(`https://api.themoviedb.org/3/${type}/${id}/images?api_key=22fe8b719ffd3589dc66ce6cbd425ad6&language=en`)
    .then(res => res.json())
    .then(json => promises.push(json.backdrops));

    
  !promises.width && await fetch(`https://api.themoviedb.org/3/${type}/${id}/images?api_key=22fe8b719ffd3589dc66ce6cbd425ad6`)
  .then(res => res.json())
  .then(json => promises.push(json.backdrops));

  return Promise.all(promises.flat(1));
};

const getHeaderMovies= async(type, sort, genre) =>{
  const promises = [];
  const promisesFinal = [];

  let withSort;

  if(sort === '1'){ withSort='popularity.desc';}
  if(sort === '2'){ withSort='vote_count.desc';}
  if(sort === '3'){ withSort='release_date.desc';}
  if(sort === '4'){ withSort='revenue.desc';}
  if(sort === '5'){ withSort='vote_avegare.desc';}

  const withGenre = genre !== '0' ? '&with_genres='+genre : '';

  await fetch(`https://api.themoviedb.org/3/discover/${type}?api_key=22fe8b719ffd3589dc66ce6cbd425ad6&language=es-MX&sort_by=${withSort}&include_adult=false&include_video=false&page=1${withGenre}`)
    .then(res => res.json())
    .then(json => promises.push(json.results));

  const select = promises[0][Math.floor(Math.random() * promises[0].length)];
  promisesFinal.push(getLogo(type, select.id).then(async extra => ({
          ...select,
          logo: extra[0] || null,
          media_type: type,
        })))

  return Promise.all(promisesFinal);
};



const removeAccents = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
} 

const getSearchId = async(title, original) => {
  const promises = [];
  const anime = [];

  const res = await cloudscraper(`${CUEVANA_SEARCH_2}${title}` , {method: 'GET'});
  const body = await res;
  const $ = cheerio.load(body);

  let id;
  let titleCom;

  $('#aa-wp > div > div > main > section > ul > li').each((index, element) => {
    const $element = $(element);
    id = $element.find('div.TPost a').attr('href');
    titleCom = $element.find('div.TPost a h2.Title').text().replace(/(\([^\)]*\))/g, '').trim().replace(':','');
    
    if (removeAccents(titleCom.toLowerCase().replace('ñ', 'n').replace('•','')) === title.toLowerCase().replace('•','')) {promises.push({
      id: id || null,
      route: 'getCuevanaLinks',
    })}
    if (promises.length > 0) {return false};
  });

  // if (promises.length === 0){
  //   const res2 = await cloudscraper(`${MEGADEDE_SEARCH}${title}` , {method: 'GET'});
  //   const body2 = await res2;
  //   const $$ = cheerio.load(body2);
  //   $$('body > div.container > div.main > div.main-right.pull-right > div > div.items-peliculas > div.item-pelicula.pull-left').each((index, element) => {
  //     const $element = $$(element);
  //     id = $element.find('a').attr('href');
  //     titleCom = $element.find('a div.item-detail p').text().replace(/(\([^\)]*\))/g, '').trim().replace(':','');
      
  //     if (removeAccents(titleCom.toLowerCase().replace('ñ', 'n')) === title.toLowerCase()) {promises.push({
  //       id: '/'+id.split('/')[3]+'/'+id.split('/')[4] || null,
  //       route: 'getMegadedeLinks',
  //     })}
  //     if (promises.length > 0) {return false};
  //   });
  // }

 if (promises.length === 0){
    const res2 = await cloudscraper(`${FANPELIS_SEARCH}${title}` , {method: 'GET'});
    const body2 = await res2;
    const $$ = cheerio.load(body2);
    $$('#main > div > div.main-content.main-category > div > div.movies-list.movies-list-full > div.ml-item').each((index, element) => {
      const $element = $$(element);
      id = $element.find('a').attr('href');
      titleCom = $element.find('div[id = "hidden_tip"] div.qtip-title').text().replace(/(\([^\)]*\))/g, '').trim().replace(':','');
      
      if (removeAccents(titleCom.toLowerCase().replace('ñ', 'n')) === title.toLowerCase()) {promises.push({
        id: id.split('/')[3] === 'series' ? '/'+id.split('/')[4] : '/'+id.split('/')[3] || null,
        route: 'getFanpelisLinks',
      })}
      if (promises.length > 0) {return false};
    });
  }

  if (promises.length === 0){
    const res2 = await cloudscraper(`https://www.animefenix.com/animes?q=${title.replace(/ /g, '+')}` , {method: 'GET'});
    const body2 = await res2;
    const $$ = cheerio.load(body2);
    
    $$('body > div.hero.is-lightx.is-fullheight > section.section.has-background-darkx > div > div > div.list-series > article').each((index, element) => {
      const $element = $$(element);
      id = $element.find('figure.image a').attr('href');
      year = $element.find('figure.image span.tag.year').text();
      anime.push({
        id: id || null,
        year: year || null
      })
      
    });
  }
  
  if (promises.length === 0){
    const res2 = await cloudscraper(`${CUEVANA_SEARCH_2}${original}` , {method: 'GET'});
    const body2 = await res2;
    const $$ = cheerio.load(body2);
    $$('#aa-wp > div > div > main > section > ul > li').each((index, element) => {
      const $element = $$(element);
      id = $element.find('div.TPost a').attr('href');

      promises.push({
        id: id || null,
        route: 'getCuevanaLinks',
      })}
    );
  }

  if (promises.length !== 1) {return Promise.all(anime)};

  return Promise.all(promises);
};

const getTmdbID = async(tmdbID) => {
  const promises = [];


  const res2 = await cloudscraper(`${TMDB}${tmdbID}/images/logos?image_language=es` , {method: 'GET'});
  const body2 = await res2;
  const $$ = cheerio.load(body2);

  let logo = $$('div.image_content > a.image').attr('href');

  if (logo === undefined){
    const res3 = await cloudscraper(`${TMDB}${tmdbID}/images/logos?image_language=en` , {method: 'GET'});
    const body3 = await res3;
    const $$$ = cheerio.load(body3);
    logo = $$$('div.image_content > a.image').attr('href');
  }

  if (logo === undefined){
    const res3 = await cloudscraper(`${TMDB}${tmdbID}/images/logos?image_language=ja` , {method: 'GET'});
    const body3 = await res3;
    const $$$ = cheerio.load(body3);
    logo = $$$('div.image_content > a.image').attr('href');
  }

  if (logo === undefined){
    const res3 = await cloudscraper(`${TMDB}${tmdbID}/images/logos?image_language=zh` , {method: 'GET'});
    const body3 = await res3;
    const $$$ = cheerio.load(body3);
    logo = $$$('div.image_content > a.image').attr('href');
  }

  if (logo === undefined){
    const res3 = await cloudscraper(`${TMDB}${tmdbID}/images/logos?image_language=xx` , {method: 'GET'});
    const body3 = await res3;
    const $$$ = cheerio.load(body3);
    logo = $$$('div.image_content > a.image').attr('href');
  }

  const res3 = await cloudscraper(`${TMDB}${tmdbID}/images/backdrops?image_language=xx` , {method: 'GET'});
  const body3 = await res3;
  const $$$ = cheerio.load(body3);

  const background = $$$('div.image_content > a').attr('href');


  promises.push({
    logo: logo ? 'https://image.tmdb.org'+logo.replace('.svg','.png') : null,
    background: 'https://image.tmdb.org'+background || null,
  })

  return Promise.all(promises);
};

const getLogo = async(type,id) => {
  const promises = [];

  const res2 = await cloudscraper(`${TMDB}/${type}/${id}/images/logos?image_language=es` , {method: 'GET'});
  const body2 = await res2;
  const $$ = cheerio.load(body2);

  let logo = $$('div.image_content > a.image').attr('href');

  if (logo === undefined){
    const res3 = await cloudscraper(`${TMDB}/${type}/${id}/images/logos?image_language=en` , {method: 'GET'});
    const body3 = await res3;
    const $$$ = cheerio.load(body3);
    logo = $$$('div.image_content > a.image').attr('href');
  }

  if (logo === undefined){
    const res3 = await cloudscraper(`${TMDB}/${type}/${id}/images/logos?image_language=ja` , {method: 'GET'});
    const body3 = await res3;
    const $$$ = cheerio.load(body3);
    logo = $$$('div.image_content > a.image').attr('href');
  }

  if (logo === undefined){
    const res3 = await cloudscraper(`${TMDB}/${type}/${id}/images/logos?image_language=zh` , {method: 'GET'});
    const body3 = await res3;
    const $$$ = cheerio.load(body3);
    logo = $$$('div.image_content > a.image').attr('href');
  }

  if (logo === undefined){
    const res3 = await cloudscraper(`${TMDB}/${type}/${id}/images/logos?image_language=xx` , {method: 'GET'});
    const body3 = await res3;
    const $$$ = cheerio.load(body3);
    logo = $$$('div.image_content > a.image').attr('href');
  }


  promises.push(
    logo ? 'https://image.tmdb.org'+logo.replace('.svg','.png') : null,
  )

  return Promise.all(promises);
};

const getCuevanaLinks = async(type, id) => {
  const res = await cloudscraper(`${CUEVANA_URL_2}${type}/${id}` , {method: 'GET'});
  const body = await res;
  const $ = cheerio.load(res);
  const promises = [];

  $('li').each((index, element) => {
    const link = $(element).attr('data-video');

    if (link === undefined) {return true};

    promises.push({
      link: link || null,
    });
  });

  return Promise.all(promises);
};

const getCuevanaLinksSerie = async(type, id, season, episode) => {
  const res = await cloudscraper(`${CUEVANA_URL_2}episodio/${id}-${season}x${episode}` , {method: 'GET'});
  const body = await res;
  const $ = cheerio.load(res);
  const promises = [];

  $('li').each((index, element) => {
    const link = $(element).attr('data-video');

    if (link === undefined) {return true};

    promises.push({
      link: link || null,
    });
  });

  return Promise.all(promises);
};

const getMegadedeLinks = async(type, id) => {
  const res = await cloudscraper(`${MEGADEDE}${type}/${id}` , {method: 'GET'});
  const body = await res;
  const $ = cheerio.load(res);
  const promises = [];

  $('li').each((index, element) => {
    const link = $(element).attr('player');

    if (link === undefined) {return true};

    promises.push({
      link: 'https://www.megadede.se'+link || null,
    });
  });

  return Promise.all(promises);
};

const getMegadedeLinksSerie = async(type, id, season, episode) => {
  const res = await cloudscraper(`${MEGADEDE}${type}/${id}/temporada-${season}/episodio-${episode}` , {method: 'GET'});
  const body = await res;
  const $ = cheerio.load(res);
  const promises = [];

  $('li').each((index, element) => {
    const link = $(element).attr('player');

    if (link === undefined) {return true};

    promises.push({
      link: 'https://www.megadede.se'+link || null,
    });
  });

  return Promise.all(promises);
};

const getFanpelisLinks = async(id) => {
  const res = await cloudscraper(`${FANPELIS}${id}` , {method: 'GET'});
  const body = await res;
  const $ = cheerio.load(res);
  const promises = [];

  $('a').each((index, element) => {
    const link = $(element).attr('data-url');

    if (link !== undefined && link !== '') {promises.push({
      link: link || null,
    });};

    
  });

  return Promise.all(promises);
};

const getFanpelisLinksSerie = async(id, season, episode) => {
  const res = await cloudscraper(`${FANPELIS}episode/${id}-temporada-${season}-episodio-${episode}` , {method: 'GET'});
  const body = await res;
  const $ = cheerio.load(res);
  const promises = [];

  $('a').each((index, element) => {
    const link = $(element).attr('data-url');

    if (link !== undefined && link !== '') {promises.push({
      link: link || null,
    });};

    
  });

  return Promise.all(promises);
};


module.exports = {
  getTrending,
  getListMovie,
  getListMovieDesktop,
  getHeaderMovies,
  getSeasons,
  getEpisodes,
  getCrew,
  getTrailer,
  getRecommendations,
  getCollection,
  getByGenres,
  getByGenresDesktop,
  getGenres,
  getSearch,
  getMovie,
  getLogo,
  getSearchId,
  getCuevanaLinks,
  getCuevanaLinksSerie,
  getMegadedeLinks,
  getFanpelisLinks,
  getFanpelisLinksSerie,
};

// //CUEVANA
// const getCollection = async(id) => {
//   const promises = [];
//   promises.push(collection[id]);
//   return Promise.all(promises);

// }


// const getSearch= async(query) =>{
//   const res = await cloudscraper(`${CUEVANA_SEARCH}${query.replace('%20','+').replace('&','%26')}` , {method: 'GET'});
//   const body = await res;
//   const $ = cheerio.load(body);
//   const promises = [];

//   $('main section ul.MovieList li').each((index , element) =>{
//     const $element = $(element);
//     const id = $element.find('div.TPost a').attr('href').split('/')[3];
//     const idSerie = $element.find('div.TPost a').attr('href').split('/')[4];
//     const title = $element.find('div a h2.Title').text();
//     const cover = $element.find('div.Image figure.Objf img').attr('data-src');
//     const year = $element.find('div.Image span.Year').text();
//     const description = $element.find('div.TPost.C.post-7544.post.type-post.status-publish.format-standard.has-post-thumbnail.hentry div div.Description p:nth-child(2)').text().replace('[...]','...');
  
//     promises.push({
//       id: id.includes('serie') ? idSerie : id || null,
//       title: title || null,
//       cover: cover || null,
//       year: year || null,
//       description: description || null,
//       duration: null,
//       type: id.includes('serie') ? '2' : '1'
//     })
//   })
//   return Promise.all(promises);
// };

// const getEstrenos= async() =>{
//   const res = await cloudscraper(`${CUEVANA_URL}estrenos` , {method: 'GET'});
//   const body = await res;
//   const $ = cheerio.load(body);
//   const promises = [];

//   $('main section ul.MovieList li').each((index , element) =>{
//     const $element = $(element);
//     const id = $element.find('div.TPost a').attr('href').split('/')[3];
//     const title = $element.find('div a h2.Title').text();
//     const cover = $element.find('div.Image figure.Objf img').attr('data-src');
//     const year = $element.find('div.Image span.Year').text();
//     const description = $element.find('div.TPost.C.post-7544.post.type-post.status-publish.format-standard.has-post-thumbnail.hentry div div.Description p:nth-child(2)').text().replace('[...]','...');
//     const duration = $element.find('div.TPost.C.post-7544.post.type-post.status-publish.format-standard.has-post-thumbnail.hentry div p.Info span:nth-child(2)').text();
 
//     promises.push({
//       id: id || null,
//       title: title || null,
//       cover: cover || null,
//       year: year || null,
//       description: description || null,
//       duration: duration || null,
//     })
//   })
//   return Promise.all(promises);
// };

// const getMasVistas= async() =>{
//   const res = await cloudscraper(`${CUEVANA_URL}peliculas-mas-vistas` , {method: 'GET'});
//   const body = await res;
//   const $ = cheerio.load(body);
//   const promises = [];

//   $('main section ul.MovieList li').each((index , element) =>{
//     const $element = $(element);
//     const id = $element.find('div.TPost a').attr('href').split('/')[3];
//     const title = $element.find('div a h2.Title').text();
//     const cover = $element.find('div.Image figure.Objf img').attr('data-src');
//     const year = $element.find('div.Image span.Year').text();
//     const description = $element.find('div.TPost.C.post-7544.post.type-post.status-publish.format-standard.has-post-thumbnail.hentry div div.Description p:nth-child(2)').text().replace('[...]','...');
//     const duration = $element.find('div.TPost.C.post-7544.post.type-post.status-publish.format-standard.has-post-thumbnail.hentry div p.Info span:nth-child(2)').text();

//     promises.push({
//       id: id || null,
//       title: title || null,
//       cover: cover || null,
//       year: year || null,
//       description: description || null,
//       duration: duration || null,
//     })
//   })
//   return Promise.all(promises);
// };

// const getMovie= async(id) =>{
//   const res = await cloudscraper(`${CUEVANA_URL}${id}` , {method: 'GET'});
//   const body = await res;
//   const $ = cheerio.load(body);
//   const promises = [];
//   const subtitle = $('#top-single > div.backdrop > article > header > h2').text().replace('&','%25');
//   const title = $('#top-single > div.backdrop > article > header > h1').text().replace('&','%25');
//   const year = $('#top-single > div.backdrop > article > footer > p > span:nth-child(2)').text();
  
//   let res2;
//   year ? res2 = await cloudscraper(`${TMDB_SEARCH}${encodeURI(subtitle || title)}%20y%3A${year}` , {method: 'GET'}) : res2 = await cloudscraper(`${TMDB_SEARCH}${encodeURI(subtitle || title)}` , {method: 'GET'});
//   const body2 = await res2;
//   const $$ = cheerio.load(body2);

//   const tmdbID = $$('div.details > div.wrapper > div > div > a').attr('href');

//   await fetch(`https://api.themoviedb.org/3${tmdbID}?api_key=22fe8b719ffd3589dc66ce6cbd425ad6&language=es-ES`)
//     .then(res => res.json())
//     .then(json => promises.push(json));

//   return Promise.all(promises);
// };

// const getLinks= async(id) =>{
//   const res = await cloudscraper(`${CUEVANA_URL}${id}` , {method: 'GET'});
//   const body = await res;
//   const $ = cheerio.load(body);
//   const promises = [];

//   $('div.TPlayer.embed_div div.TPlayerTb').each((index, element) => {
//     const $element = $(element);
//     const link = 'https:'+$element.find('iframe.no-you').attr('data-src');

//     if (index > 1 ) return true;

//     promises.push({
//       link: link || null,
//     });
//   });

//   return Promise.all(promises);
// };

// const getLink= async(id) =>{
//   const promises = [];
//   await scrapeIt(`${CUEVANA_URL}${id}`, {
//       url: {
//         selector: "#top-single > div.video.cont > div.TPlayerCn.BgA > div.EcBgA > div.TPlayer.embed_div > div.TPlayerTb > iframe.no-you"
//       , attr: "data-src"
    
//   }
// }).then(({ data, response }) => {
//   promises.push(data);
// })

  
//   return Promise.all(promises);
// };

// const getPremiere= async() =>{
//   const res = await cloudscraper(`${CUEVANA_URL}peliculas-mas-valoradas` , {method: 'GET'});
//   const body = await res;
//   const $ = cheerio.load(body);
//   const promises = [];
//   const tmdb = [];

//   $('main section ul.MovieList li').each((index , element) =>{
    
//     const $element = $(element);
//     const year = $element.find('div.Image span.Year').text();
//     if ( year < 2020 ) return true;

//     const id = $element.find('div.TPost a').attr('href').split('/')[3];
//     const title = $element.find('div a h2.Title').text().replace(/(\([^\)]*\))/g, '');
//     const cover = $element.find('div.Image figure.Objf img').attr('data-src');
//     const description = $element.find('div.TPost.C.post-7544.post.type-post.status-publish.format-standard.has-post-thumbnail.hentry div div.Description p:nth-child(2)').text().replace('[...]','...');
//     const duration = $element.find('div.TPost.C.post-7544.post.type-post.status-publish.format-standard.has-post-thumbnail.hentry div p.Info span:nth-child(2)').text();

//     promises.push(getTmdbID(title, year).then(async extra => ({
//       id: id || null,
//       title: title || null,
//       cover: cover || null,
//       description: description || null,
//       duration: duration || null,
//       year: year || null,
//       tmdb: extra || null
//     })))
//   })
//   return Promise.all(promises);
// };

// const getRanking= async() =>{
//   const res = await cloudscraper(`${CUEVANA_URL}peliculas-mas-valoradas` , {method: 'GET'});
//   const body = await res;
//   const $ = cheerio.load(body);
//   const promises = [];
//   const tmdb = [];

//   $('main section ul.MovieList li').each((index , element) =>{
  
//     const $element = $(element);
//     const year = $element.find('div.Image span.Year').text();
//     if ( year < 2020 ) return true;

//     const id = $element.find('div.TPost a').attr('href').split('/')[3];
//     const title = $element.find('div a h2.Title').text().replace(/(\([^\)]*\))/g, '');
//     const cover = $element.find('div.Image figure.Objf img').attr('data-src');
//     const description = $element.find('div.TPost.C.post-7544.post.type-post.status-publish.format-standard.has-post-thumbnail.hentry div div.Description p:nth-child(2)').text().replace('[...]','...');
//     const duration = $element.find('div.TPost.C.post-7544.post.type-post.status-publish.format-standard.has-post-thumbnail.hentry div p.Info span:nth-child(2)').text();

//     promises.push(getTmdbID(title, year).then(async extra => ({
//       id: id || null,
//       title: title || null,
//       cover: cover || null,
//       description: description || null,
//       duration: duration || null,
//       year: year || null,
//       tmdb: extra || null
//     })))
//   })
//   return Promise.all(promises);
// };

// const getTrailer = async(type,id) => {
//   const res2 = await cloudscraper(`${TMDB}/${type}/${id}/videos?active_nav_item=Trailers&language=en` , {method: 'GET'});
//   const body2 = await res2;
//   const $$ = cheerio.load(body2);
//   const promises = [];

//   let video;

//   type === 'movie' ? video = $$('div.video.card.default > div.info.movie > div:nth-child(1) > h2 > a').attr('href')
//   : video = $$('div.video.card.default > div.info.tv_series > div:nth-child(1) > h2 > a').attr('href');

//   if (video.includes('youtube')) video = video.replace('watch?v=','embed/');
//   if (video.includes('vimeo')) video = video.replace('vimeo','player.vimeo').replace('.com/','.com/video/');

//   promises.push({
//     video: video || null
//   })

//   return Promise.all(promises);
// };


// const getTmdbID = async(title, year) => {
//   let res;
//   year ? res = await cloudscraper(`${TMDB_SEARCH}${title}%20y%3A${year}` , {method: 'GET'}) : res = await cloudscraper(`${TMDB_SEARCH}${title}` , {method: 'GET'});
//   const body = await res;
//   const $ = cheerio.load(body);
//   const promises = [];

//   const tmdbID = $('div.details > div.wrapper > div > div > a').attr('href');

//   if ( tmdbID === undefined ) return null;

//   const res2 = await cloudscraper(`${TMDB}${tmdbID}/images/logos?image_language=en` , {method: 'GET'});
//   const body2 = await res2;
//   const $$ = cheerio.load(body2);

//   const logo = $$('div.image_content > a.image').attr('href');

//   const res3 = await cloudscraper(`${TMDB}${tmdbID}/images/backdrops?image_language=xx` , {method: 'GET'});
//   const body3 = await res3;
//   const $$$ = cheerio.load(body3);

//   const background = $$$('div.image_content > a').attr('href');

//   promises.push({
//     tmdbID: tmdbID || null,
//     logo: logo ? 'https://image.tmdb.org'+logo.replace('.svg','.png') : null,
//     background: 'https://image.tmdb.org'+background || null,
//   })

//   return Promise.all(promises);
// };

// const getLogo = async(type,id) => {
//   const promises = [];

//   const res2 = await cloudscraper(`${TMDB}/${type}/${id}/images/logos?image_language=en` , {method: 'GET'});
//   const body2 = await res2;
//   const $$ = cheerio.load(body2);

//   const logo = $$('div.image_content > a.image').attr('href');


//   promises.push({
//     logo: logo ? 'https://image.tmdb.org'+logo.replace('.svg','.png') : null,
//   })

//   return Promise.all(promises);
// };

// const getLastSeries= async() =>{
//   const res = await cloudscraper(`${CUEVANA_URL}serie` , {method: 'GET'});
//   const body = await res;
//   const $ = cheerio.load(body);
//   const promises = [];

//   $('main div[id="tabserie-1"] ul.MovieList li').each((index , element) =>{
//     const $element = $(element);
//     const id = $element.find('div.TPost a').attr('href').split('/')[4];
//     const title = $element.find('div a h2.Title').text();
//     const cover = $element.find('div.Image figure.Objf img').attr('data-src');
//     const year = $element.find('div.Image span.Year').text();
//     const description = $element.find('div.TPost.C.post-7544.post.type-post.status-publish.format-standard.has-post-thumbnail.hentry div div.Description p:nth-child(2)').text().replace('[...]','...');
    
//     promises.push({
//       id: id || null,
//       title: title || null,
//       cover: cover || null,
//       year: year || null,
//       description: description || null,
//       duration: null,
//     })
//   })
//   return Promise.all(promises);
// };

// const getPremiereSeries= async() =>{
//   const res = await cloudscraper(`${CUEVANA_URL}serie` , {method: 'GET'});
//   const body = await res;
//   const $ = cheerio.load(body);
//   const promises = [];

//   $('main div[id="tabserie-2"] ul.MovieList li').each((index , element) =>{
//     const $element = $(element);
//     const id = $element.find('div.TPost a').attr('href').split('/')[4];
//     const title = $element.find('div a h2.Title').text();
//     const cover = $element.find('div.Image figure.Objf img').attr('data-src');
//     const year = $element.find('div.Image span.Year').text();
//     const description = $element.find('div.TPost.C.post-7544.post.type-post.status-publish.format-standard.has-post-thumbnail.hentry div div.Description p:nth-child(2)').text().replace('[...]','...');
    
//     promises.push({
//       id: id || null,
//       title: title || null,
//       cover: cover || null,
//       year: year || null,
//       description: description || null,
//       duration: null,
//     })
//   })
//   return Promise.all(promises);
// };

// const getRankingSeries= async() =>{
//   const res = await cloudscraper(`${CUEVANA_URL}serie` , {method: 'GET'});
//   const body = await res;
//   const $ = cheerio.load(body);
//   const promises = [];

//   $('main div[id="tabserie-3"] ul.MovieList li').each((index , element) =>{
//     const $element = $(element);
//     const year = $element.find('div.Image span.Year').text();
//     const id = $element.find('div.TPost a').attr('href').split('/')[4];
//     const title = $element.find('div a h2.Title').text();
//     const cover = $element.find('div.Image figure.Objf img').attr('data-src');
//     const description = $element.find('div.TPost.C.post-7544.post.type-post.status-publish.format-standard.has-post-thumbnail.hentry div div.Description p:nth-child(2)').text().replace('[...]','...');
    
//     promises.push(getTmdbID(title, year).then(async extra => ({
//       id: id || null,
//       title: title || null,
//       cover: cover || null,
//       year: year || null,
//       description: description || null,
//       duration: null,
//       tmdb: extra || null,
//     })))
//   })
//   return Promise.all(promises);
// };

// const getViewedSeries= async() =>{
//   const res = await cloudscraper(`${CUEVANA_URL}serie` , {method: 'GET'});
//   const body = await res;
//   const $ = cheerio.load(body);
//   const promises = [];

//   $('main div[id="tabserie-4"] ul.MovieList li').each((index , element) =>{
//     const $element = $(element);
//     const id = $element.find('div.TPost a').attr('href').split('/')[4];
//     const title = $element.find('div a h2.Title').text();
//     const cover = $element.find('div.Image figure.Objf img').attr('data-src');
//     const year = $element.find('div.Image span.Year').text();
//     const description = $element.find('div.TPost.C.post-7544.post.type-post.status-publish.format-standard.has-post-thumbnail.hentry div div.Description p:nth-child(2)').text().replace('[...]','...');
    
//     promises.push({
//       id: id || null,
//       title: title || null,
//       cover: cover || null,
//       year: year || null,
//       description: description || null,
//       duration: null,
//     })
//   })
//   return Promise.all(promises);
// };
