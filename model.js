const fs = require("fs");

//Nombre del fichero donde se guardan las preguntas.
//Es un fichero de texto con el JSON de quizzes.
const DB_FILENAME = "quizzes.json";

//Modelo de datos.
//En esta variable se mantienen todos los quizzes existentes.
//Es un array de objetos, donde cada objeto tiene los atributos quiestion
//y answer para guardar el texto de la pregunta y respuesta.
let quizzes = [
    {
        question : "Capital de Italia",
        answer : "Roma"
    },
    {
        question : "Capital de Francia",
        answer : "París"
    },
    {
        question : "Capital de España",
        answer : "Madrid"
    },
    {
        question : "Capital de Portugal",
        answer : "Lisboa"
    }
];





/**
*Carga el contenido del fichero DB_FILENAME (en formato .json) en la
*variable quizzes. La primera ves se producirá el error ENOENT
*y se salvará el contenido inicial almacenado en quizzes.
*
*
*/
const load = () => {
    fs.readFile(DB_FILENAME, (err, data) => {
        if(err){
            //La primera vez no existe el fichero. Lo creamos
            if(err.code === "ENOENT") {
                save(); //escribo el fichero con quizzes.
                return;
            }
            throw err;
        }
        let json = JSON.parse(data); //cojo los datos en formato json y lo parseo para sea apto para quizzes.
        if(json){
            quizzes = json;
        }
    });
};


/**
*Guarda las preguntas en el fichero.
*Las guarda en formato JSON el valor de quizzes en el fichero DB_FILENAME.
*
*/
const save = () => {
    fs.writeFile(DB_FILENAME, 
        JSON.stringify(quizzes),
        err => {
            if(err) throw err;
        });
};








/**
*Devuelve el numero total de preguntas existentes.
*
*@returns {number} - numero tot. de preg. existentes.
*/
exports.count = () => quizzes.length;

/**
*Añade un nuevo quizz.
*
*@param question - string con la pregunta.
*@param answer - string con la respuesta.
*/
exports.add = (question, answer) => {
    quizzes.push({
        question: (question || "").trim(),
        answer: (answer || "").trim()
    });
    save();
};

/**
*Actualiza el quiz situado en la pos. index.
*
*@param id - clave que identifica el quiz a actualizar.
*@param question - string con la pregunta.
*@param answer - string con la respuesta.
*/
exports.update = (id, question, answer) => {
    const quiz = quizzes[id];
    if (typeof quiz === "undefined") {
        throw new Error(`El valor del parámetro id no es válido.`);
    }
    quizzes.splice(id, 1, {
        question: (question || "").trim(),
        answer: (answer || "").trim()
    });
    save();
};

/**
*Devuelve todos los quizzes existentes (un clon).
*Para clonar se usa stringify + parse.
*
*@returns {any}
*/
exports.getAll = () => JSON.parse(JSON.stringify(quizzes));


/**
*Devuelve un clon del quizz almacenado en la posición dada.
*
*@param id - clave que identifica el quiz a conseguir.
*@returns {question, answer} - devuelve el objeto quiz de la posición dada.
*/
exports.getByIndex = id => {
    const quiz = quizzes[id];
    if (typeof quiz === "undefined") {
        throw new Error(`El valor del parámetro id no es válido.`);
    }
    return JSON.parse(JSON.stringify(quiz));
};


/**
*Elimina el quiz situado en la posición dada.
*
*@param id - clave que identifica el quiz a eliminar.
*/
exports.deleteByIndex = id => {
    const quiz = quizzes[id];
    if (typeof quiz === "undefined") {
        throw new Error(`El valor del parámetro id no es válido.`);
    }
    quizzes.splice(id, 1);
    save();
};

//Carga los quizzes almacenados en el fichero.
load();