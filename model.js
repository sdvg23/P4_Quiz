//cargo módulo sequelize
const Sequelize = require('sequelize');
//nombre donde se guarda la base de datos de las preguntas.sqlite es el modo de acceder a ellas.
const sequelize = new Sequelize("sqlite:quizzes.sqlite", {logging: false});

//defino el modelo quiz
sequelize.define('quiz', {
    question: {
        type : Sequelize.STRING,
        unique: {msg: "Ya existe esta pregunta."},
        validate: {notEmpty: {msg: "La pregunta no puede estar vacía."}}
    },
    answer: {
        type: Sequelize.STRING,
        validate: {notEmpty: {msg: "La respuesta no puede estar vacía."}}
    }
});

sequelize.sync()
.then(() => sequelize.models.quiz.count())
.then(count => {    //los then son promesas
    if(!count){
        //Modelo de datos.
        //Aquí se guardan todos los quizzes existentes.
        //Es un array de objetos, donde cada objeto tiene los atributos question
        //y answer para guardar el texto de la pregunta y respuesta.
        return sequelize.models.quiz.bulkCreate([
            {question : "Capital de Italia",answer : "Roma"},
            {question : "Capital de Francia",answer : "París"},
            {question : "Capital de España",answer : "Madrid"},
            {question : "Capital de Portugal",answer : "Lisboa"}
        ]);
    }
})
.catch(error => {
    log(error);
});

module.exports = sequelize;