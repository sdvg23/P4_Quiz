const Sequelize = require('sequelize');
//saco models de sequelize para con el require ya tener la propiedad models para acceder 
//.quiz o al modelo que sea.
const {models} = require('./model');

const {log, biglog, errorlog, colorize} = require('./out');

/**
*Muestra la ayuda.
*
*@param rl - Objeto readline usado para implementar el CLI.
*/
exports.helpCmd = rl => {
    log("Comandos:");
    log("    h|help - Muestra esta ayuda.");
    log("    list - Listar los quizzes existentes.");
    log("    show <id> - Muestra la pregunta y respuesta del quiz indicado.");
    log("    add - Añadir un nuevo quiz interactivamente.");
    log("    delete <id> - Borrar el quiz indicado.");
    log("    edit <id> - Editar el quiz indicado.");
    log("    test <id> - Probar el quiz indicado.");
    log("    p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
    log("    credits - Créditos.");
    log("    q|quit - Salir del programa.");
    rl.prompt();
};

/**
*Lista todos los quizzes existentes en el modelo.
*
*@param rl - Objeto readline usado para implementar el CLI.
*/
exports.listCmd = rl => {
    log('Quizzes existentes:', 'red');
    models.quiz.findAll() //promesa
    //hago uso de una librería (blue bird) de sqlite para ahorrarme código, 
    //de manera que ahora (con each) voy cogiendo directamente cada uno de los quizzes de quiz.
    //en lugar de hacer un then e iterar, el each me lo hace solo.
    .each(quiz => {     
        log(` [${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
    })
    .catch(error => {
        errorlog(error.message);
    })
    .then(() => {
        rl.prompt();
    });
};

/**
*Función que devuelve una promesa que:
*   -valida que se ha introducido un valor para el parámetro.
*   -convierte el parámetro en un número entero.
*Si todo va bien, la promesa se satisface y devuelve un valor de id al usuario.
*
*@param id - parámetro con el índice a validar.
*/
const validateId = id => {
    return new Sequelize.Promise((resolve, reject) => {
        if(typeof id === "undefinded") {
            reject(new Error(`Falta el parámetro <id>.`));
        } else {
            id = parseInt(id); //cojo la parte entera y descarto lo demás.
            if(Number.isNaN(id)){
                reject(new Error(`El valor del parámetro <id> no es un número.`));
            } else {
                resolve(id);
            }
        }
    });
};

/**
*Muestra el quiz indicado en el parámetro: pregunta y respuesta.
*
*@param rl - Objeto readline usado para implementar el CLI.
*@param id - clave que identifica el quiz a mostrar.
*/
exports.showCmd = (rl, id) => { 
    validateId(id)
    .then(id => models.quiz.findById(id))
    .then(quiz => {
        if(!quiz){
            throw new Error(`No existe un quiz asociado al id=${id}.`);
        }
        log(` [${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
    })
    .catch(error => {
        errorlog(error.message);
    })
    .then(() => {
        rl.prompt();
    });
};

/**
*Función que devuelve una promsea que cuando se cumple, proporciona el texto introducido.
*Entonces la llamada a then que hay que hacer la promesa devuelta será:
*   .then(answer => {...})
*
*Tambiém colorea de rojo la pregunta y elimina espacios al principio y final.
*
*@param rl - Objeto readline usado para implementar el CLI.
*@param text - Pregunta que hay qe hacerle al usuario.
*/
const makeQuestion = (rl, text) => {
    return new Sequelize.Promise((resolve, reject) => {
        rl.question(colorize(text, 'red'), answer => {
            resolve(answer.trim());
        });
    });
};

/**
*Añade un nuevo quiz al modelo.
*Modificado respecto a P2 al añadir promesas para los callbacks
*Pregunta interactivamente por la pregunta y la respuesta.
*
*@param rl - Objeto readline usado para implementar el CLI.
*/
exports.addCmd = rl => {
    makeQuestion(rl, ' Introduzca una pregunta: ')
    .then(q => {
        return makeQuestion(rl, ' Introduzca la respuesta: ')
        .then(a => {
            return {question: q, answer: a};
        });
    })
    .then(quiz => {
        return models.quiz.create(quiz);
    })
    .then((quiz) => {
        log(` ${colorize('Se ha añadido', 'magenta')}: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
    })
    .catch(Sequelize.ValidationError, error => {        //Squelize.ValidateError es el tipo de error que esperamos encontrar
        errorlog('El quiz es erróneo:');
        error.errors.forEach(({message}) => errorlog(message));
    })
    .catch(error => {
        errorlog(error.message);
    })
    .then(() => {
        rl.prompt();
    });   
};

/**
*Borra un quiz del modelo.
*
*@param rl - Objeto readline usado para implementar el CLI.
*@param id - clave que identifica el quiz a borrar.
*/
exports.deleteCmd = (rl, id) => {
    validateId(id)
    .then(id => models.quiz.destroy({where: {id}}))
    .catch(error => {
        errorlog(error.message);
    })
    .then(() => {
        rl.prompt();
    });
};

/**
*Edita un quiz del modelo.
*
*@param rl - Objeto readline usado para implementar el CLI.
*@param id - clave que identifica el quiz a editar.
*/
exports.editCmd = (rl, id) => {
    validateId(id)
    .then(id => models.quiz.findById(id))
    .then(quiz => {
        if(!quiz){
            throw new Error(`No existe un quiz asociado al id=${id}.`);
        }
        process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);
        return makeQuestion(rl, ' Introduzca una pregunta: ')
        .then(q => {
            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)}, 0);
            return makeQuestion(rl, ' Introduzca la respuesta: ')
            .then(a => {
                quiz.question = q;
                quiz.answer = a;
                return quiz;
            });
        });
    })
    .then(quiz => {
        return quiz.save();
    })
    .then(quiz => {
        log(` Se ha cambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
    })
    .catch(Sequelize.ValidationError, error => {        //Squelize.ValidateError es el tipo de error que esperamos encontrar
        errorlog('El quiz es erróneo:');
        error.errors.forEach(({message}) => errorlog(message));
    })
    .catch(error => {
        errorlog(error.message);
    })
    .then(() => {
        rl.prompt();
    });  
};

/**
*Prueba un quiz. Hace una pregunta que debemos contestar.
*
*@param rl - Objeto readline usado para implementar el CLI.
*@param id - clave que identifica el quiz a probar.
*/
exports.testCmd = (rl, id) => {
    validateId(id)
    .then(id => models.quiz.findById(id))
    .then(quiz => {
        if(!quiz){
            throw new Error(`No existe un quiz asociado al id=${id}.`);
        }
        return makeQuestion(rl, `${quiz.question} `)
        .then(a => {
            let answ = a.toLowerCase().trim();      //Quito los espacios en blanco a der. e izq. del string answer y paso a minúsculas
            if(answ === quiz.answer.toLowerCase()){     //Comparo con la respuesta pasada a minúsculas también
                    log('Su respuesta es correcta.');
                } else {
                    log('Su respuesta es incorrecta.');
            }
        });
    })
    .catch(error => {
        errorlog(error.message);
    })
    .then(() => {
        rl.prompt();
    }); 
};

/**
*Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
*Se gana si se contesta bien a todos.
*
*@param rl - Objeto readline usado para implementar el CLI.
*/
exports.playCmd = rl => {
    let score = 0;                                      //número de preguntas acertadas
    let toBeResolved = [];                              //array de las preguntas que quedan por contestar
    models.quiz.findAll() //promesa
    //hago uso de una librería (blue bird) de sqlite para ahorrarme código, 
    //de manera que ahora (con each) voy cogiendo directamente cada uno de los quizzes de quiz.
    //en lugar de hacer un then e iterar, el each me lo hace solo.
    .each(quiz => {     
        toBeResolved.push(quiz.id);
    })
    .then(() => {
        let tBRl = toBeResolved.length;
        models.quiz.findOne({order: [['id', 'DESC']]})
        .then (lastid => {
            tBRl = lastid.get('id');
            const playOne = () => {
                if (toBeResolved.length <= 0){
                log(`No hay nada más que preguntar. Fin del examen. Aciertos: `);
                log(score);
                rl.prompt();
                } else {
                    const findId = () => {                         //función que devuelve un valor random que esté en el array {0-tamaño array}
                        return new Sequelize.Promise((resolve, reject) => {
                            let rand = Math.round(Math.random()*tBRl);
                            while (!toBeResolved.includes(rand)){
                                rand = Math.round(Math.random()*tBRl);                                
                            }
                            resolve(rand);
                        });     
                    };
                    findId()
                    .then(id => {
                        toBeResolved.splice(toBeResolved.indexOf(id), 1);                                     //elimino del array la POS de ese ID   , no el id en sí.                                
                        validateId(id)
                        .then(id => models.quiz.findById(id))
                        .then(quiz => {
                            if(!quiz){
                                throw new Error(`No existe un quiz asociado al id=${id}.`);
                            }
                            return makeQuestion(rl, `${quiz.question} `)
                            .then(a => {
                                let answ = a.toLowerCase().trim();      //Quito los espacios en blanco a der. e izq. del string answer y paso a minúsculas
                                if(answ === quiz.answer.toLowerCase()){                         
                                    score++;
                                    console.log(`Respuesta correcta. Lleva ${score} aciertos.`);
                                    playOne();
                                } else {
                                    console.log(`Respuesta incorrecta. Fin del examen. Aciertos: `);
                                    console.log(score);
                                    rl.prompt();
                                }
                            });
                        });
                    })
                    .catch(error => {
                        errorlog(error.message);
                    })
                    .then(() => {
                        rl.prompt();
                    });     
                }      
            };  
            playOne();

        });
    })
    .catch(error => {
        errorlog(error.message);
    })
    .then(() => {
        rl.prompt();
    });
};

/**
*Muestra los nombres de los autores de la práctica.
*
*@param rl - Objeto readline usado para implementar el CLI.
*/
exports.creditsCmd = rl => {
    log('Autores de la práctica', 'blue');
    log('sdvg23 SARA', 'green');
    rl.prompt();
};

/**
*Terminar el programa.
*
*@param rl - Objeto readline usado para implementar el CLI.
*/
exports.quitCmd = rl => {
    rl.close();
};