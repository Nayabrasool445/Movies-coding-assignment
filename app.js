const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
db = null;
app.use(express.json());
dbPath = path.join(__dirname, "moviesData.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorDbObjectToResponseObject = (eachDirector) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//get movies name
app.get("/movies/", async (request, response) => {
  const getMoviesNameQuery = `SELECT movie_name
     FROM movie;`;
  const moviesList = await db.all(getMoviesNameQuery);
  response.send(
    moviesList.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

//add movie
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMoviesNameQuery = `
  INSERT INTO movie ( director_id, movie_name, lead_actor)
  VALUES  (${directorId}, '${movieName}', '${leadActor}');`;
  await db.run(addMoviesNameQuery);
  response.send("Movie Successfully Added");
  //console.log("Movie added successfully");
});

//returns a movie name based on id

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetailsQuery = `SELECT *
         FROM movie
    WHERE 
         movie_id = ${movieId};`;
  const movieObj = await db.get(getMovieDetailsQuery);
  response.send(convertDbObjectToResponseObject(movieObj));
});

//update
app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieDetailsQuery = `
        UPDATE 
          movie
        SET 
          director_id = ${directorId},
          movie_name = '${movieName}',
          leadActor =  '${leadActor}'
        WHERE 
          movie_id = ${movieId};`;

  await db.run(updateMovieDetailsQuery);
  response.send("Movie Details Updated");
});

//delete

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieDetailsQuery = `DELETE FROM movie
   WHERE 
         movie_id = ${movieId};`;
  await db.run(deleteMovieDetailsQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT
      *
    FROM
      director;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) =>
      convertDirectorDbObjectToResponseObject(eachDirector)
    )
  );
});

//return movie directed by specific director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieDirectorQuery = `
        SELECT 
           movie_name
        FROM 
           movie
        WHERE 
          director_id = '${directorId}';`;
  const moviesDetails = await db.get(getMovieDirectorQuery);
  response.send(
    movieDetails.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

module.exports = app;
