const express = require('express');
const router = express.Router();
const api = require('../api');
const otakustv = require('otakustv');
const malScraper = require('mal-scraper');

///RUTAS CUEVANA
router.get('/getTrending/:type' , (req , res) =>{
  let type = req.params.type;
  api.getTrending(type)
    .then(result =>{
      res.status(200).json(result);
    }).catch((err) =>{
      console.error(err);
    });
});


router.get('/getFanpelisLinks/:id' , (req , res) =>{
  let id = req.params.id;
  api.getFanpelisLinks(id)
    .then(result =>{
      res.status(200).json({result});
    }).catch((err) =>{
      console.error(err);
    });
});

router.get('/getFanpelisLinksSerie/:id/:season/:episode' , (req , res) =>{
  let id = req.params.id;
  let season = req.params.season;
  let episode = req.params.episode;
  api.getFanpelisLinksSerie(id, season, episode)
    .then(result =>{
      res.status(200).json({result});
    }).catch((err) =>{
      console.error(err);
    });
});

router.get('/getMegadedeLinks/:type/:id' , (req , res) =>{
  let type = req.params.type;
  let id = req.params.id;
  api.getMegadedeLinks(type, id)
    .then(result =>{
      res.status(200).json({result});
    }).catch((err) =>{
      console.error(err);
    });
});



router.get('/getCuevanaLinks/:type/:id' , (req , res) =>{
  let type = req.params.type;
  let id = req.params.id;
  api.getCuevanaLinks(type, id)
    .then(result =>{
      res.status(200).json({result});
    }).catch((err) =>{
      console.error(err);
    });
});

router.get('/getCuevanaLinksSerie/:type/:id/:season/:episode' , (req , res) =>{
  let type = req.params.type;
  let id = req.params.id;
  let season = req.params.season;
  let episode = req.params.episode;
  api.getCuevanaLinksSerie(type, id, season, episode)
    .then(result =>{
      res.status(200).json({result});
    }).catch((err) =>{
      console.error(err);
    });
});

router.get('/getRecommendations/:type/:id' , (req , res) =>{
  let type = req.params.type;
  let id = req.params.id;
  api.getRecommendations(type,id)
    .then(result =>{
      res.status(200).json(result);
    }).catch((err) =>{
      console.error(err);
    });
});


router.post('/getSearchId' , (req , res) =>{
  let title = req.body.title;
  let original = req.body.original;
  api.getSearchId(title,original)
    .then(result =>{
      res.status(200).json({result});
    }).catch((err) =>{
      console.error(err);
    });
});

router.get('/getListMovie/:type/:sort/:genre/:company/:director' , (req , res) =>{
  let type = req.params.type;
  let sort = req.params.sort;
  let genre = req.params.genre;
  let company = req.params.company;
  let director = req.params.director;
  api.getListMovie(type, sort, genre, company, director)
    .then(result =>{
      res.status(200).json(result);
    }).catch((err) =>{
      console.error(err);
    });
});

router.get('/getListMovieDesktop/:type/:sort/:genre/:company/:director' , (req , res) =>{
  let type = req.params.type;
  let sort = req.params.sort;
  let genre = req.params.genre;
  let company = req.params.company;
  let director = req.params.director;
  api.getListMovieDesktop(type, sort, genre, company, director)
    .then(result =>{
      res.status(200).json(result);
    }).catch((err) =>{
      console.error(err);
    });
});

router.get('/getHeaderMovies/:type/:sort/:genre' , (req , res) =>{
  let type = req.params.type;
  let sort = req.params.sort;
  let genre = req.params.genre;
  api.getHeaderMovies(type, sort, genre)
    .then(result =>{
      res.status(200).json(result);
    }).catch((err) =>{
      console.error(err);
    });
});

router.get('/getTrailer/:type/:id' , (req , res) =>{
  let id = req.params.id;
  let type = req.params.type;
  api.getTrailer(type, id)
    .then(result =>{
      res.status(200).json(result);
    }).catch((err) =>{
      console.error(err);
    });
});

router.get('/getSeasons/:id' , (req , res) =>{
  let id = req.params.id;
  api.getSeasons(id)
    .then(result =>{
      res.status(200).json(result);
    }).catch((err) =>{
      console.error(err);
    });
});

router.get('/getEpisodes/:id/:season' , (req , res) =>{
  let id = req.params.id;
  let season = req.params.season;
  api.getEpisodes(id, season)
    .then(result =>{
      res.status(200).json(result);
    }).catch((err) =>{
      console.error(err);
    });
});

router.get('/getCrew/:type/:id' , (req , res) =>{
  let id = req.params.id;
  let type = req.params.type;
  api.getCrew(type, id)
    .then(result =>{
      res.status(200).json(result);
    }).catch((err) =>{
      console.error(err);
    });
});

router.get('/getCollection/:id' , (req , res) =>{
  let id = req.params.id;
  api.getCollection(id)
    .then(result =>{
      res.status(200).json(result);
    }).catch((err) =>{
      console.error(err);
    });
});

router.get('/getByGenres/:type/:ids' , (req , res) =>{
  let type = req.params.type;
  let ids = req.params.ids;
  api.getByGenres(type,ids)
    .then(result =>{
      res.status(200).json(result);
    }).catch((err) =>{
      console.error(err);
    });
});

router.get('/getByGenresDesktop/:type/:ids' , (req , res) =>{
  let type = req.params.type;
  let ids = req.params.ids;
  api.getByGenresDesktop(type,ids)
    .then(result =>{
      res.status(200).json(result);
    }).catch((err) =>{
      console.error(err);
    });
});

router.get('/getGenres/:type' , (req , res) =>{
  let type = req.params.type;
  api.getGenres(type)
    .then(result =>{
      res.status(200).json(result);
    }).catch((err) =>{
      console.error(err);
    });
});

router.get('/getSearch/:query' , (req , res) =>{
  let query = req.params.query;
  api.getSearch(query)
    .then(result =>{
      res.status(200).json(result);
    }).catch((err) =>{
      console.error(err);
    });
});

router.get('/getMovie/:type/:id' , (req , res) =>{
  let type = req.params.type;
  let id = req.params.id;
  api.getMovie(type, id)
    .then(result =>{
      res.status(200).json({result});
    }).catch((err) =>{
      console.error(err);
    });
});


router.get('/getLogo/:type/:id' , (req , res) =>{
  let id = req.params.id;
  let type = req.params.type;
  api.getLogo(type, id)
    .then(result =>{
      res.status(200).json({result});
    }).catch((err) =>{
      console.error(err);
    });
});

router.get('/getTrailer/:type/:id' , (req , res) =>{
  let type = req.params.type;
  let id = req.params.id;
  api.getTrailer(type,id)
    .then(result =>{
      res.status(200).json({result});
    }).catch((err) =>{
      console.error(err);
    });
});

module.exports = router;
